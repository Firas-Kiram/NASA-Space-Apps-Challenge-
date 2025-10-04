import React from 'react';

const SimpleBarChart = ({ data, xKey, yKey, color = '#7c3aed' }) => {
  if (!data || data.length === 0) return <div className="flex items-center justify-center h-full text-gray-500">No data available</div>;

  const maxValue = Math.max(...data.map(item => item[yKey]));
  const chartHeight = 200; // Fixed height for chart area
  
  return (
    <div className="h-full flex flex-col">
      {/* Chart area */}
      <div className="flex-1 flex items-end justify-center px-6 pb-4">
        <div className="flex items-end justify-between w-full space-x-1 sm:space-x-2" style={{ height: `${chartHeight}px` }}>
          {data.map((item, index) => {
            const barHeight = (item[yKey] / maxValue) * (chartHeight - 40); // Leave space for value labels
            return (
              <div key={index} className="flex flex-col items-center flex-1 max-w-[60px]">
                {/* Value label above bar */}
                <div className="text-xs font-medium text-gray-900 mb-1 h-4">
                  {item[yKey]}
                </div>
                {/* Bar */}
                <div 
                  className="w-full rounded-t-lg transition-all duration-300 hover:opacity-80 min-h-[4px] relative group"
                  style={{ 
                    height: `${Math.max(barHeight, 4)}px`,
                    backgroundColor: color
                  }}
                >
                  {/* Hover tooltip */}
                  <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap">
                    {item[xKey]}: {item[yKey]}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
      
      {/* X-axis labels */}
      <div className="flex justify-between px-6 pt-2">
        {data.map((item, index) => (
          <div key={index} className="flex-1 max-w-[60px]">
            <div className="text-xs text-gray-600 text-center truncate">
              {item[xKey]}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SimpleBarChart;