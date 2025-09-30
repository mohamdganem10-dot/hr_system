import React from 'react';
import { LayoutDashboard, Users, FolderKanban, FileText, Settings, Bot } from 'lucide-react';

type Page = 'dashboard' | 'employees' | 'documents' | 'projects' | 'settings';

interface SidebarProps {
  activePage: Page;
  setActivePage: (page: Page) => void;
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
}

const NavItem: React.FC<{
  icon: React.ReactNode;
  label: string;
  isActive: boolean;
  onClick: () => void;
}> = ({ icon, label, isActive, onClick }) => (
  <li>
    <a
      href="#"
      onClick={(e) => {
        e.preventDefault();
        onClick();
      }}
      className={`flex items-center p-3 my-1 rounded-lg transition-colors duration-200 ${
        isActive
          ? 'bg-blue-600 text-white shadow-lg'
          : 'text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
      }`}
    >
      {icon}
      <span className="mr-4 text-md font-semibold">{label}</span>
    </a>
  </li>
);

const Sidebar: React.FC<SidebarProps> = ({ activePage, setActivePage, isOpen, setIsOpen }) => {
  const navItems = [
    { id: 'dashboard', label: 'لوحة التحكم', icon: <LayoutDashboard size={22} /> },
    { id: 'employees', label: 'إدارة الموظفين', icon: <Users size={22} /> },
    { id: 'documents', label: 'أرشيف المستندات', icon: <FileText size={22} /> },
    { id: 'projects', label: 'أرشيف المشاريع', icon: <FolderKanban size={22} /> },
    { id: 'settings', label: 'الإعدادات', icon: <Settings size={22} /> },
  ];
  
  const handleItemClick = (page: Page) => {
      setActivePage(page);
      if (window.innerWidth < 768) { // md breakpoint
          setIsOpen(false);
      }
  }

  return (
    <aside className={`fixed inset-y-0 right-0 z-30 w-64 bg-white dark:bg-gray-800 shadow-xl flex-shrink-0 transform transition-transform duration-300 ease-in-out md:translate-x-0 md:static ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}>
      <div className="p-6 flex items-center justify-center border-b border-gray-200 dark:border-gray-700">
        <Bot size={32} className="text-blue-600" />
        <h1 className="text-xl font-bold text-gray-800 dark:text-white mr-3">نظام الإدارة</h1>
      </div>
      <nav className="p-4">
        <ul>
          {navItems.map((item) => (
            <NavItem
              key={item.id}
              icon={item.icon}
              label={item.label}
              isActive={activePage === item.id}
              onClick={() => handleItemClick(item.id as Page)}
            />
          ))}
        </ul>
      </nav>
    </aside>
  );
};

export default Sidebar;