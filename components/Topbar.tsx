import React from 'react';
import { Search, Bell, ChevronDown, User, LogOut, Settings, Menu } from 'lucide-react';

interface TopbarProps {
    onToggleSidebar: () => void;
}

const Topbar: React.FC<TopbarProps> = ({ onToggleSidebar }) => {
  return (
    <header className="bg-white dark:bg-gray-800 shadow-md p-4 flex justify-between items-center sticky top-0 z-10">
       <button onClick={onToggleSidebar} className="md:hidden text-gray-500 dark:text-gray-400 ml-4">
            <Menu size={24} />
       </button>
      
      {/* Search Bar */}
      <div className="relative flex-1 max-w-xl">
        <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
        <input
          type="text"
          placeholder="ابحث هنا..."
          className="w-full bg-gray-100 dark:bg-gray-700 border-transparent focus:ring-2 focus:ring-blue-500 focus:border-transparent rounded-full py-2 pr-10 pl-4 text-gray-700 dark:text-gray-200"
        />
      </div>

      {/* Right side icons and user menu */}
      <div className="flex items-center space-x-4 mr-auto ml-4">
        <button className="relative text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200">
          <Bell size={24} />
          <span className="absolute top-0 right-0 h-2 w-2 bg-red-500 rounded-full"></span>
        </button>

        <div className="relative group">
          <button className="flex items-center space-x-2">
            <img
              src="https://picsum.photos/seed/user/40/40"
              alt="User Avatar"
              className="w-10 h-10 rounded-full border-2 border-blue-500"
            />
            <span className="hidden lg:inline font-semibold text-gray-700 dark:text-gray-200">عبدالله</span>
            <ChevronDown size={20} className="text-gray-500 dark:text-gray-400" />
          </button>
          <div className="absolute left-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-md shadow-lg py-1 hidden group-hover:block z-20">
            <a href="#" className="flex items-center px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700">
              <User size={16} className="ml-2" /> الملف الشخصي
            </a>
            <a href="#" className="flex items-center px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700">
              <Settings size={16} className="ml-2" /> الإعدادات
            </a>
            <a href="#" className="flex items-center px-4 py-2 text-sm text-red-500 hover:bg-gray-100 dark:hover:bg-gray-700">
              <LogOut size={16} className="ml-2" /> تسجيل الخروج
            </a>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Topbar;