import { useState, useRef, useCallback } from 'react';
import CPSidebar from './CPSidebar';
import DashboardScreen from '../screens/DashboardScreen';
import CardExplorerScreen from '../screens/CardExplorerScreen';
import PathPlannerScreen from '../screens/PathPlannerScreen';
import AIAdvisorScreen from '../screens/AIAdvisorScreen';
import SettingsScreen from '../screens/SettingsScreen';

export default function CardPathApp({ onRetakeQuiz, onSignOut }) {
  const [currentPage, setCurrentPage] = useState('dashboard');

  // Lifted AI chat state so it persists across tab switches
  const [chatMessages, setChatMessages] = useState([]);
  const chatApiHistoryRef = useRef([]);

  const handleNewChat = useCallback(() => {
    setChatMessages([]);
    chatApiHistoryRef.current = [];
  }, []);

  const renderPage = () => {
    switch (currentPage) {
      case 'dashboard':
        return <DashboardScreen onNavigate={setCurrentPage} />;
      case 'explorer':
        return <CardExplorerScreen />;
      case 'pathgraph':
        return <PathPlannerScreen />;
      case 'advisor':
        return (
          <AIAdvisorScreen
            messages={chatMessages}
            setMessages={setChatMessages}
            apiHistoryRef={chatApiHistoryRef}
            onNewChat={handleNewChat}
          />
        );
      case 'settings':
        return <SettingsScreen onRetakeQuiz={onRetakeQuiz} onSignOut={onSignOut} />;
      default:
        return <DashboardScreen onNavigate={setCurrentPage} />;
    }
  };

  return (
    <div className="flex h-screen" style={{ backgroundColor: '#2C2420' }}>
      <CPSidebar currentPage={currentPage} onPageChange={setCurrentPage} />
      <main className="flex-1 overflow-auto">{renderPage()}</main>
    </div>
  );
}
