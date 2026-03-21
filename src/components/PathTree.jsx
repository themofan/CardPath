import React, { useMemo, useState, useCallback, useRef, useEffect } from 'react';
import { getNodesForTier } from '../utils/treeBuilder';
import EligibilityRing from './EligibilityRing';
import cardGradients, { getCSSGradient } from '../data/cardGradients';

const TIER_LABELS = {
  'starter': 'Starter',
  'mid-tier': 'Mid-Tier',
  'premium': 'Premium',
  'ultra-premium': 'Ultra-Premium',
};

const CARD_WIDTH = 130;
const CARD_HEIGHT = 70;

function ConnectorLayer({ edges, parentRowRef, childRowRef, parentNodeRefs, childNodeRefs, selectedEdge, onSelectEdge, containerRef, optimalPath }) {
  const [lines, setLines] = useState([]);
  const [height, setHeight] = useState(0);

  useEffect(() => {
    const measure = () => {
      if (!parentRowRef.current || !childRowRef.current || !containerRef.current) return;

      const containerRect = containerRef.current.getBoundingClientRect();
      const parentRowRect = parentRowRef.current.getBoundingClientRect();
      const childRowRect = childRowRef.current.getBoundingClientRect();

      // Height from bottom of parent row to top of child row
      const connectorTop = parentRowRect.bottom - containerRect.top;
      const connectorBottom = childRowRect.top - containerRect.top;
      const h = connectorBottom - connectorTop;
      setHeight(h);

      const newLines = [];

      // Group edges by source and target to spread them out
      const edgesByTarget = new Map();
      const edgesBySource = new Map();
      for (const edge of edges) {
        if (!edgesByTarget.has(edge.to)) edgesByTarget.set(edge.to, []);
        edgesByTarget.get(edge.to).push(edge);
        if (!edgesBySource.has(edge.from)) edgesBySource.set(edge.from, []);
        edgesBySource.get(edge.from).push(edge);
      }

      for (const edge of edges) {
        const parentEl = parentNodeRefs.current.get(edge.from);
        const childEl = childNodeRefs.current.get(edge.to);
        if (!parentEl || !childEl) continue;

        const parentRect = parentEl.getBoundingClientRect();
        const childRect = childEl.getBoundingClientRect();

        // Spread outgoing arrows from source
        const sourceGroup = edgesBySource.get(edge.from) || [edge];
        const sourceIdx = sourceGroup.indexOf(edge);
        const sourceN = sourceGroup.length;
        const parentX = sourceN <= 1
          ? parentRect.left + parentRect.width / 2 - containerRect.left
          : parentRect.left + parentRect.width * (sourceIdx + 1) / (sourceN + 1) - containerRect.left;

        // Spread incoming arrows to target
        const targetGroup = edgesByTarget.get(edge.to) || [edge];
        const targetIdx = targetGroup.indexOf(edge);
        const targetN = targetGroup.length;
        const childX = targetN <= 1
          ? childRect.left + childRect.width / 2 - containerRect.left
          : childRect.left + childRect.width * (targetIdx + 1) / (targetN + 1) - containerRect.left;

        newLines.push({ edge, parentX, childX, top: connectorTop });
      }

      setLines(newLines);
    };

    const timer = setTimeout(measure, 50);

    // Use ResizeObserver to detect container size changes (panel open/close, window resize)
    let observer;
    if (containerRef.current) {
      observer = new ResizeObserver(() => measure());
      observer.observe(containerRef.current);
    }

    return () => {
      clearTimeout(timer);
      if (observer) observer.disconnect();
    };
  }, [edges, parentRowRef, childRowRef, parentNodeRefs, childNodeRefs, containerRef]);

  if (lines.length === 0 || height <= 0) return null;

  // Render as an absolutely positioned SVG overlay
  const containerWidth = containerRef.current?.getBoundingClientRect().width || 800;
  const top = lines[0]?.top || 0;

  return (
    <svg
      style={{
        position: 'absolute',
        left: 0,
        top,
        width: containerWidth,
        height,
        pointerEvents: 'none',
        overflow: 'visible',
      }}
    >
      <defs>
        <marker
          id="arrowhead-green"
          markerWidth="8"
          markerHeight="6"
          refX="4"
          refY="3"
          orient="auto"
        >
          <polygon points="0 0, 8 3, 0 6" fill="#10B981" />
        </marker>
        <marker
          id="arrowhead-gold"
          markerWidth="9"
          markerHeight="7"
          refX="4.5"
          refY="3.5"
          orient="auto"
        >
          <polygon points="0 0, 9 3.5, 0 7" fill="#D4A017" />
        </marker>
        <marker
          id="arrowhead-gray"
          markerWidth="8"
          markerHeight="6"
          refX="4"
          refY="3"
          orient="auto"
        >
          <polygon points="0 0, 8 3, 0 6" fill="#8A8078" opacity="0.7" />
        </marker>
      </defs>
      {lines.map(({ edge, parentX, childX }) => {
        const selected = selectedEdge && selectedEdge.from === edge.from && selectedEdge.to === edge.to;
        const isOptimal = optimalPath && optimalPath.has(`${edge.from}::${edge.to}`);
        let color, strokeWidth, opacity, markerId;
        if (selected) {
          color = '#D4A017';
          strokeWidth = 2.25;
          opacity = 1;
          markerId = 'url(#arrowhead-gold)';
        } else if (isOptimal) {
          color = '#10B981';
          strokeWidth = 3;
          opacity = 1;
          markerId = 'url(#arrowhead-green)';
        } else {
          color = '#8A8078';
          strokeWidth = 1.5;
          opacity = 0.7;
          markerId = 'url(#arrowhead-gray)';
        }

        // Cubic bezier: start vertical from parent, curve, end vertical into child
        // End 8px short so arrowhead tip touches card edge without overlapping
        const endY = height - 8;
        const midY = endY / 2;
        const d = `M ${parentX},0 C ${parentX},${midY} ${childX},${midY} ${childX},${endY}`;

        return (
          <g key={`${edge.from}-${edge.to}`}>
            {/* Invisible wider path for click target */}
            <path
              d={d}
              fill="none"
              stroke="transparent"
              strokeWidth={20}
              style={{ pointerEvents: 'stroke', cursor: 'pointer' }}
              onClick={() => onSelectEdge({ from: edge.from, to: edge.to })}
            />
            {/* Visible path */}
            <path
              d={d}
              fill="none"
              stroke={color}
              strokeWidth={strokeWidth}
              opacity={opacity}
              markerEnd={markerId}
              style={{ pointerEvents: 'none' }}
            />
          </g>
        );
      })}
    </svg>
  );
}

export default function PathTree({
  tree,
  selectedNode,
  selectedEdge,
  onSelectNode,
  onSelectEdge,
}) {
  const layout = useMemo(() => {
    if (!tree) return [];
    return tree.tiers.map((tier) => ({
      tier,
      label: TIER_LABELS[tier] || tier,
      nodes: getNodesForTier(tree, tier),
    }));
  }, [tree]);

  const getEdgesBetweenTiers = useCallback((upperTier, lowerTier) => {
    if (!tree) return [];
    const upperNodes = getNodesForTier(tree, upperTier);
    const lowerNodes = getNodesForTier(tree, lowerTier);
    const upperIds = new Set(upperNodes.map((n) => n.id));
    const lowerIds = new Set(lowerNodes.map((n) => n.id));
    return tree.edges.filter((e) => upperIds.has(e.from) && lowerIds.has(e.to));
  }, [tree]);

  // Container ref for the whole tree
  const containerRef = useRef(null);

  // Refs for each tier row and nodes
  const rowRefs = useRef(new Map());
  const nodeRefs = useRef(new Map());

  const getRowRef = (tier) => {
    if (!rowRefs.current.has(tier)) {
      rowRefs.current.set(tier, React.createRef());
    }
    return rowRefs.current.get(tier);
  };

  const nodeRefMaps = useRef(new Map());
  const getNodeRefMap = (tier) => {
    if (!nodeRefMaps.current.has(tier)) {
      nodeRefMaps.current.set(tier, { current: new Map() });
    }
    return nodeRefMaps.current.get(tier);
  };

  if (!tree || tree.nodes.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center p-5">
        <p className="text-secondary-500 text-sm">No upgrade paths available</p>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className="relative flex flex-col"
      style={{ height: '80vh', padding: '100px 0 16px 0' }}
    >
      {layout.map((row, rowIndex) => {
        const rowRef = getRowRef(row.tier);
        const nodeRefMap = getNodeRefMap(row.tier);

        return (
          <React.Fragment key={row.tier}>
            {/* Tier section: label + nodes */}
            <div style={{ flex: 0 }}>
              {/* Tier label */}
              <p className="text-secondary-400 text-[10px] font-bold uppercase tracking-widest text-center mb-1">
                {row.label}
              </p>

              {/* Node row */}
              <div
                ref={rowRef}
                className="flex justify-evenly items-center mx-auto"
                style={{ width: '90%', gap: '6px', flexWrap: 'wrap' }}
              >
                {row.nodes.map((node) => {
                  const isSelected = selectedNode === node.id;
                  const gradient = getCSSGradient(node.card.id);
                  const fallbackColor = cardGradients[node.card.id]?.colors[0] || node.card.imageColor || '#6366f1';
                  const bgStyle = gradient
                    ? { background: gradient }
                    : { backgroundColor: fallbackColor };

                  return (
                    <button
                      type="button"
                      key={node.id}
                      ref={(el) => {
                        if (el) nodeRefMap.current.set(node.id, el);
                      }}
                      onClick={() => onSelectNode(node.id)}
                      className="relative cursor-pointer transition-all"
                      style={{
                        width: CARD_WIDTH,
                        height: CARD_HEIGHT,
                        borderRadius: 10,
                        ...bgStyle,
                        padding: '8px 10px',
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'center',
                        border: '1px solid rgba(255,255,255,0.12)',
                        textAlign: 'left',
                        boxShadow: isSelected
                          ? '0 0 0 3px #D4A017, 0 0 16px 4px rgba(212,160,23,0.3), 0 4px 12px rgba(0,0,0,0.5)'
                          : node.isDream
                            ? '0 0 0 2px #D4A017, 0 0 12px 3px rgba(212,160,23,0.2), 0 2px 8px rgba(0,0,0,0.4)'
                            : '0 0 12px 2px rgba(255,255,255,0.08), 0 2px 8px rgba(0,0,0,0.4)',
                        transform: isSelected ? 'scale(1.06)' : 'scale(1)',
                        zIndex: isSelected ? 10 : 1,
                      }}
                    >
                      {(node.isOwned || node.isDream || node.isRecommended) && (
                        <span
                          style={{
                            position: 'absolute',
                            top: 4,
                            right: 6,
                            backgroundColor: node.isOwned ? '#D4A017' : node.isDream ? '#D4A017' : '#10B981',
                            color: '#fff',
                            fontSize: 7,
                            fontWeight: 800,
                            padding: '1px 4px',
                            borderRadius: 3,
                            letterSpacing: '0.5px',
                            lineHeight: '11px',
                          }}
                        >
                          {node.isOwned ? 'YOURS' : node.isDream ? 'DREAM' : 'REC'}
                        </span>
                      )}
                      <p
                        style={{
                          color: '#fff',
                          fontSize: 11,
                          fontWeight: 700,
                          lineHeight: '14px',
                          margin: 0,
                          paddingRight: node.isOwned ? 30 : 0,
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          display: '-webkit-box',
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: 'vertical',
                        }}
                      >
                        {node.card.name}
                      </p>
                      <p
                        style={{
                          color: 'rgba(255,255,255,0.7)',
                          fontSize: 9,
                          fontWeight: 500,
                          margin: '2px 0 0 0',
                        }}
                      >
                        {node.card.issuer}
                      </p>

                      {node.eligibility && (
                        <div style={{ position: 'absolute', bottom: 5, right: 6 }}>
                          <EligibilityRing met={node.eligibility.met} total={node.eligibility.total} size={20} />
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Spacer between tiers (flex-grows to fill space) */}
            {rowIndex < layout.length - 1 && (
              <div style={{ flex: 1, minHeight: 30 }} />
            )}
          </React.Fragment>
        );
      })}

      {/* SVG connector overlays — one per tier gap */}
      {layout.map((row, rowIndex) => {
        if (rowIndex >= layout.length - 1) return null;
        const rowRef = getRowRef(row.tier);
        const nodeRefMap = getNodeRefMap(row.tier);
        const nextTier = layout[rowIndex + 1].tier;

        return (
          <ConnectorLayer
            key={`conn-${row.tier}-${nextTier}`}
            edges={getEdgesBetweenTiers(row.tier, nextTier)}
            parentRowRef={rowRef}
            childRowRef={getRowRef(nextTier)}
            parentNodeRefs={nodeRefMap}
            childNodeRefs={getNodeRefMap(nextTier)}
            selectedEdge={selectedEdge}
            onSelectEdge={onSelectEdge}
            containerRef={containerRef}
            optimalPath={tree?.optimalPath}
          />
        );
      })}
    </div>
  );
}
