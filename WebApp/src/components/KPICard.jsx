import React from 'react';

const KPICard = ({ 
  title, 
  value, 
  change, 
  changeType = 'positive', 
  icon, 
  gradient = 'purple',
  subtitle 
}) => {
  const gradientClasses = {
    purple: 'from-primary-500 to-primary-600',
    blue: 'from-blue-500 to-blue-600',
    green: 'from-green-500 to-green-600',
    orange: 'from-orange-500 to-orange-600',
    pink: 'from-pink-500 to-pink-600'
  };

  const changeColorClasses = {
    positive: 'text-green-600 bg-green-50',
    negative: 'text-red-600 bg-red-50',
    neutral: 'text-gray-600 bg-gray-50'
  };

  return (
    <div className="bg-white rounded-2xl p-6 shadow-card hover-lift">
      {/* Header with icon */}
      <div className="flex items-center justify-between mb-4">
        <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${gradientClasses[gradient]} flex items-center justify-center shadow-lg`}>
          <div className="text-white">
            {icon}
          </div>
        </div>
        {change && (
          <div className={`px-2 py-1 rounded-full text-xs font-medium ${changeColorClasses[changeType]}`}>
            {changeType === 'positive' ? '+' : changeType === 'negative' ? '-' : ''}{change}
          </div>
        )}
      </div>

      {/* Content */}
      <div>
        <h3 className="text-sm font-medium text-gray-600 mb-1">{title}</h3>
        <div className="flex items-baseline space-x-2">
          <span className="text-2xl font-bold text-gray-900">{value}</span>
          {subtitle && (
            <span className="text-sm text-gray-500">{subtitle}</span>
          )}
        </div>
      </div>
    </div>
  );
};

export default KPICard;
