import React from 'react';

const SimpleLineChart = ({ data, xKey, yKey, color = '#7c3aed' }) => {
  if (!data || data.length === 0) return <div className="flex items-center justify-center h-full text-gray-500">No data available</div>;

  const maxValue = Math.max(...data.map(item => item[yKey]));
  const minValue = Math.min(...data.map(item => item[yKey]));
  const range = maxValue - minValue || 1;
  
  // Add some padding to the range for better visualization
  const paddedMin = minValue - range * 0.1;
  const paddedMax = maxValue + range * 0.1;
  const paddedRange = paddedMax - paddedMin;
  
  const chartWidth = 700;
  const chartHeight = 420;
  const padding = { top: 20, right: 30, bottom: 40, left: 40 };

  const points = data.map((item, index) => {
    const x = padding.left + (index / (data.length - 1)) * (chartWidth - padding.left - padding.right);
    const y = padding.top + (1 - (item[yKey] - paddedMin) / paddedRange) * (chartHeight - padding.top - padding.bottom);
    return { x, y, value: item[yKey], label: item[xKey] };
  });

  const pathData = points.map((point, index) => 
    `${index === 0 ? 'M' : 'L'} ${point.x} ${point.y}`
  ).join(' ');

  // Create smooth curve path
  const createSmoothPath = (points) => {
    if (points.length < 2) return pathData;
    
    let path = `M ${points[0].x} ${points[0].y}`;
    
    for (let i = 1; i < points.length; i++) {
      const prev = points[i - 1];
      const curr = points[i];
      const next = points[i + 1];
      
      if (i === 1) {
        // First curve
        const cp1x = prev.x + (curr.x - prev.x) * 0.3;
        const cp1y = prev.y;
        const cp2x = curr.x - (curr.x - prev.x) * 0.3;
        const cp2y = curr.y;
        path += ` C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${curr.x} ${curr.y}`;
      } else if (i === points.length - 1) {
        // Last curve
        const cp1x = prev.x + (curr.x - prev.x) * 0.3;
        const cp1y = prev.y;
        const cp2x = curr.x - (curr.x - prev.x) * 0.3;
        const cp2y = curr.y;
        path += ` C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${curr.x} ${curr.y}`;
      } else {
        // Middle curves
        const cp1x = prev.x + (curr.x - prev.x) * 0.3;
        const cp1y = prev.y + (curr.y - prev.y) * 0.3;
        const cp2x = curr.x - (next.x - prev.x) * 0.1;
        const cp2y = curr.y - (next.y - prev.y) * 0.1;
        path += ` C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${curr.x} ${curr.y}`;
      }
    }
    
    return path;
  };

  const smoothPath = createSmoothPath(points);

  return (
    <div className="h-full flex flex-col">
      {/* Chart area */}
      <div className="flex-1 relative px-4">
        <svg 
          width="100%" 
          height="100%" 
          viewBox={`0 0 ${chartWidth} ${chartHeight + 20}`}
          className="overflow-visible"
        >
          {/* Grid lines */}
          <defs>
            <pattern id="grid-line" width="50" height="25" patternUnits="userSpaceOnUse">
              <path d="M 50 0 L 0 0 0 25" fill="none" stroke="#f1f5f9" strokeWidth="1"/>
            </pattern>
            <linearGradient id="areaGradient" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor={color} stopOpacity="0.2"/>
              <stop offset="100%" stopColor={color} stopOpacity="0.05"/>
            </linearGradient>
          </defs>
          
          {/* Background grid */}
          <rect 
            x={padding.left} 
            y={padding.top} 
            width={chartWidth - padding.left - padding.right} 
            height={chartHeight - padding.top - padding.bottom} 
            fill="url(#grid-line)" 
          />
          
          {/* Y-axis */}
          <line 
            x1={padding.left} 
            y1={padding.top} 
            x2={padding.left} 
            y2={chartHeight - padding.bottom} 
            stroke="#e2e8f0" 
            strokeWidth="1"
          />
          
          {/* X-axis */}
          <line 
            x1={padding.left} 
            y1={chartHeight - padding.bottom} 
            x2={chartWidth - padding.right} 
            y2={chartHeight - padding.bottom} 
            stroke="#e2e8f0" 
            strokeWidth="1"
          />
          
          {/* Area under the curve */}
          <path
            d={`${smoothPath} L ${points[points.length - 1].x} ${chartHeight - padding.bottom} L ${points[0].x} ${chartHeight - padding.bottom} Z`}
            fill="url(#areaGradient)"
          />
          
          {/* Main line */}
          <path
            d={smoothPath}
            fill="none"
            stroke={color}
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          
          {/* Data points */}
          {points.map((point, index) => (
            <g key={index}>
              <circle
                cx={point.x}
                cy={point.y}
                r="4"
                fill="white"
                stroke={color}
                strokeWidth="2"
                className="hover:r-6 transition-all duration-200 cursor-pointer drop-shadow-sm"
              />
              <circle
                cx={point.x}
                cy={point.y}
                r="12"
                fill="transparent"
                className="cursor-pointer"
              >
                <title>{point.label}: {point.value} publications</title>
              </circle>
            </g>
          ))}
          
          {/* Y-axis labels */}
          {[paddedMin, (paddedMin + paddedMax) / 2, paddedMax].map((value, index) => {
            const y = padding.top + (index / 2) * (chartHeight - padding.top - padding.bottom);
            return (
              <text 
                key={index} 
                x={padding.left - 10} 
                y={chartHeight - y + 4} 
                textAnchor="end" 
                className="text-xs fill-gray-500"
              >
                {Math.round(value)}
              </text>
            );
          })}
        </svg>
      </div>
      
      {/* X-axis labels */}
      <div className="flex justify-between px-4 pt-3 pb-1">
        {data.map((item, index) => (
          <div key={index} className="text-sm font-medium text-gray-700 text-center flex-1">
            {item[xKey]}
          </div>
        ))}
      </div>
    </div>
  );
};

export default SimpleLineChart;