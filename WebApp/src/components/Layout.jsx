import React, { useState } from 'react';
import Header from './Header';
import Sidebar from './Sidebar';
import Footer from './Footer';
import ContextPanel from './ContextPanel';

const Layout = ({ children, showContextPanel = false, selectedItem = null, onToggleContextPanel }) => {
  const [isContextPanelOpen, setIsContextPanelOpen] = useState(showContextPanel);

  const handleToggleContextPanel = () => {
    setIsContextPanelOpen(!isContextPanelOpen);
    if (onToggleContextPanel) {
      onToggleContextPanel(!isContextPanelOpen);
    }
  };

  return (
    <div className="min-h-screen bg-[#f7f8fb] flex flex-col">
      {/* Header */}
      <Header onToggleContextPanel={handleToggleContextPanel} showContextToggle={!!selectedItem} />
      
      <div className="flex flex-1">
        {/* Sidebar */}
        <Sidebar />
        
        {/* Main Content */}
        <main className={`flex-1 ml-0 lg:ml-72 pt-18 ${isContextPanelOpen ? 'mr-80' : ''} transition-all duration-300`}>
          <div className="p-6 min-h-full">
            {children}
          </div>
        </main>

        {/* Context Panel */}
        <ContextPanel 
          isOpen={isContextPanelOpen}
          onClose={() => setIsContextPanelOpen(false)}
          selectedItem={selectedItem}
        />
      </div>

      {/* Footer */}
      <Footer />
    </div>
  );
};

export default Layout;
