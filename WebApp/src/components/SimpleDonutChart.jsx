import React from 'react';

const SimpleDonutChart = ({ data, colors = ['#7c3aed', '#a855f7', '#c084fc', '#e9d5ff'] }) => {
  if (!data || data.length === 0) return <div className="flex items-center justify-center h-full text-gray-500">No data available</div>;

  const total = data.reduce((sum, item) => sum + item.count, 0);
  const center = 50;
  const radius = 35;
  const innerRadius = 18;

  let cumulativePercentage = 0;

  const createArcPath = (startAngle, endAngle, outerRadius, innerRadius) => {
    const startAngleRad = (startAngle - 90) * (Math.PI / 180);
    const endAngleRad = (endAngle - 90) * (Math.PI / 180);
    
    const x1 = center + outerRadius * Math.cos(startAngleRad);
    const y1 = center + outerRadius * Math.sin(startAngleRad);
    const x2 = center + outerRadius * Math.cos(endAngleRad);
    const y2 = center + outerRadius * Math.sin(endAngleRad);
    
    const x3 = center + innerRadius * Math.cos(endAngleRad);
    const y3 = center + innerRadius * Math.sin(endAngleRad);
    const x4 = center + innerRadius * Math.cos(startAngleRad);
    const y4 = center + innerRadius * Math.sin(startAngleRad);
    
    const largeArc = endAngle - startAngle > 180 ? 1 : 0;
    
    return `M ${x1} ${y1} A ${outerRadius} ${outerRadius} 0 ${largeArc} 1 ${x2} ${y2} L ${x3} ${y3} A ${innerRadius} ${innerRadius} 0 ${largeArc} 0 ${x4} ${y4} Z`;
  };

  return (
    <div className="h-full flex flex-col">
      {/* Chart */}
      <div className="flex-1 flex items-center justify-center mb-4">
        <div className="relative">
          <svg width="220" height="220" viewBox="0 0 100 100" className="drop-shadow-sm">
            {data.map((item, index) => {
              const percentage = (item.count / total) * 100;
              const startAngle = (cumulativePercentage / 100) * 360;
              const endAngle = ((cumulativePercentage + percentage) / 100) * 360;
              
              cumulativePercentage += percentage;
              
              if (percentage === 0) return null;
              
              return (
                <path
                  key={index}
                  d={createArcPath(startAngle, endAngle, radius, innerRadius)}
                  fill={colors[index % colors.length]}
                  className="hover:opacity-80 transition-opacity duration-200"
                  stroke="white"
                  strokeWidth="0.8"
                />
              );
            })}
          </svg>
          {/* Center text */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center">
              <div className="text-xl font-bold text-gray-900">{total}</div>
              <div className="text-xs text-gray-500">Total</div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Legend */}
      <div className="grid grid-cols-2 gap-2 px-2">
        {data.map((item, index) => (
          <div key={index} className="flex items-center space-x-2">
            <div 
              className="w-3 h-3 rounded-full flex-shrink-0"
              style={{ backgroundColor: colors[index % colors.length] }}
            />
            <div className="flex-1 min-w-0">
              <div className="text-xs font-medium text-gray-900 truncate">{item.type || item.name}</div>
              <div className="text-xs text-gray-500">{item.count} ({((item.count / total) * 100).toFixed(0)}%)</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SimpleDonutChart;