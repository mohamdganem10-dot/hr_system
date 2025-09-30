
import React from 'react';

interface CardProps {
  title: string;
  value: string;
  icon: React.ReactNode;
  color: string;
}

const Card: React.FC<CardProps> = ({ title, value, icon, color }) => {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 flex items-center transform hover:scale-105 transition-transform duration-300">
      <div className={`p-4 rounded-full ${color}`}>
        {icon}
      </div>
      <div className="mr-6">
        <p className="text-lg font-semibold text-gray-500 dark:text-gray-400">{title}</p>
        <p className="text-3xl font-bold text-gray-800 dark:text-white">{value}</p>
      </div>
    </div>
  );
};

export default Card;
