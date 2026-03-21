import React, { useState, useMemo } from 'react';
import { useUser } from '../context/UserContext';
import { buildUpgradeTree } from '../utils/treeBuilder';
import PathTree from '../components/PathTree';
import PathInfoPanel from '../components/PathInfoPanel';

export default function PathPlannerScreen() {
  const { profile } = useUser();
  const [selectedNode, setSelectedNode] = useState(null);
  const [selectedEdge, setSelectedEdge] = useState(null);

  const tree = useMemo(() => buildUpgradeTree(profile, profile.dreamCard), [profile]);

  const handleSelectNode = (nodeId) => {
    setSelectedEdge(null);
    setSelectedNode(nodeId);
  };

  const handleSelectEdge = (edge) => {
    setSelectedNode(null);
    setSelectedEdge(edge);
  };

  const dismissPanel = () => {
    setSelectedNode(null);
    setSelectedEdge(null);
  };

  const panelOpen = !!(selectedNode || selectedEdge);

  return (
    <div className="h-screen flex flex-row relative" style={{ backgroundColor: '#2C2420' }}>
      {/* Header card — top left overlay */}
      <div className="absolute top-3 left-3 z-20 bg-[#3A322C] rounded-xl px-4 py-3 shadow-lg">
        <h1 className="text-[#F0EBE3] text-base font-bold">Your CardPath</h1>
        <p className="text-[#B0A898] text-xs mt-0.5">Tap a card or arrow to explore upgrade paths</p>
        {!profile.dreamCard && (
          <p className="text-primary text-xs mt-1">Set a dream card to see your optimal path</p>
        )}
      </div>

      {/* Tree area */}
      <div className="flex-1 overflow-y-auto">
        <PathTree
            tree={tree}
            selectedNode={selectedNode}
            selectedEdge={selectedEdge}
            onSelectNode={handleSelectNode}
            onSelectEdge={handleSelectEdge}
          />
        </div>

        {/* Right-side info panel */}
        <div
          className="overflow-y-auto overflow-x-hidden border-l border-border bg-[#2C2420] transition-all duration-300 ease-in-out rounded-2xl m-2"
          style={{
            width: panelOpen ? 380 : 0,
            minWidth: panelOpen ? 380 : 0,
            opacity: panelOpen ? 1 : 0,
          }}
        >
          {panelOpen && (
            <div className="w-[380px]">
              <PathInfoPanel
                selectedNode={selectedNode}
                selectedEdge={selectedEdge}
                tree={tree}
                profile={profile}
                onClose={dismissPanel}
              />
            </div>
          )}
      </div>
    </div>
  );
}
