import React, { useState, useEffect, useMemo } from 'react';
import Layout from '../components/Layout';
import apiService from '../services/apiService';

const HeatmapCell = ({ value, maxValue, label, onClick }) => {
  const intensity = value / maxValue;
  const getColor = (intensity) => {
    if (intensity > 0.8) return 'bg-purple-600';
    if (intensity > 0.6) return 'bg-purple-500';
    if (intensity > 0.4) return 'bg-purple-400';
    if (intensity > 0.2) return 'bg-purple-300';
    if (intensity > 0) return 'bg-purple-200';
    return 'bg-gray-100';
  };

  const getTextColor = (intensity) => {
    return intensity > 0.4 ? 'text-white' : 'text-gray-700';
  };

  return (
    <div 
      className={`w-8 h-8 ${getColor(intensity)} rounded cursor-pointer hover:ring-2 hover:ring-purple-300 transition-all duration-200 flex items-center justify-center group relative`}
      onClick={() => onClick && onClick(label, value)}
      title={`${label}: ${value} publications`}
    >
      <span className={`text-xs font-medium ${getTextColor(intensity)} opacity-0 group-hover:opacity-100 transition-opacity`}>
        {value}
      </span>
      <div className="absolute -top-10 left-1/2 transform -translate-x-1/2 bg-gray-900 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-10 shadow-lg">
        {label}: {value} publications
      </div>
    </div>
  );
};

const InsightsGaps = () => {
  const [selectedTimeRange, setSelectedTimeRange] = useState('all');
  const [areas, setAreas] = useState([]); // [{name, count}]
  const [pubs, setPubs] = useState([]); // fresh publications from backend
  const [byYear, setByYear] = useState([]); // [{year, count}]
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const [publications, topAreas, yearly] = await Promise.all([
          apiService.fetchPublications(),
          apiService.fetchResearchAreas(12),
          apiService.fetchPublicationsByYear()
        ]);
        setPubs(publications || []);
        setAreas(topAreas);
        setByYear((yearly || []).sort((a, b) => a.year - b.year));
        setError(null);
      } catch (e) {
        console.error('Insights load error:', e);
        setError('Failed to load insights data');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  // Build heatmap counts by top 6 areas x 12 months from publications dates
  const heatmapData = useMemo(() => {
    const topAreaNames = (areas || []).slice(0, 6).map(a => a.name);
    const matrix = Array.from({ length: topAreaNames.length }, () => Array(12).fill(0));
    for (const pub of pubs) {
      const dateStr = (pub.date || '').toString();
      // parse month (look for 3-letter month or numeric month)
      let mIdx = -1;
      const mMatch = dateStr.match(/\b(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\b/i);
      if (mMatch) {
        mIdx = months.findIndex(m => m.toLowerCase() === mMatch[0].toLowerCase());
      } else {
        const nMatch = dateStr.match(/\b(\d{1,2})[\/-](\d{1,2})[\/-](\d{2,4})/);
        if (nMatch) {
          const mm = parseInt(nMatch[1], 10);
          if (!Number.isNaN(mm) && mm >= 1 && mm <= 12) mIdx = mm - 1;
        }
      }
      if (mIdx < 0) continue;
      const kws = (pub.keywords || '').split(/[;,|]/).map(k => k.trim()).filter(Boolean);
      for (let ai = 0; ai < topAreaNames.length; ai++) {
        const name = topAreaNames[ai];
        if (kws.some(k => k.toLowerCase() === name.toLowerCase())) {
          matrix[ai][mIdx] += 1;
        }
      }
    }
    return { areas: topAreaNames, months, data: matrix };
  }, [areas]);

  const maxValue = useMemo(() => {
    if (!heatmapData || !heatmapData.data) return 0;
    return Math.max(0, ...heatmapData.data.flat());
  }, [heatmapData]);

  // Build Research Timeline events from real by-year counts
  const timelineEvents = useMemo(() => {
    if (!byYear || byYear.length === 0) return [];
    // Build per-year top keyword from pubs
    const yearToTopKeyword = (() => {
      const map = new Map();
      const countsPerYear = new Map(); // year -> Map(keyword->count)
      for (const pub of pubs) {
        const dateStr = (pub.date || '').toString();
        const yMatch = dateStr.match(/\b(19|20)\d{2}\b/);
        if (!yMatch) continue;
        const year = parseInt(yMatch[0], 10);
        const rawKw = (pub.keywords || '').toString();
        if (!rawKw) continue;
        const kws = rawKw.split(/[;,|]/).map(k => k.trim()).filter(Boolean);
        if (kws.length === 0) continue;
        if (!countsPerYear.has(year)) countsPerYear.set(year, new Map());
        const kwMap = countsPerYear.get(year);
        for (const kw of kws) {
          kwMap.set(kw, (kwMap.get(kw) || 0) + 1);
        }
      }
      for (const [year, kwMap] of countsPerYear.entries()) {
        let best = null;
        let bestCount = -1;
        for (const [kw, c] of kwMap.entries()) {
          if (c > bestCount) { best = kw; bestCount = c; }
        }
        map.set(year, best || null);
      }
      return map;
    })();

    const maxCount = Math.max(...byYear.map(y => y.count));
    return byYear.map((entry, idx) => {
      const prev = idx > 0 ? byYear[idx - 1].count : null;
      let type = 'trend';
      if (entry.count === maxCount && idx === byYear.length - 1) type = 'current';
      else if (prev != null) {
        const change = prev === 0 ? (entry.count > 0 ? 1 : 0) : (entry.count - prev) / prev;
        if (change >= 0.25) type = 'milestone';
        else if (change <= -0.25) type = 'challenge';
        else type = 'innovation';
      }
      const topKw = yearToTopKeyword.get(entry.year);
      return {
        year: entry.year,
        event: topKw ? `${topKw}` : '',
        type
      };
    });
  }, [byYear, pubs]);

  const topGaps = [
    {
      title: "Long-term Radiation Effects on Biological Systems",
      priority: "Critical",
      currentPublications: 23,
      targetPublications: 60,
      gap: 37,
      description: "Limited research on multi-generational radiation exposure effects in space environments. Critical for Mars missions.",
      recommendations: ["Establish long-term radiation exposure protocols", "Develop multi-generational study frameworks", "Increase funding for radiation biology research"],
      timeline: "2-3 years to address",
      fundingNeeded: "$4.2M"
    },
    {
      title: "Closed-loop Life Support Biological Systems",
      priority: "High",
      currentPublications: 18,
      targetPublications: 45,
      gap: 27,
      description: "Insufficient data on sustainable biological life support systems for long-duration missions.",
      recommendations: ["Develop integrated ecosystem models", "Test closed-loop systems", "Study microbiome interactions"],
      timeline: "3-4 years to address",
      fundingNeeded: "$3.8M"
    },
    {
      title: "Plant-Soil Interactions in Martian Conditions",
      priority: "High",
      currentPublications: 31,
      targetPublications: 55,
      gap: 24,
      description: "More research needed on how Earth plants interact with Martian regolith and atmospheric conditions.",
      recommendations: ["Expand Mars simulant studies", "Test diverse plant species", "Study soil microbiome adaptation"],
      timeline: "2-3 years to address",
      fundingNeeded: "$2.9M"
    },
    {
      title: "Psychological Adaptation to Isolation",
      priority: "Medium",
      currentPublications: 15,
      targetPublications: 35,
      gap: 20,
      description: "Limited studies on long-term psychological effects of space travel and isolation on crew performance.",
      recommendations: ["Conduct long-duration isolation studies", "Develop psychological support systems", "Study crew dynamics"],
      timeline: "1-2 years to address",
      fundingNeeded: "$1.5M"
    }
  ];

  return (
    <Layout>
      <div className="space-y-6">
        {/* Page Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Research Insights & Gaps</h1>
            <p className="text-gray-600">Analysis of research patterns, trends, and critical knowledge gaps</p>
          </div>
          <div className="flex items-center space-x-3">
            <select 
              value={selectedTimeRange}
              onChange={(e) => setSelectedTimeRange(e.target.value)}
              className="border-gray-300 rounded-lg focus:ring-purple-500 focus:border-purple-500"
            >
              <option value="2024">2024</option>
              <option value="2023">2023</option>
              <option value="2022">2022</option>
              <option value="all">All Years</option>
            </select>
            <button className="px-4 py-2 bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-lg hover:from-purple-600 hover:to-purple-700 transition-colors">
              Generate Report
            </button>
          </div>
        </div>

        {/* Timeline Strip (real data) */}
        <div className="bg-white rounded-2xl p-6 shadow-md">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Research Timeline</h2>
          <div className="relative">
            <div className="absolute left-0 right-0 top-6 h-0.5 bg-gray-200"></div>
            <div className="flex justify-between items-start relative">
              {timelineEvents.map((event, index) => (
                <div key={index} className="flex flex-col items-center">
                  <div className={`w-4 h-4 rounded-full border-2 bg-white ${
                    event.type === 'milestone' ? 'border-purple-500' :
                    event.type === 'challenge' ? 'border-red-500' :
                    event.type === 'innovation' ? 'border-green-500' :
                    'border-blue-500'
                  }`}></div>
                  <div className="mt-2 text-center max-w-24">
                    <p className="text-[11px] font-medium text-gray-900">{event.year}</p>
                    <p className="text-[10px] text-gray-600 mt-1 leading-tight">{event.event}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Research Activity Heatmap (real data) */}
        <div className="bg-white rounded-2xl p-4 sm:p-6 shadow-md">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 space-y-4 sm:space-y-0">
            <h2 className="text-lg font-semibold text-gray-900">Research Activity Heatmap</h2>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2 text-sm text-gray-600">
                <span>Low</span>
                <div className="flex space-x-1">
                  <div className="w-3 h-3 bg-gray-100 rounded"></div>
                  <div className="w-3 h-3 bg-purple-200 rounded"></div>
                  <div className="w-3 h-3 bg-purple-400 rounded"></div>
                  <div className="w-3 h-3 bg-purple-600 rounded"></div>
                </div>
                <span>High</span>
              </div>
            </div>
          </div>
          
          <div className="overflow-x-auto pb-4">
            <div className="flex flex-col space-y-2 min-w-max">
              {/* Header row */}
              <div className="flex items-center space-x-2">
                <div className="w-32 text-xs text-gray-600 font-medium"></div>
                {heatmapData.months.map((month, index) => (
                  <div key={index} className="w-8 text-xs text-gray-600 text-center font-medium">
                    {month}
                  </div>
                ))}
              </div>
              
              {/* Data rows */}
              {heatmapData.areas.map((area, areaIndex) => (
                <div key={area} className="flex items-center space-x-2">
                  <div className="w-32 text-xs text-gray-900 font-medium text-right pr-4 flex items-center justify-end">
                    <span className="break-words leading-tight">{area}</span>
                  </div>
                  {heatmapData.data[areaIndex].map((value, monthIndex) => (
                    <HeatmapCell 
                      key={`${areaIndex}-${monthIndex}`}
                      value={value}
                      maxValue={maxValue}
                      label={`${area} - ${heatmapData.months[monthIndex]}`}
                      onClick={(label, value) => console.log(`Clicked: ${label} with ${value} publications`)}
                    />
                  ))}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default InsightsGaps;
