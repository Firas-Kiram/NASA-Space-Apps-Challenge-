import React from 'react';

const ChartCard = ({ title, subtitle, children, className = '' }) => {
  return (
    <div className={`bg-white rounded-2xl p-6 shadow-card hover-lift flex flex-col ${className}`}>
      {/* Header */}
      <div className="mb-4 flex-shrink-0">
        <h3 className="text-lg font-semibold text-gray-900 mb-1">{title}</h3>
        {subtitle && (
          <p className="text-sm text-gray-500">{subtitle}</p>
        )}
      </div>

      {/* Chart Content */}
      <div className="flex-1 min-h-0">
        {children}
      </div>
    </div>
  );
};

export default ChartCard;
