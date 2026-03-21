import cards from '../data/cards.json';

const activeCards = cards.filter((c) => c.active !== false);

/**
 * Build a system prompt for the Gemini API advisor
 */
export function buildSystemPrompt() {
  // Compact card catalog for name→ID resolution
  const catalog = activeCards
    .map((c) => `${c.id}: ${c.name} (${c.issuer})`)
    .join('\n');

  return `You are CardPath AI, a friendly and knowledgeable credit card advisor for young adults. Your tone is conversational, direct, and encouraging — like a financially savvy older sibling.

Rules:
- Always include specific numbers (credit scores, income estimates, timelines, percentages)
- Mention both pros AND cons honestly — never guarantee approval
- Reference the user's specific profile data when giving advice
- Keep paragraphs concise (3-5 sentences max per point)
- Use plain language, avoid jargon unless you explain it
- Address the user by their first name when it's available in the profile
- If the user's situation is risky (high utilization, too many recent applications), say so directly but kindly
- Never recommend cards the user clearly can't qualify for without acknowledging the gap
- When comparing cards, use specific reward rates and annual fees
- When recommending cards, always calculate estimated annual rewards based on the user's actual spending breakdown. A card with 4x on dining is more valuable than a 1x everything card if the user spends $500/mo on dining.
- Consider the total value proposition: annual fee vs rewards earned vs perks used. A $250 AF card earning $600 in rewards beats a $550 AF card earning $700 if the user won't use the extra perks.
- Format responses with **bold topic headers** instead of numbered lists.
- Never use numbered lists (1. 2. 3.) — use bold headers to separate sections instead.

Tools:
You have tools to modify the user's profile. Use them when the user asks to:
- Add or remove a card from their wallet → use add_card / remove_card
- Set or clear their dream/goal card → use set_dream_card
- Update their monthly spending → use update_spending to PROPOSE new values, then explain what you're proposing
- Update their preferred credit limit → use update_credit_limit to PROPOSE a new value

When the user describes themselves or their lifestyle (e.g. "I'm a college student spending $200/mo on food"), call update_spending with reasonable estimates for all 8 categories based on their description. Keep categories they didn't mention at their current values (from the profile) or at 0 if not set.

When matching card names, use the closest match from this catalog. Always use the exact card ID from the catalog:
${catalog}`;
}

/**
 * Build context about the user's profile for the AI
 */
export function buildUserContext(profile) {
  const currentCardNames = (profile.currentCards || [])
    .map((id) => {
      const card = cards.find((c) => c.id === id);
      return card ? card.name : id;
    })
    .join(', ');

  const spending = profile.monthlySpending || {};
  const totalMonthly = Object.values(spending).reduce((s, v) => s + (v || 0), 0);

  const priorityLabels = {
    'cashback': 'Cash Back',
    'travel-rewards': 'Travel Rewards',
    'build-credit': 'Build Credit',
    'low-apr': 'Low APR',
    'no-annual-fee': 'No Annual Fee',
    'sign-up-bonus': 'Sign-up Bonuses',
  };
  const rankedPriorities = (profile.priorities || [])
    .map((key, i) => `${i + 1}. ${priorityLabels[key] || key}`)
    .join(', ');

  return `USER PROFILE:
- Name: ${profile.name || 'User'}
- Age: ${profile.age || 'Unknown'}
- Annual income: $${profile.income ? profile.income.toLocaleString() : 'Unknown'}
- Employment: ${profile.employmentStatus || 'Unknown'}
- Monthly housing cost: $${profile.monthlyHousingCost || 0}
- Credit score: ${profile.creditScore || 'Unknown'} (awareness: ${profile.creditScoreAwareness || 'Unknown'})
- Credit history length: ${profile.creditHistoryMonths || 0} months
- Number of credit cards: ${profile.numCreditCards || 0}
- Oldest card age: ${profile.oldestCardAge || 'Unknown'}
- Recent applications (last 6 months): ${profile.recentApplications || 0}
- Current cards: ${currentCardNames || 'None'}
- Monthly spending: $${totalMonthly.toLocaleString()} total (Dining: $${spending.dining || 0}, Groceries: $${spending.groceries || 0}, Travel: $${spending.travel || 0}, Gas: $${spending.gas || 0}, Online shopping: $${spending.onlineShopping || 0}, Entertainment: $${spending.entertainment || 0}, Subscriptions: $${spending.subscriptions || 0}, Transportation: $${spending.transportation || 0})
- Future spending intent: ${profile.futureSpendingIntent || 'Not specified'}${profile.futureSpendingDescription ? ` — ${profile.futureSpendingDescription}` : ''}
- Priorities (ranked): ${rankedPriorities || 'Not specified'}
- Dream card: ${profile.dreamCard ? (cards.find((c) => c.id === profile.dreamCard)?.name || profile.dreamCard) : 'Not set'}
- Preferred minimum credit limit: ${profile.preferredCreditLimit ? `$${profile.preferredCreditLimit.toLocaleString()}` : 'No preference'}
- Spending data: ${profile.spendingSource || 'not set'} (${profile.spendingEnabled === false ? 'not considered' : 'active'})`;
}

/**
 * Build a prompt for general advice
 */
export function buildAdvicePrompt(profile) {
  return `${buildUserContext(profile)}

Give a SHORT personalized credit card recommendation (3-4 sentences max). Use **bold** for the card name only. Include:
- Name ONE specific card and why it fits their top spending category
- The estimated annual reward value (one line, e.g. "$X/yr back")
- One quick tip

Keep it brief and punchy — this is a dashboard summary, not a full report. No section headers. Address them by first name.`;
}

/**
 * Build a prompt for a specific question
 */
export function buildQuestionPrompt(profile, question) {
  return `${buildUserContext(profile)}

USER QUESTION: ${question}

Answer this specific question using the user's profile data. Be direct, include numbers, and give actionable next steps.`;
}

/**
 * Build a prompt for card comparison
 */
export function buildComparisonPrompt(profile, cardIds) {
  const cardDetails = cardIds
    .map((id) => cards.find((c) => c.id === id))
    .filter(Boolean)
    .map((c) => `${c.name} (${c.issuer}): $${c.annualFee} AF, ${c.rewards.categories.map((cat) => `${cat.rate} ${cat.category}`).join(', ')}. SUB: ${c.signUpBonus || 'None'}. Score needed: ${c.creditScoreMin}+.`)
    .join('\n');

  return `${buildUserContext(profile)}

CARDS TO COMPARE:
${cardDetails}

Compare these cards specifically for this user's profile and spending habits. Recommend which one is the better fit and why. Include specific dollar estimates of annual rewards based on their spending.`;
}

/**
 * Build a prompt to project spending changes via Gemini
 */
export function buildSpendingProjectionPrompt(currentSpending, changeDescription) {
  const categories = Object.entries(currentSpending)
    .map(([k, v]) => `${k}: $${v}/mo`)
    .join(', ');

  return `A user currently spends: ${categories}

They described upcoming changes to their spending: "${changeDescription}"

Based on this description, return ONLY a valid JSON object (no markdown, no explanation) with adjusted monthly spending for these exact categories: dining, groceries, travel, gas, onlineShopping, entertainment, subscriptions, transportation.

Each value should be a reasonable integer dollar amount. Only adjust categories that the user's description logically affects. Example format:
{"dining":200,"groceries":400,"travel":100,"gas":80,"onlineShopping":150,"entertainment":50,"subscriptions":30,"transportation":60}`;
}

/**
 * Build a prompt for initial recommendation on dashboard load
 */
export function buildInitialRecommendationPrompt(profile) {
  return `${buildUserContext(profile)}

This user just completed onboarding. Give them a brief, encouraging welcome message (2-3 sentences) that:
1. Acknowledges their current financial position positively
2. Names one specific card they should look at first based on their priorities and spending
3. Gives one quick actionable tip

Keep it warm and concise — this is the first thing they see on their dashboard.`;
}

/**
 * Build Gemini function-calling tool definitions
 */
export function buildToolDefinitions() {
  return [
    {
      functionDeclarations: [
        {
          name: 'add_card',
          description: 'Add a credit card to the user\'s current wallet. Use the exact card ID from the catalog.',
          parameters: {
            type: 'OBJECT',
            properties: {
              cardId: { type: 'STRING', description: 'The card ID to add (e.g. "chase-sapphire-preferred")' },
            },
            required: ['cardId'],
          },
        },
        {
          name: 'remove_card',
          description: 'Remove a credit card from the user\'s current wallet.',
          parameters: {
            type: 'OBJECT',
            properties: {
              cardId: { type: 'STRING', description: 'The card ID to remove' },
            },
            required: ['cardId'],
          },
        },
        {
          name: 'set_dream_card',
          description: 'Set the user\'s dream/goal card. Use "none" to clear it.',
          parameters: {
            type: 'OBJECT',
            properties: {
              cardId: { type: 'STRING', description: 'The card ID to set as dream card, or "none" to clear' },
            },
            required: ['cardId'],
          },
        },
        {
          name: 'update_spending',
          description: 'Propose a new monthly spending breakdown for the user. Always use this when the user describes their spending habits or lifestyle changes. The user will be asked to confirm before it\'s applied.',
          parameters: {
            type: 'OBJECT',
            properties: {
              dining: { type: 'INTEGER', description: 'Monthly dining/restaurants spend in dollars' },
              groceries: { type: 'INTEGER', description: 'Monthly groceries spend in dollars' },
              travel: { type: 'INTEGER', description: 'Monthly travel spend in dollars' },
              gas: { type: 'INTEGER', description: 'Monthly gas/fuel spend in dollars' },
              onlineShopping: { type: 'INTEGER', description: 'Monthly online shopping spend in dollars' },
              entertainment: { type: 'INTEGER', description: 'Monthly entertainment spend in dollars' },
              subscriptions: { type: 'INTEGER', description: 'Monthly subscriptions spend in dollars' },
              transportation: { type: 'INTEGER', description: 'Monthly transportation (rideshare/transit) spend in dollars' },
            },
            required: ['dining', 'groceries', 'travel', 'gas', 'onlineShopping', 'entertainment', 'subscriptions', 'transportation'],
          },
        },
        {
          name: 'update_credit_limit',
          description: 'Propose a new preferred minimum credit limit for the user. The user will be asked to confirm before it\'s applied.',
          parameters: {
            type: 'OBJECT',
            properties: {
              creditLimit: { type: 'INTEGER', description: 'The preferred minimum credit limit in dollars' },
            },
            required: ['creditLimit'],
          },
        },
      ],
    },
  ];
}
