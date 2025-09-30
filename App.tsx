import React, { useState } from 'react';
import Sidebar from './components/Sidebar';
import Topbar from './components/Topbar';
import Dashboard from './components/Dashboard';
import Employees from './components/Employees';
import Documents from './components/Documents';
import Projects from './components/Projects';
import Settings from './components/Settings';
import AIAssistant from './components/AIAssistant';

type Page = 'dashboard' | 'employees' | 'documents' | 'projects' | 'settings';

const App: React.FC = () => {
  const [activePage, setActivePage] = useState<Page>('dashboard');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

  const renderPage = () => {
    switch (activePage) {
      case 'dashboard':
        return <Dashboard />;
      case 'employees':
        return <Employees />;
      case 'documents':
        return <Documents />;
      case 'projects':
        return <Projects />;
      case 'settings':
        return <Settings />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <div className="bg-gray-100 dark:bg-gray-900 text-gray-800 dark:text-gray-200 min-h-screen flex" dir="rtl">
      <Sidebar activePage={activePage} setActivePage={setActivePage} isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />
      <div className="flex-1 flex flex-col min-w-0">
        <Topbar onToggleSidebar={toggleSidebar} />
        <main className="p-4 md:p-6 lg:p-8 flex-1 overflow-y-auto">
          {renderPage()}
        </main>
      </div>
      {isSidebarOpen && <div onClick={toggleSidebar} className="fixed inset-0 bg-black bg-opacity-50 z-20 md:hidden"></div>}
      <AIAssistant />
    </div>
  );
};

export default App;