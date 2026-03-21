import { useState } from 'react';
import {
  LayoutDashboard, CreditCard, GitBranch, MessageSquare, Settings,
  TrendingUp, X,
} from 'lucide-react';
import { useUser } from '../context/UserContext';

const NAV_ITEMS = [
  { id: 'dashboard',  name: 'Dashboard',     icon: LayoutDashboard, description: 'Overview & insights' },
  { id: 'explorer',   name: 'Card Explorer',  icon: CreditCard,      description: 'Browse all cards' },
  { id: 'pathgraph',  name: 'My Path',        icon: GitBranch,       description: 'Your card journey' },
  { id: 'advisor',    name: 'AI Advisor',      icon: MessageSquare,   description: 'Personalized advice' },
  { id: 'settings',   name: 'Settings',        icon: Settings,        description: 'Preferences & profile' },
];

export default function CPSidebar({ currentPage, onPageChange }) {
  const [isExpanded, setIsExpanded] = useState(false);
  const { profile } = useUser();
  const userName = profile.name || 'CardPath User';
  const initials = userName.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2) || 'CP';

  const handleNavigationClick = (pageId) => {
    if (!isExpanded) {
      setIsExpanded(true);
      setTimeout(() => onPageChange(pageId), 150);
    } else {
      onPageChange(pageId);
    }
  };

  return (
    <div className="ml-6 my-6">
      <div
        className={`
          flex flex-col h-[calc(100vh-3rem)] transition-all duration-300 ease-in-out rounded-3xl
          bg-gradient-to-b from-sidebar via-sidebar to-sidebar-accent shadow-2xl border border-sidebar-border/20 overflow-hidden
          ${isExpanded ? 'w-64' : 'w-20'}
        `}
      >
        {/* Header with Logo */}
        <div className="p-6 flex flex-col items-center relative">
          {isExpanded && (
            <button
              onClick={() => setIsExpanded(false)}
              className="absolute top-4 right-4 w-8 h-8 bg-sidebar-accent/50 hover:bg-sidebar-accent rounded-full flex items-center justify-center transition-all duration-200 hover:scale-110 cursor-pointer"
            >
              <X className="w-4 h-4 text-sidebar-foreground" />
            </button>
          )}

          <div className="w-12 h-12 bg-gradient-to-br from-sidebar-primary to-sidebar-primary/80 rounded-full flex items-center justify-center shadow-lg">
            <TrendingUp className="w-6 h-6 text-sidebar-primary-foreground" />
          </div>
          {isExpanded && (
            <div className="mt-3 text-center">
              <h2 className="text-sidebar-foreground font-semibold text-base whitespace-nowrap">
                CardPath
              </h2>
            </div>
          )}
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-4 py-6">
          <div className="space-y-4">
            {NAV_ITEMS.map((item) => {
              const Icon = item.icon;
              const isActive = currentPage === item.id;

              return (
                <div key={item.id} className="relative group">
                  <button
                    onClick={() => handleNavigationClick(item.id)}
                    className={`
                      transition-all duration-300 flex items-center relative overflow-hidden cursor-pointer
                      hover:scale-110 hover:shadow-lg
                      ${isExpanded
                        ? 'w-full px-4 py-3 justify-start rounded-xl'
                        : 'w-12 h-12 justify-center mx-auto rounded-full'
                      }
                      ${isActive
                        ? 'bg-gradient-to-br from-sidebar-primary to-sidebar-primary/80 shadow-lg shadow-sidebar-primary/30 scale-105'
                        : 'bg-gradient-to-br from-sidebar-accent to-sidebar-accent/80 hover:from-sidebar-primary/80 hover:to-sidebar-primary/60'
                      }
                    `}
                  >
                    <Icon className={`
                      transition-colors duration-300 flex-shrink-0 w-5 h-5
                      ${isActive
                        ? 'text-sidebar-primary-foreground'
                        : 'text-sidebar-accent-foreground group-hover:text-sidebar-primary-foreground'
                      }
                    `} />

                    {isExpanded && (
                      <div className="ml-3 overflow-hidden text-left">
                        <div className={`
                          font-medium text-sm whitespace-nowrap transition-colors duration-300
                          ${isActive
                            ? 'text-sidebar-primary-foreground'
                            : 'text-sidebar-accent-foreground group-hover:text-sidebar-primary-foreground'
                          }
                        `}>
                          {item.name}
                        </div>
                        {isActive && (
                          <div className="text-xs text-sidebar-primary-foreground/70 mt-0.5 whitespace-nowrap">
                            {item.description}
                          </div>
                        )}
                      </div>
                    )}

                    {isActive && !isExpanded && (
                      <div className="absolute -right-2 top-1/2 -translate-y-1/2 w-1 h-6 bg-sidebar-primary rounded-l-full" />
                    )}
                  </button>

                  {/* Tooltip for collapsed state */}
                  {!isExpanded && (
                    <div className="absolute left-full ml-4 px-3 py-2 bg-gradient-to-br from-sidebar-primary to-sidebar-primary/90 text-sidebar-primary-foreground rounded-xl opacity-0 group-hover:opacity-100 transition-all duration-300 pointer-events-none whitespace-nowrap z-50 shadow-lg transform translate-x-2 group-hover:translate-x-0">
                      <div className="font-medium text-sm">{item.name}</div>
                      <div className="text-xs opacity-75 mt-1">{item.description}</div>
                      <div className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-1 w-2 h-2 bg-sidebar-primary rotate-45" />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </nav>

        {/* User Profile Section */}
        <div className="p-4 flex justify-center">
          <div className="relative group">
            <div
              className="w-12 h-12 bg-gradient-to-br from-sidebar-primary to-sidebar-primary/80 rounded-full flex items-center justify-center shadow-lg hover:scale-110 transition-all duration-300 cursor-pointer"
              onClick={() => onPageChange('dashboard')}
            >
              <span className="text-sidebar-primary-foreground font-semibold text-lg">{initials}</span>
            </div>

            {!isExpanded && (
              <div className="absolute left-full ml-4 px-3 py-2 bg-gradient-to-br from-sidebar-primary to-sidebar-primary/90 text-sidebar-primary-foreground rounded-xl opacity-0 group-hover:opacity-100 transition-all duration-300 pointer-events-none whitespace-nowrap z-50 shadow-lg transform translate-x-2 group-hover:translate-x-0">
                <div className="font-medium text-sm">{userName}</div>
                <div className="text-xs opacity-75 mt-1">Credit Card Explorer</div>
                <div className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-1 w-2 h-2 bg-sidebar-primary rotate-45" />
              </div>
            )}

            {isExpanded && (
              <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 text-center">
                <div className="text-sidebar-foreground font-medium text-sm whitespace-nowrap">
                  {userName}
                </div>
                <div className="text-sidebar-foreground/70 text-xs whitespace-nowrap">
                  Credit Card Explorer
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
