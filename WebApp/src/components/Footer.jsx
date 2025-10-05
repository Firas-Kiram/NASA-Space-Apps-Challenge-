import React from 'react';

const Footer = () => {
  return (
    <footer className="bg-white border-t border-gray-200 mt-auto">
      <div className="px-6 py-4">
        <div className="flex items-center justify-between text-sm text-gray-500">
          <div className="flex items-center space-x-6">
            <span>© NASA Bioscience Dashboard</span>
            <div className="flex items-center space-x-4">
              <a href="#" className="hover:text-gray-700 transition-colors">
                Data Sources
              </a>
              <a href="#" className="hover:text-gray-700 transition-colors">
                API Documentation
              </a>
              <a href="#" className="hover:text-gray-700 transition-colors">
                Privacy Policy
              </a>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-1">
              <div className="w-2 h-2 bg-green-400 rounded-full"></div>
              <span>System Status: Operational</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
