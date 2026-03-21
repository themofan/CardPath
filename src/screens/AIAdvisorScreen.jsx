import React, { useState, useRef, useCallback, useEffect } from 'react';
import { useUser } from '../context/UserContext';
import { chatWithTools, isAPIConfigured } from '../api/gemini';
import { buildUserContext, buildToolDefinitions } from '../api/aiPromptBuilder';
import cards from '../data/cards.json';
import Markdown from '../components/Markdown';
import { Plus } from 'lucide-react';

const QUICK_QUESTIONS = [
  "What card should I get next?",
  "Am I ready for the Chase Sapphire Preferred?",
  "How can I improve my credit score?",
  "What's the best cashback card for me?",
  "Compare my current cards — am I missing value?",
  "What's the best card for my top spending category?",
  "Should I downgrade any of my cards?",
  "How close am I to my dream card?",
  "What sign-up bonuses can I realistically get right now?",
];

const SPENDING_LABELS = {
  dining: 'Dining',
  groceries: 'Groceries',
  travel: 'Travel',
  gas: 'Gas',
  onlineShopping: 'Online Shopping',
  entertainment: 'Entertainment',
  subscriptions: 'Subscriptions',
  transportation: 'Transportation',
};

// Tools that require user confirmation before applying
const CONFIRMATION_TOOLS = new Set(['update_spending', 'update_credit_limit']);

function SpendingConfirmation({ data, onConfirm, onReject, resolved }) {
  const total = Object.values(data).reduce((s, v) => s + (v || 0), 0);
  return (
    <div className="bg-surface rounded-xl p-3 my-1">
      <p className="text-secondary-700 text-xs font-bold uppercase tracking-wider mb-2">Proposed Monthly Spending</p>
      <div className="grid grid-cols-2 gap-x-4 gap-y-1 mb-2">
        {Object.entries(SPENDING_LABELS).map(([key, label]) => (
          <div key={key} className="flex justify-between">
            <span className="text-secondary-500 text-xs">{label}</span>
            <span className="text-secondary-700 text-xs font-semibold">${data[key] || 0}</span>
          </div>
        ))}
      </div>
      <div className="flex justify-between border-t border-border pt-1.5 mb-2.5">
        <span className="text-secondary-700 text-xs font-bold">Total</span>
        <span className="text-primary text-xs font-bold">${total}/mo</span>
      </div>
      {resolved === null ? (
        <div className="flex gap-2">
          <button
            onClick={onConfirm}
            className="flex-1 bg-primary text-white text-xs font-semibold py-1.5 rounded-lg cursor-pointer hover:bg-primary/90 transition-colors"
          >
            Apply
          </button>
          <button
            onClick={onReject}
            className="flex-1 bg-[#2C2420] text-secondary-500 text-xs font-semibold py-1.5 rounded-lg border border-border cursor-pointer hover:bg-surface transition-colors"
          >
            Dismiss
          </button>
        </div>
      ) : (
        <p className={`text-xs font-semibold text-center ${resolved === 'confirmed' ? 'text-primary' : 'text-secondary-400'}`}>
          {resolved === 'confirmed' ? 'Applied' : 'Dismissed'}
        </p>
      )}
    </div>
  );
}

function CreditLimitConfirmation({ creditLimit, onConfirm, onReject, resolved }) {
  return (
    <div className="bg-surface rounded-xl p-3 my-1">
      <p className="text-secondary-700 text-xs font-bold uppercase tracking-wider mb-2">Proposed Credit Limit</p>
      <p className="text-primary text-lg font-bold mb-2.5">${creditLimit.toLocaleString()}</p>
      {resolved === null ? (
        <div className="flex gap-2">
          <button
            onClick={onConfirm}
            className="flex-1 bg-primary text-white text-xs font-semibold py-1.5 rounded-lg cursor-pointer hover:bg-primary/90 transition-colors"
          >
            Apply
          </button>
          <button
            onClick={onReject}
            className="flex-1 bg-[#2C2420] text-secondary-500 text-xs font-semibold py-1.5 rounded-lg border border-border cursor-pointer hover:bg-surface transition-colors"
          >
            Dismiss
          </button>
        </div>
      ) : (
        <p className={`text-xs font-semibold text-center ${resolved === 'confirmed' ? 'text-primary' : 'text-secondary-400'}`}>
          {resolved === 'confirmed' ? 'Applied' : 'Dismissed'}
        </p>
      )}
    </div>
  );
}

export default function AIAdvisorScreen({ messages, setMessages, apiHistoryRef, onNewChat }) {
  const { profile, dispatch } = useUser();
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef(null);

  const scrollToBottom = () => {
    setTimeout(() => {
      if (scrollRef.current) {
        scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
      }
    }, 100);
  };

  // Scroll to bottom when returning to this tab
  useEffect(() => {
    scrollToBottom();
  }, []);

  const addMessage = useCallback((msg) => {
    setMessages((prev) => [...prev, { ...msg, id: Date.now() + Math.random() }]);
    scrollToBottom();
  }, []);

  const updateMessage = useCallback((id, updates) => {
    setMessages((prev) => prev.map((m) => m.id === id ? { ...m, ...updates } : m));
  }, []);

  // Execute an immediate tool (add_card, remove_card, set_dream_card)
  const executeImmediateTool = useCallback((name, args) => {
    switch (name) {
      case 'add_card': {
        const card = cards.find((c) => c.id === args.cardId);
        if (!card) return { status: 'error', message: `Card "${args.cardId}" not found in catalog` };
        if (profile.currentCards?.includes(args.cardId)) return { status: 'error', message: `User already has "${card.name}"` };
        dispatch({ type: 'ADD_CARD', payload: args.cardId });
        return { status: 'success', message: `Added "${card.name}" to wallet` };
      }
      case 'remove_card': {
        const card = cards.find((c) => c.id === args.cardId);
        if (!card) return { status: 'error', message: `Card "${args.cardId}" not found in catalog` };
        if (!profile.currentCards?.includes(args.cardId)) return { status: 'error', message: `User doesn't have "${card.name}"` };
        dispatch({ type: 'REMOVE_CARD', payload: args.cardId });
        return { status: 'success', message: `Removed "${card.name}" from wallet` };
      }
      case 'set_dream_card': {
        if (args.cardId === 'none' || !args.cardId) {
          dispatch({ type: 'SET_DREAM_CARD', payload: null });
          return { status: 'success', message: 'Dream card cleared' };
        }
        const card = cards.find((c) => c.id === args.cardId);
        if (!card) return { status: 'error', message: `Card "${args.cardId}" not found in catalog` };
        dispatch({ type: 'SET_DREAM_CARD', payload: args.cardId });
        return { status: 'success', message: `Dream card set to "${card.name}"` };
      }
      default:
        return { status: 'error', message: `Unknown tool: ${name}` };
    }
  }, [profile, dispatch]);

  // Process the Gemini response — may contain text and/or functionCall parts
  const processResponse = useCallback(async (content) => {
    for (const part of content.parts) {
      // Text response
      if (part.text) {
        addMessage({ role: 'assistant', text: part.text });
      }

      // Function call
      if (part.functionCall) {
        const { name, args } = part.functionCall;

        if (CONFIRMATION_TOOLS.has(name)) {
          // Show confirmation UI — don't execute yet
          addMessage({
            role: 'tool',
            toolCall: { name, args, resolved: null },
          });
          // Don't continue the loop — wait for user confirmation
          return 'awaiting_confirmation';
        } else {
          // Execute immediately
          const result = executeImmediateTool(name, args);

          // Append function response to API history and continue
          apiHistoryRef.current.push({
            role: 'function',
            parts: [{ functionResponse: { name, response: result } }],
          });

          // Call Gemini again so it can respond to the result
          const followUp = await chatWithTools(
            apiHistoryRef.current,
            buildToolDefinitions()
          );
          apiHistoryRef.current.push(followUp);

          // Recursively process (may have more tool calls or text)
          return processResponse(followUp);
        }
      }
    }
    return 'done';
  }, [addMessage, executeImmediateTool]);

  // Handle confirmation/rejection of a pending tool call
  const handleToolConfirmation = useCallback(async (msgId, toolCall, confirmed) => {
    const { name, args } = toolCall;
    updateMessage(msgId, { toolCall: { ...toolCall, resolved: confirmed ? 'confirmed' : 'rejected' } });

    if (confirmed) {
      // Apply the change
      if (name === 'update_spending') {
        dispatch({
          type: 'UPDATE_PROFILE',
          payload: { monthlySpending: { ...args } },
        });
      } else if (name === 'update_credit_limit') {
        dispatch({
          type: 'UPDATE_PROFILE',
          payload: { preferredCreditLimit: args.creditLimit },
        });
      }
    }

    // Send function response back to Gemini
    setLoading(true);
    const result = confirmed
      ? { status: 'confirmed', message: 'User accepted the changes' }
      : { status: 'rejected', message: 'User declined the changes' };

    apiHistoryRef.current.push({
      role: 'function',
      parts: [{ functionResponse: { name, response: result } }],
    });

    try {
      const followUp = await chatWithTools(
        apiHistoryRef.current,
        buildToolDefinitions()
      );
      apiHistoryRef.current.push(followUp);
      await processResponse(followUp);
    } catch (e) {
      addMessage({ role: 'assistant', text: confirmed ? "Done! Your profile has been updated." : "No worries, I won't change anything." });
    } finally {
      setLoading(false);
    }
  }, [dispatch, updateMessage, addMessage, processResponse]);

  const sendMessage = async (text) => {
    if (!text.trim()) return;

    const trimmed = text.trim();
    addMessage({ role: 'user', text: trimmed });
    setInput('');
    setLoading(true);

    if (!isAPIConfigured()) {
      addMessage({
        role: 'assistant',
        text: "I'd love to help! To get personalized AI advice, add your Gemini API key in src/api/gemini.js.\n\n" +
          "In the meantime, here's a general tip: Based on your profile, check out the Path Planner tab \u2014 it can map out your card upgrade journey step by step!",
      });
      setLoading(false);
      return;
    }

    try {
      // Build the user context and prepend it to the first message, or include fresh context
      const contextBlock = buildUserContext(profile);
      const userParts = [{ text: `${contextBlock}\n\nUSER MESSAGE: ${trimmed}` }];

      apiHistoryRef.current.push({ role: 'user', parts: userParts });

      const response = await chatWithTools(
        apiHistoryRef.current,
        buildToolDefinitions()
      );
      apiHistoryRef.current.push(response);

      await processResponse(response);
    } catch (e) {
      addMessage({ role: 'assistant', text: "Sorry, I couldn't connect to the AI service. Please check your API key and try again." });
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage(input);
    }
  };

  return (
    <div className="h-screen flex flex-col" style={{ backgroundColor: '#2C2420' }}>
      {/* Header with New Chat */}
      {messages.length > 0 && (
        <div className="flex items-center justify-end px-4 pt-3 pb-1">
          <button
            onClick={onNewChat}
            className="flex items-center gap-1.5 text-primary text-sm font-medium cursor-pointer hover:bg-primary/10 px-3 py-1.5 rounded-lg transition-colors"
          >
            <Plus className="w-4 h-4" />
            New Chat
          </button>
        </div>
      )}
      {/* Messages area */}
      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto p-4 pb-2"
      >
        {/* Welcome state */}
        {messages.length === 0 && (
          <div className="flex flex-col items-center pt-5 pb-3">
            <div className="w-14 h-14 rounded-full bg-primary flex items-center justify-center mb-2">
              <span className="text-white text-2xl">{'\uD83D\uDCAC'}</span>
            </div>
            <h2 className="text-secondary-700 text-xl font-bold mb-1.5">AI Credit Card Advisor</h2>
            <p className="text-secondary-500 text-sm text-center leading-5 mb-5 max-w-md px-5">
              Ask me anything about credit cards, your readiness for a specific card, or how to improve your credit profile. I can also update your cards and spending!
            </p>

            <p className="text-secondary-500 text-sm font-semibold mb-2 self-start">Try asking:</p>
            <div className="w-full flex flex-col gap-1.5">
              {QUICK_QUESTIONS.map((q, i) => (
                <button
                  key={i}
                  onClick={() => sendMessage(q)}
                  className="w-full bg-[#2C2420] rounded-lg px-3 py-3 text-left text-secondary-500 text-sm border border-border hover:border-primary hover:text-primary cursor-pointer transition-colors"
                >
                  {q}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Chat messages */}
        {messages.map((msg) => {
          // Tool confirmation card
          if (msg.role === 'tool' && msg.toolCall) {
            const { name, args, resolved } = msg.toolCall;
            if (name === 'update_spending') {
              return (
                <div key={msg.id} className="max-w-[85%] mr-auto mb-2">
                  <SpendingConfirmation
                    data={args}
                    resolved={resolved}
                    onConfirm={() => handleToolConfirmation(msg.id, msg.toolCall, true)}
                    onReject={() => handleToolConfirmation(msg.id, msg.toolCall, false)}
                  />
                </div>
              );
            }
            if (name === 'update_credit_limit') {
              return (
                <div key={msg.id} className="max-w-[85%] mr-auto mb-2">
                  <CreditLimitConfirmation
                    creditLimit={args.creditLimit}
                    resolved={resolved}
                    onConfirm={() => handleToolConfirmation(msg.id, msg.toolCall, true)}
                    onReject={() => handleToolConfirmation(msg.id, msg.toolCall, false)}
                  />
                </div>
              );
            }
            return null;
          }

          // Regular text message
          return (
            <div
              key={msg.id}
              className={`inline-block max-w-[85%] rounded-2xl px-3 py-2.5 mb-2 ${
                msg.role === 'user'
                  ? 'bg-primary ml-auto rounded-br-sm'
                  : 'bg-[#3A322C] mr-auto rounded-bl-sm'
              }`}
              style={{ display: 'block', width: 'fit-content', marginLeft: msg.role === 'user' ? 'auto' : undefined }}
            >
              {msg.role === 'assistant' && (
                <p className="text-primary text-[11px] font-semibold mb-1">CardPath AI</p>
              )}
              {msg.role === 'user' ? (
                <p className="text-sm leading-relaxed whitespace-pre-wrap text-white">
                  {msg.text}
                </p>
              ) : (
                <Markdown text={msg.text} className="text-[#F0EBE3]" />
              )}
            </div>
          );
        })}

        {/* Loading indicator */}
        {loading && (
          <div className="flex items-center gap-2 p-2">
            <div className="flex gap-1">
              <span className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
              <span className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
              <span className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
            </div>
            <span className="text-primary text-sm">Thinking...</span>
          </div>
        )}
      </div>

      {/* Input bar */}
      <div className="flex items-end gap-2 p-3 border-t border-border" style={{ backgroundColor: '#2C2420' }}>
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Ask about credit cards..."
          rows={1}
          maxLength={500}
          className="flex-1 bg-[#3A322C] border border-border rounded-2xl px-4 py-2.5 text-[#F0EBE3] text-sm placeholder-[#6A6058] outline-none resize-none max-h-24 focus:ring-2 focus:ring-primary"
        />
        <button
          onClick={() => sendMessage(input)}
          disabled={!input.trim() || loading}
          className={`
            w-10 h-10 rounded-full bg-primary flex items-center justify-center
            text-white text-xl font-bold cursor-pointer transition-opacity shrink-0
            ${!input.trim() || loading ? 'opacity-40 cursor-not-allowed' : 'hover:bg-primary/90'}
          `}
        >
          {'\u2191'}
        </button>
      </div>
    </div>
  );
}
