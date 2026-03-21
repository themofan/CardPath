import allCards from '../data/cards.json';
import { checkEligibility, rankCards } from './eligibility';

// Filter out inactive (cobranded) cards from the algorithm
const cards = allCards.filter((c) => c.active !== false);

const TIER_ORDER = ['starter', 'mid-tier', 'premium', 'ultra-premium'];
const DEFAULT_ISSUERS = ['Chase', 'American Express', 'Discover', 'Capital One'];

/**
 * Build an upgrade tree from the user's current cards.
 * Returns { nodes, edges, tiers } where:
 *   nodes: [{ id, card, tier, isOwned, issuer }]
 *   edges: [{ from, to }]
 *   tiers: string[] of tier keys that have at least one node
 */
export function buildUpgradeTree(profile, dreamCardId = null) {
  const ownedIds = new Set(profile.currentCards || []);
  const ownedCards = cards.filter((c) => ownedIds.has(c.id));

  const nodeMap = new Map(); // id -> node
  const edgeList = [];
  const edgeSet = new Set(); // track "fromId::toId" for dedup

  const addNode = (card, isOwned, isDream = false) => {
    if (nodeMap.has(card.id)) {
      // Update dream flag if already exists
      if (isDream) nodeMap.get(card.id).isDream = true;
      return;
    }
    nodeMap.set(card.id, {
      id: card.id,
      card,
      tier: card.tier,
      isOwned,
      issuer: card.issuer,
      isDream,
    });
  };

  const addEdge = (fromId, toId) => {
    const key = `${fromId}::${toId}`;
    if (!edgeSet.has(key)) {
      edgeSet.add(key);
      edgeList.push({ from: fromId, to: toId });
    }
  };

  // Recursively expand a card's same-issuer upgrades up the tier ladder
  const expandCard = (card, profile) => {
    const currentTierIdx = TIER_ORDER.indexOf(card.tier);
    if (currentTierIdx < 0 || currentTierIdx >= TIER_ORDER.length - 1) return;

    const nextTier = TIER_ORDER[currentTierIdx + 1];
    const sameIssuerNextTier = cards.filter(
      (c) => c.issuer === card.issuer && c.tier === nextTier && c.id !== card.id
    );

    if (sameIssuerNextTier.length === 0) return;

    // Rank by eligibility, take top 3
    const ranked = sameIssuerNextTier
      .map((c) => ({ card: c, elig: checkEligibility(profile, c) }))
      .sort((a, b) => b.elig.score - a.elig.score)
      .slice(0, 3);

    for (const { card: child } of ranked) {
      const isOwned = ownedIds.has(child.id);
      addNode(child, isOwned);
      addEdge(card.id, child.id);
      expandCard(child, profile);
    }
  };

  if (ownedCards.length > 0) {
    // Add owned cards as roots and expand each
    for (const card of ownedCards) {
      addNode(card, true);
      expandCard(card, profile);
    }
  } else {
    // No cards: suggest one starter per default issuer
    for (const issuer of DEFAULT_ISSUERS) {
      const starters = cards.filter((c) => c.issuer === issuer && c.tier === 'starter');
      if (starters.length === 0) continue;

      // Pick the best starter
      const ranked = starters
        .map((c) => ({ card: c, elig: checkEligibility(profile, c) }))
        .sort((a, b) => b.elig.score - a.elig.score);

      const best = ranked[0].card;
      addNode(best, false);
      expandCard(best, profile);
    }
  }

  // --- Dream card path building ---
  if (dreamCardId) {
    const dreamCard = cards.find((c) => c.id === dreamCardId);
    if (dreamCard) {
      addNode(dreamCard, ownedIds.has(dreamCard.id), true);

      // Build path from owned cards (or starters) to dream card
      const dreamTierIdx = TIER_ORDER.indexOf(dreamCard.tier);

      // Find the best root to connect from
      const sameIssuerOwned = ownedCards.filter((c) => c.issuer === dreamCard.issuer);
      let pathRoots = [];

      if (sameIssuerOwned.length > 0) {
        // User owns cards from same issuer — connect from highest tier one
        pathRoots = sameIssuerOwned;
      } else if (ownedCards.length > 0) {
        // Different issuer — find/add a starter from dream card's issuer
        const starters = cards.filter((c) => c.issuer === dreamCard.issuer && c.tier === 'starter');
        if (starters.length > 0) {
          const best = starters
            .map((c) => ({ card: c, elig: checkEligibility(profile, c) }))
            .sort((a, b) => b.elig.score - a.elig.score)[0].card;
          addNode(best, false);
          // Connect an owned card to this starter as a cross-issuer step
          const bestOwned = ownedCards
            .map((c) => ({ card: c, tierIdx: TIER_ORDER.indexOf(c.tier) }))
            .sort((a, b) => b.tierIdx - a.tierIdx)[0].card;
          addEdge(bestOwned.id, best.id);
          pathRoots = [best];
        }
      } else {
        // No owned cards — roots are already starter suggestions, find same-issuer one
        const existingRoot = Array.from(nodeMap.values()).find(
          (n) => n.issuer === dreamCard.issuer && n.tier === 'starter'
        );
        if (existingRoot) pathRoots = [existingRoot.card];
      }

      // Chain from each root up through tiers to dream card
      for (const root of pathRoots) {
        const rootTierIdx = TIER_ORDER.indexOf(root.tier);
        if (rootTierIdx >= dreamTierIdx) {
          // Same or higher tier — direct edge
          if (root.id !== dreamCard.id) addEdge(root.id, dreamCard.id);
          continue;
        }

        // Build stepping stones through intermediate tiers
        let prevId = root.id;
        for (let t = rootTierIdx + 1; t < dreamTierIdx; t++) {
          const tier = TIER_ORDER[t];
          const candidates = cards.filter(
            (c) => c.issuer === dreamCard.issuer && c.tier === tier && c.id !== dreamCard.id
          );
          if (candidates.length === 0) continue;

          const best = candidates
            .map((c) => ({ card: c, elig: checkEligibility(profile, c) }))
            .sort((a, b) => b.elig.score - a.elig.score)[0].card;

          addNode(best, ownedIds.has(best.id));
          addEdge(prevId, best.id);
          prevId = best.id;
        }
        // Connect last stepping stone to dream card
        if (prevId !== dreamCard.id) addEdge(prevId, dreamCard.id);
      }
    }
  }

  // --- Post-processing: attach eligibility, prune tree ---

  // 2a. Attach eligibility to every node (cached)
  const eligCache = new Map();
  for (const [id, node] of nodeMap) {
    if (!eligCache.has(id)) {
      eligCache.set(id, checkEligibility(profile, node.card));
    }
    node.eligibility = eligCache.get(id);
  }

  // 2b. Cap at 4 nodes per tier
  const MAX_PER_TIER = 4;
  for (const tier of TIER_ORDER) {
    const tierNodes = Array.from(nodeMap.values()).filter((n) => n.tier === tier);
    if (tierNodes.length <= MAX_PER_TIER) continue;

    // Keep owned and dream nodes, then fill by highest eligibility score
    const protected_ = tierNodes.filter((n) => n.isOwned || n.isDream);
    const rest = tierNodes
      .filter((n) => !n.isOwned && !n.isDream)
      .sort((a, b) => b.eligibility.score - a.eligibility.score);
    const slotsLeft = MAX_PER_TIER - protected_.length;
    const keep = new Set([...protected_.map((n) => n.id), ...rest.slice(0, Math.max(0, slotsLeft)).map((n) => n.id)]);

    for (const node of tierNodes) {
      if (!keep.has(node.id)) {
        nodeMap.delete(node.id);
      }
    }
    // Remove edges referencing pruned nodes
    for (let i = edgeList.length - 1; i >= 0; i--) {
      if (!nodeMap.has(edgeList[i].from) || !nodeMap.has(edgeList[i].to)) {
        edgeList.splice(i, 1);
      }
    }
  }

  // 2c. Soft-cap edges at 12
  const MAX_EDGES = 12;
  if (edgeList.length > MAX_EDGES) {
    // Sort by target node score ascending (weakest edges first)
    const scored = edgeList.map((e, i) => ({
      idx: i,
      score: nodeMap.get(e.to)?.eligibility?.score ?? 0,
    }));
    scored.sort((a, b) => a.score - b.score);

    // Count incoming edges per node
    const inCount = new Map();
    for (const e of edgeList) {
      inCount.set(e.to, (inCount.get(e.to) || 0) + 1);
    }

    const toRemove = new Set();
    for (const { idx } of scored) {
      if (edgeList.length - toRemove.size <= MAX_EDGES) break;
      const edge = edgeList[idx];
      // Don't orphan a node
      if ((inCount.get(edge.to) || 0) > 1) {
        toRemove.add(idx);
        inCount.set(edge.to, inCount.get(edge.to) - 1);
      }
    }
    for (const idx of Array.from(toRemove).sort((a, b) => b - a)) {
      edgeList.splice(idx, 1);
    }
  }

  // 2d. Attach eligibility to edges
  for (const edge of edgeList) {
    const targetNode = nodeMap.get(edge.to);
    if (targetNode) {
      edge.eligibility = targetNode.eligibility;
    }
  }

  // 2e. Remove isolated nodes (no edges in or out), unless owned or dream
  const connectedIds = new Set();
  for (const e of edgeList) {
    connectedIds.add(e.from);
    connectedIds.add(e.to);
  }
  for (const [id, node] of nodeMap) {
    if (!connectedIds.has(id) && !node.isOwned && !node.isDream) {
      nodeMap.delete(id);
    }
  }

  // Determine which tiers have nodes
  const tiersWithNodes = TIER_ORDER.filter((tier) =>
    Array.from(nodeMap.values()).some((n) => n.tier === tier)
  );

  // 2f. Find optimal path (best path from owned/root card to dream or highest-tier card)
  const optimalPath = new Set();
  const nodesList = Array.from(nodeMap.values());

  // Find target: dream card first, otherwise highest-tier card with best eligibility
  let targetId = null;
  const dreamNode = nodesList.find(n => n.isDream);
  if (dreamNode) {
    targetId = dreamNode.id;
  } else {
    // Find highest-tier non-owned node with best eligibility
    const candidates = nodesList
      .filter(n => !n.isOwned)
      .sort((a, b) => {
        const tierDiff = TIER_ORDER.indexOf(b.tier) - TIER_ORDER.indexOf(a.tier);
        if (tierDiff !== 0) return tierDiff;
        return (b.eligibility?.score || 0) - (a.eligibility?.score || 0);
      });
    if (candidates.length > 0) targetId = candidates[0].id;
  }

  if (targetId) {
    // BFS backwards from target to find best path to an owned/root node
    const parent = new Map(); // childId -> parentId (best parent)
    const visited = new Set();
    const queue = [targetId];
    visited.add(targetId);

    // Build reverse adjacency (child -> parents)
    const reverseAdj = new Map();
    for (const edge of edgeList) {
      if (!reverseAdj.has(edge.to)) reverseAdj.set(edge.to, []);
      reverseAdj.get(edge.to).push(edge.from);
    }

    // BFS from target backwards
    let foundRoot = null;
    while (queue.length > 0) {
      const current = queue.shift();
      const node = nodeMap.get(current);
      if (node && node.isOwned && current !== targetId) {
        foundRoot = current;
        break;
      }
      const parents = reverseAdj.get(current) || [];
      // Sort parents by eligibility score (best first)
      const sortedParents = parents
        .filter(p => nodeMap.has(p) && !visited.has(p))
        .sort((a, b) => (nodeMap.get(b)?.eligibility?.score || 0) - (nodeMap.get(a)?.eligibility?.score || 0));
      for (const p of sortedParents) {
        visited.add(p);
        parent.set(p, current);
        queue.push(p);
      }
    }

    // If no owned root found, use any root node
    if (!foundRoot) {
      const rootNodes = nodesList.filter(n => {
        return !edgeList.some(e => e.to === n.id);
      });
      for (const r of rootNodes) {
        if (visited.has(r.id)) {
          foundRoot = r.id;
          break;
        }
      }
    }

    // Reconstruct path from foundRoot to target
    if (foundRoot) {
      let current = foundRoot;
      while (parent.has(current)) {
        const next = parent.get(current);
        optimalPath.add(`${current}::${next}`);
        current = next;
      }
    }
  }

  // Mark optimal path nodes as recommended
  for (const key of optimalPath) {
    const parts = key.split('::');
    const toNode = nodeMap.get(parts[1]);
    if (toNode && !toNode.isOwned && !toNode.isDream) {
      toNode.isRecommended = true;
    }
  }

  return {
    nodes: Array.from(nodeMap.values()),
    edges: edgeList,
    tiers: tiersWithNodes,
    optimalPath,
  };
}

/**
 * Get all nodes in a specific tier, ordered by issuer grouping.
 */
export function getNodesForTier(tree, tier) {
  return tree.nodes
    .filter((n) => n.tier === tier)
    .sort((a, b) => a.issuer.localeCompare(b.issuer));
}

/**
 * Get the parent node ids for a given node.
 */
export function getParents(tree, nodeId) {
  return tree.edges.filter((e) => e.to === nodeId).map((e) => e.from);
}

/**
 * Get the child node ids for a given node.
 */
export function getChildren(tree, nodeId) {
  return tree.edges.filter((e) => e.from === nodeId).map((e) => e.to);
}
