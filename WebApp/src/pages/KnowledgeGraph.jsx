import React, { useState } from 'react';
import Layout from '../components/Layout';

const KnowledgeGraph = () => {
  const [selectedNode, setSelectedNode] = useState(null);
  const [filters, setFilters] = useState({
    nodeTypes: ['publications', 'authors', 'concepts'],
    connections: 'all',
    timeRange: 'all'
  });

  // Mock node data
  const mockNode = {
    id: 'astrobiology-1',
    type: 'concept',
    name: 'Astrobiology',
    description: 'The study of life in the universe, including its origin, evolution, distribution, and future.',
    connections: 156,
    publications: 89,
    authors: 34,
    relatedConcepts: ['Extremophiles', 'Mars Exploration', 'Biosignatures', 'Exoplanets'],
    keyAuthors: ['Dr. Sarah Chen', 'Dr. Michael Rodriguez', 'Dr. Lisa Park'],
    recentActivity: '23 new publications this year'
  };

  const nodeTypes = [
    { id: 'publications', name: 'Publications', color: '#7c3aed', count: 608 },
    { id: 'authors', name: 'Authors', color: '#059669', count: 234 },
    { id: 'concepts', name: 'Concepts', color: '#dc2626', count: 89 },
    { id: 'institutions', name: 'Institutions', color: '#ea580c', count: 45 }
  ];

  return (
    <Layout>
      <div className="space-y-6">
        {/* Page Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Knowledge Graph Explorer</h1>
            <p className="text-gray-600">Interactive visualization of research connections and relationships</p>
          </div>
          <button className="px-4 py-2 bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-lg hover:from-purple-600 hover:to-purple-700 transition-colors">
            Export Graph
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Main Graph Canvas */}
          <div className="lg:col-span-3">
            <div className="bg-white rounded-2xl shadow-md">
              {/* Toolbar */}
              <div className="border-b border-gray-200 p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-2">
                      <span className="text-sm font-medium text-gray-700">Node Types:</span>
                      {nodeTypes.map((type) => (
                        <label key={type.id} className="flex items-center">
                          <input
                            type="checkbox"
                            checked={filters.nodeTypes.includes(type.id)}
                            onChange={(e) => {
                              const newTypes = e.target.checked 
                                ? [...filters.nodeTypes, type.id]
                                : filters.nodeTypes.filter(t => t !== type.id);
                              setFilters({ ...filters, nodeTypes: newTypes });
                            }}
                            className="rounded border-gray-300 text-purple-600 focus:ring-purple-500 mr-1"
                          />
                          <span className="text-sm text-gray-600">{type.name}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-4">
                    <select 
                      value={filters.connections}
                      onChange={(e) => setFilters({ ...filters, connections: e.target.value })}
                      className="text-sm border-gray-300 rounded-lg focus:ring-purple-500 focus:border-purple-500"
                    >
                      <option value="all">All Connections</option>
                      <option value="strong">Strong Connections</option>
                      <option value="recent">Recent Connections</option>
                    </select>
                    
                    <div className="flex items-center space-x-2">
                      <button className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100">
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                      </button>
                      <button className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100">
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4" />
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Interactive Canvas */}
              <div className="relative h-96 lg:h-[600px] bg-gray-50">
                {/* Mock Graph Visualization */}
                <svg className="w-full h-full" viewBox="0 0 800 600">
                  {/* Background grid */}
                  <defs>
                    <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                      <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#f3f4f6" strokeWidth="1"/>
                    </pattern>
                  </defs>
                  <rect width="100%" height="100%" fill="url(#grid)" />
                  
                  {/* Connections */}
                  <g className="connections">
                    <line x1="400" y1="300" x2="200" y2="150" stroke="#e5e7eb" strokeWidth="2" />
                    <line x1="400" y1="300" x2="600" y2="150" stroke="#e5e7eb" strokeWidth="2" />
                    <line x1="400" y1="300" x2="300" y2="450" stroke="#e5e7eb" strokeWidth="2" />
                    <line x1="400" y1="300" x2="500" y2="450" stroke="#e5e7eb" strokeWidth="2" />
                    <line x1="200" y1="150" x2="600" y2="150" stroke="#e5e7eb" strokeWidth="1" />
                  </g>
                  
                  {/* Nodes */}
                  <g className="nodes">
                    {/* Central node - Astrobiology */}
                    <circle 
                      cx="400" cy="300" r="30" 
                      fill="#7c3aed" 
                      className="cursor-pointer hover:fill-purple-700 transition-colors"
                      onClick={() => setSelectedNode(mockNode)}
                    />
                    <text x="400" y="305" textAnchor="middle" className="text-white text-sm font-medium fill-white">
                      Astrobiology
                    </text>
                    
                    {/* Connected nodes */}
                    <circle cx="200" cy="150" r="20" fill="#059669" className="cursor-pointer hover:fill-green-700 transition-colors" />
                    <text x="200" y="155" textAnchor="middle" className="text-white text-xs fill-white">Authors</text>
                    
                    <circle cx="600" cy="150" r="20" fill="#dc2626" className="cursor-pointer hover:fill-red-700 transition-colors" />
                    <text x="600" y="155" textAnchor="middle" className="text-white text-xs fill-white">Mars</text>
                    
                    <circle cx="300" cy="450" r="15" fill="#ea580c" className="cursor-pointer hover:fill-orange-700 transition-colors" />
                    <text x="300" y="455" textAnchor="middle" className="text-white text-xs fill-white">NASA</text>
                    
                    <circle cx="500" cy="450" r="15" fill="#7c3aed" className="cursor-pointer hover:fill-purple-700 transition-colors" />
                    <text x="500" y="455" textAnchor="middle" className="text-white text-xs fill-white">Papers</text>
                  </g>
                </svg>

                {/* Graph Controls */}
                <div className="absolute bottom-4 left-4 flex items-center space-x-2">
                  <button className="p-2 bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow">
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                  </button>
                  <button className="p-2 bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow">
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                    </svg>
                  </button>
                  <button className="p-2 bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow">
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                  </button>
                </div>

                {/* Legend */}
                <div className="absolute top-4 right-4 bg-white rounded-lg shadow-md p-4">
                  <h4 className="font-medium text-gray-900 mb-2">Legend</h4>
                  <div className="space-y-2">
                    {nodeTypes.map((type) => (
                      <div key={type.id} className="flex items-center space-x-2">
                        <div 
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: type.color }}
                        />
                        <span className="text-sm text-gray-600">{type.name} ({type.count})</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Panel: Node Details */}
          <div className="space-y-6">
            {selectedNode ? (
              <div className="bg-white rounded-2xl p-6 shadow-md">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">{selectedNode.name}</h3>
                  <button 
                    onClick={() => setSelectedNode(null)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800 mb-2">
                      {selectedNode.type}
                    </span>
                    <p className="text-sm text-gray-600">{selectedNode.description}</p>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm font-medium text-gray-900">{selectedNode.connections}</p>
                      <p className="text-xs text-gray-500">Connections</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">{selectedNode.publications}</p>
                      <p className="text-xs text-gray-500">Publications</p>
                    </div>
                  </div>

                  <div>
                    <h4 className="text-sm font-medium text-gray-900 mb-2">Related Concepts</h4>
                    <div className="flex flex-wrap gap-1">
                      {selectedNode.relatedConcepts.map((concept, index) => (
                        <span key={index} className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-gray-100 text-gray-800">
                          {concept}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h4 className="text-sm font-medium text-gray-900 mb-2">Key Authors</h4>
                    <div className="space-y-1">
                      {selectedNode.keyAuthors.map((author, index) => (
                        <p key={index} className="text-sm text-gray-600">{author}</p>
                      ))}
                    </div>
                  </div>

                  <div className="pt-4 border-t">
                    <p className="text-xs text-gray-500 mb-3">{selectedNode.recentActivity}</p>
                    <div className="space-y-2">
                      <button className="w-full px-3 py-2 text-sm text-purple-600 border border-purple-200 rounded-lg hover:bg-purple-50 transition-colors">
                        Explore Connections
                      </button>
                      <button className="w-full px-3 py-2 text-sm text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                        View Publications
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-2xl p-6 shadow-md text-center">
                <svg className="mx-auto h-12 w-12 text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <h3 className="text-lg font-medium text-gray-900 mb-2">Select a Node</h3>
                <p className="text-gray-600">Click on any node in the graph to view detailed information and connections.</p>
              </div>
            )}

            {/* Graph Statistics */}
            <div className="bg-white rounded-2xl p-6 shadow-md">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Graph Statistics</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Total Nodes</span>
                  <span className="text-sm font-medium">976</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Total Connections</span>
                  <span className="text-sm font-medium">2,847</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Avg Connections</span>
                  <span className="text-sm font-medium">2.9</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Density</span>
                  <span className="text-sm font-medium">0.34</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default KnowledgeGraph;
