import React, { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import PaperSelector from '../components/PaperSelector';
import apiService from '../services/apiService';

const KnowledgeGraph = () => {
  const [selectedNode, setSelectedNode] = useState(null);
  const [filters, setFilters] = useState({
    nodeTypes: ['publications', 'authors', 'concepts'],
    connections: 'all',
    timeRange: 'all'
  });
  const [nodes, setNodes] = useState([]);
  const [edges, setEdges] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedPapers, setSelectedPapers] = useState([]);
  const [showPaperSelector, setShowPaperSelector] = useState(true);

  // Generate graph based on selected papers
  const generateGraph = async () => {
    if (selectedPapers.length === 0) {
      setError('Please select at least one paper to generate the graph');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      const paperTitles = selectedPapers.map(p => p.title);
      const [nodesData, edgesData] = await Promise.all([
        apiService.fetchKnowledgeGraphNodes(paperTitles),
        apiService.fetchKnowledgeGraphEdges(paperTitles)
      ]);
      
      setNodes(nodesData);
      setEdges(edgesData);
      setShowPaperSelector(false);
    } catch (err) {
      console.error('Error generating knowledge graph:', err);
      setError('Failed to generate knowledge graph');
    } finally {
      setLoading(false);
    }
  };

  // Handle paper selection changes
  const handlePapersChange = (papers) => {
    setSelectedPapers(papers);
  };

  // Get node types with counts from real data
  const nodeTypes = [
    { 
      id: 'publications', 
      name: 'Publications', 
      color: '#7c3aed', 
      count: nodes.filter(n => n.type === 'publication').length 
    },
    { 
      id: 'authors', 
      name: 'Authors', 
      color: '#059669', 
      count: nodes.filter(n => n.type === 'author').length 
    },
    { 
      id: 'concepts', 
      name: 'Concepts', 
      color: '#dc2626', 
      count: nodes.filter(n => n.type === 'concept').length 
    }
  ];

  // Filter nodes based on selected types
  const filteredNodes = nodes.filter(node => 
    filters.nodeTypes.includes(node.type === 'publication' ? 'publications' : node.type + 's')
  );

  // Filter edges based on filtered nodes
  const filteredEdges = edges.filter(edge => {
    const sourceExists = filteredNodes.some(n => n.id === edge.source);
    const targetExists = filteredNodes.some(n => n.id === edge.target);
    return sourceExists && targetExists;
  });

  return (
    <Layout>
      <div className="space-y-6">
        {/* Page Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Knowledge Graph Explorer</h1>
            <p className="text-gray-600">
              {showPaperSelector 
                ? 'Select papers to generate a focused knowledge graph'
                : 'Interactive visualization of research connections and relationships'
              }
            </p>
          </div>
          <div className="flex items-center space-x-2">
            {!showPaperSelector && (
              <button 
                onClick={() => setShowPaperSelector(true)}
                className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
              >
                Select Different Papers
              </button>
            )}
            <button className="px-4 py-2 bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-lg hover:from-purple-600 hover:to-purple-700 transition-colors">
              Export Graph
            </button>
          </div>
        </div>

        {showPaperSelector ? (
          /* Paper Selection Interface */
          <div className="max-w-4xl mx-auto">
            <PaperSelector
              selectedPapers={selectedPapers}
              onPapersChange={handlePapersChange}
              onGenerateGraph={generateGraph}
            />
            {error && (
              <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-red-600">{error}</p>
              </div>
            )}
          </div>
        ) : (
          /* Knowledge Graph Interface */
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
                {loading ? (
                  <div className="flex items-center justify-center h-full">
                    <div className="text-center">
                      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
                      <p className="text-gray-600">Loading knowledge graph...</p>
                    </div>
                  </div>
                ) : error ? (
                  <div className="flex items-center justify-center h-full">
                    <div className="text-center">
                      <svg className="mx-auto h-12 w-12 text-red-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                      </svg>
                      <p className="text-red-600">{error}</p>
                    </div>
                  </div>
                ) : (
                  <svg className="w-full h-full" viewBox="0 0 800 600">
                  {/* Background grid */}
                  <defs>
                    <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                      <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#f3f4f6" strokeWidth="1"/>
                    </pattern>
                  </defs>
                  <rect width="100%" height="100%" fill="url(#grid)" />
                  
                    {/* Radial Layout */}
                    {(() => {
                      const centerX = 400;
                      const centerY = 300;
                      const radiusConcept = 170;
                      const radiusPaper = 260;

                      const conceptNodes = filteredNodes.filter(n => n.type === 'concept').slice(0, 30);
                      const paperNodes = filteredNodes.filter(n => n.type === 'publication').slice(0, 20);

                      const placedPositions = new Map();

                      // Place concept nodes in inner ring
                      conceptNodes.forEach((node, idx) => {
                        const angle = (2 * Math.PI * idx) / Math.max(conceptNodes.length, 1);
                        const x = centerX + radiusConcept * Math.cos(angle);
                        const y = centerY + radiusConcept * Math.sin(angle);
                        placedPositions.set(node.id, { x, y });
                      });

                      // Place paper nodes in outer ring
                      paperNodes.forEach((node, idx) => {
                        const angle = (2 * Math.PI * idx) / Math.max(paperNodes.length, 1);
                        const x = centerX + radiusPaper * Math.cos(angle);
                        const y = centerY + radiusPaper * Math.sin(angle);
                        placedPositions.set(node.id, { x, y });
                      });

                      const [viewX, viewY] = [0, 0];
                      const [scale] = [1];

                      return (
                        <>
                          {/* Zoom/pan group */}
                          <g transform={`translate(${viewX},${viewY}) scale(${scale})`}>
                          {/* Connections */}
                          <g className="connections">
                            {filteredEdges.map(edge => {
                              const s = placedPositions.get(edge.source);
                              const t = placedPositions.get(edge.target);
                              if (!s || !t) return null;
                              const stroke = edge.type === 'paper-paper' ? '#cbd5e1' : '#e5e7eb';
                              return (
                                <line
                                  key={edge.id}
                                  x1={s.x}
                                  y1={s.y}
                                  x2={t.x}
                                  y2={t.y}
                                  stroke={stroke}
                                  strokeWidth={edge.strength === 'strong' ? 3 : edge.strength === 'medium' ? 2 : 1}
                                  opacity={edge.type === 'paper-paper' ? 0.5 : edge.strength === 'strong' ? 0.8 : edge.strength === 'medium' ? 0.6 : 0.35}
                                />
                              );
                            })}
                          </g>

                          {/* Nodes */}
                          <g className="nodes">
                            {[...conceptNodes, ...paperNodes].map(node => {
                              const pos = placedPositions.get(node.id);
                              if (!pos) return null;
                              const radius = node.type === 'concept' ? 24 : 18;
                              const maxChars = node.type === 'concept' ? 10 : 8;
                              const label = node.name.length > maxChars ? node.name.slice(0, maxChars) + '…' : node.name;
                              return (
                                <g key={node.id} className="cursor-pointer" onClick={() => setSelectedNode(node)}>
                                  <circle cx={pos.x} cy={pos.y} r={radius} fill={node.color || '#6b7280'} />
                                  <text x={pos.x} y={pos.y + 3} textAnchor="middle" dominantBaseline="middle" className="fill-white" style={{ fontSize: 9, fontWeight: 700 }}>
                                    {label}
                                  </text>
                                </g>
                              );
                            })}
                          </g>
                          </g>
                        </>
                      );
                    })()}
                  
                  {/* Nodes */}
                  <g className="nodes">
                      {filteredNodes.slice(0, 20).map((node, index) => {
                        // Simple positioning for demo
                        const x = 100 + (index * 60) % 600;
                        const y = 100 + (index * 40) % 400;
                        const radius = node.type === 'concept' ? 25 : node.type === 'publication' ? 20 : 15;
                        
                        return (
                          <g key={node.id}>
                    <circle 
                              cx={x} 
                              cy={y} 
                              r={radius} 
                              fill={node.color || '#6b7280'} 
                              className="cursor-pointer hover:opacity-80 transition-opacity"
                              onClick={() => setSelectedNode(node)}
                            />
                            <text x={x} y={y + 3} textAnchor="middle" dominantBaseline="middle" className="fill-white" style={{ fontSize: 9, fontWeight: 700 }}>
                              {(node.name || '').slice(0, Math.max(6, Math.min(10, Math.floor(radius * 0.8))))}{(node.name || '').length > Math.max(6, Math.min(10, Math.floor(radius * 0.8))) ? '…' : ''}
                            </text>
                          </g>
                        );
                      })}
                  </g>
                </svg>
                )}

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
                    {selectedNode.category && (
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 ml-2">
                        {selectedNode.category}
                      </span>
                    )}
                    {selectedNode.type === 'concept' && (
                      <p className="text-sm text-gray-600 mt-2">
                        Research concept with {selectedNode.frequency} occurrences across {selectedNode.paperCount} papers
                      </p>
                    )}
                    {selectedNode.type === 'publication' && (
                      <p className="text-sm text-gray-600 mt-2">
                        Research publication with {selectedNode.connectionCount} concept connections
                      </p>
                    )}
                    {selectedNode.type === 'author' && (
                      <p className="text-sm text-gray-600 mt-2">
                        Author from {selectedNode.institution} with {selectedNode.paperCount} publications
                      </p>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    {selectedNode.type === 'concept' && (
                      <>
                        <div>
                          <p className="text-sm font-medium text-gray-900">{selectedNode.frequency}</p>
                          <p className="text-xs text-gray-500">Frequency</p>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-900">{selectedNode.paperCount}</p>
                          <p className="text-xs text-gray-500">Papers</p>
                        </div>
                      </>
                    )}
                    {selectedNode.type === 'publication' && (
                      <>
                    <div>
                          <p className="text-sm font-medium text-gray-900">{selectedNode.connectionCount}</p>
                      <p className="text-xs text-gray-500">Connections</p>
                    </div>
                    <div>
                          <p className="text-sm font-medium text-gray-900">Research</p>
                          <p className="text-xs text-gray-500">Type</p>
                        </div>
                      </>
                    )}
                    {selectedNode.type === 'author' && (
                      <>
                        <div>
                          <p className="text-sm font-medium text-gray-900">{selectedNode.paperCount}</p>
                          <p className="text-xs text-gray-500">Papers</p>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-900">Author</p>
                          <p className="text-xs text-gray-500">Role</p>
                    </div>
                      </>
                    )}
                  </div>

                  {selectedNode.url && (
                  <div>
                      <h4 className="text-sm font-medium text-gray-900 mb-2">Link</h4>
                      <a 
                        href={selectedNode.url} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-sm text-blue-600 hover:text-blue-800 break-all"
                      >
                        {selectedNode.url}
                      </a>
                    </div>
                  )}

                  {selectedNode.institution && (
                  <div>
                      <h4 className="text-sm font-medium text-gray-900 mb-2">Institution</h4>
                      <p className="text-sm text-gray-600">{selectedNode.institution}</p>
                    </div>
                  )}

                  <div className="pt-4 border-t">
                    <div className="space-y-2">
                      <button className="w-full px-3 py-2 text-sm text-purple-600 border border-purple-200 rounded-lg hover:bg-purple-50 transition-colors">
                        Explore Connections
                      </button>
                      {selectedNode.type === 'publication' && (
                      <button className="w-full px-3 py-2 text-sm text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                          View Details
                      </button>
                      )}
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
                  <span className="text-sm text-gray-600">Selected Papers</span>
                  <span className="text-sm font-medium">{selectedPapers.length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Total Nodes</span>
                  <span className="text-sm font-medium">{nodes.length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Total Connections</span>
                  <span className="text-sm font-medium">{edges.length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Concepts</span>
                  <span className="text-sm font-medium">{nodes.filter(n => n.type === 'concept').length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Publications</span>
                  <span className="text-sm font-medium">{nodes.filter(n => n.type === 'publication').length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Authors</span>
                  <span className="text-sm font-medium">{nodes.filter(n => n.type === 'author').length}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
        )}
      </div>
    </Layout>
  );
};

export default KnowledgeGraph;
