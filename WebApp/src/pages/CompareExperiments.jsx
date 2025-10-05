import React, { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import dataService from '../services/dataService';

const CompareExperiments = () => {
  const [selectedExperiments, setSelectedExperiments] = useState([]);
  const [experiments, setExperiments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  const mapPlatformToType = (platform) => {
    if (!platform) return 'N/A';
    const p = String(platform).toLowerCase();
    if (p.includes('iss') || p.includes('space station')) return 'In-flight';
    if (p.includes('ground')) return 'Ground-based';
    if (p.includes('parabolic') || p.includes('sounding')) return 'Simulation';
    return 'N/A';
  };

  // Enhanced data extraction functions
  const extractDuration = (title, keywords) => {
    const text = `${title} ${keywords}`.toLowerCase();
    
    // Look for duration patterns
    const durationPatterns = [
      { pattern: /(\d+)\s*day/g, unit: 'days' },
      { pattern: /(\d+)\s*week/g, unit: 'weeks' },
      { pattern: /(\d+)\s*month/g, unit: 'months' },
      { pattern: /(\d+)\s*year/g, unit: 'years' },
      { pattern: /(\d+)\s*hour/g, unit: 'hours' },
      { pattern: /(\d+)\s*minute/g, unit: 'minutes' },
      { pattern: /long[\s-]?term/g, unit: 'long-term' },
      { pattern: /short[\s-]?term/g, unit: 'short-term' },
      { pattern: /acute/g, unit: 'acute' },
      { pattern: /chronic/g, unit: 'chronic' }
    ];

    for (const { pattern, unit } of durationPatterns) {
      const matches = text.match(pattern);
      if (matches) {
        if (unit === 'long-term' || unit === 'short-term' || unit === 'acute' || unit === 'chronic') {
          return unit;
        }
        const numbers = matches.map(match => match.match(/\d+/)?.[0]).filter(Boolean);
        if (numbers.length > 0) {
          const maxDuration = Math.max(...numbers.map(Number));
          return `${maxDuration} ${unit}`;
        }
      }
    }
    
    return 'N/A';
  };

  const extractMethodology = (keywords) => {
    if (!keywords) return 'N/A';
    
    const methods = [];
    const text = keywords.toLowerCase();
    
    // Research methodologies
    if (text.includes('in vivo')) methods.push('In Vivo');
    if (text.includes('in vitro')) methods.push('In Vitro');
    if (text.includes('pcr')) methods.push('PCR Analysis');
    if (text.includes('microscopy') || text.includes('microscopic')) methods.push('Microscopy');
    if (text.includes('behavioral') || text.includes('behavior')) methods.push('Behavioral Testing');
    if (text.includes('imaging') || text.includes('mri') || text.includes('ct')) methods.push('Medical Imaging');
    if (text.includes('histology') || text.includes('histological')) methods.push('Histology');
    if (text.includes('biochemical') || text.includes('biochemistry')) methods.push('Biochemical Analysis');
    if (text.includes('molecular') || text.includes('genetic')) methods.push('Molecular Biology');
    if (text.includes('telemetry') || text.includes('monitoring')) methods.push('Telemetry');
    if (text.includes('culture') || text.includes('cultured')) methods.push('Cell Culture');
    if (text.includes('flow cytometry')) methods.push('Flow Cytometry');
    if (text.includes('western blot')) methods.push('Western Blot');
    if (text.includes('immunohistochemistry')) methods.push('Immunohistochemistry');
    
    return methods.length > 0 ? methods.join(', ') : 'N/A';
  };

  const extractSampleSize = (title, keywords) => {
    const text = `${title} ${keywords}`.toLowerCase();
    
    // Look for sample size patterns
    const patterns = [
      /n\s*=\s*(\d+)/g,
      /(\d+)\s*mice/g,
      /(\d+)\s*rats/g,
      /(\d+)\s*subjects/g,
      /(\d+)\s*participants/g,
      /(\d+)\s*samples/g,
      /(\d+)\s*cells/g,
      /(\d+)\s*animals/g,
      /(\d+)\s*individuals/g
    ];

    const sizes = [];
    patterns.forEach(pattern => {
      const matches = text.match(pattern);
      if (matches) {
        matches.forEach(match => {
          const number = match.match(/\d+/)?.[0];
          if (number) sizes.push(parseInt(number));
        });
      }
    });

    if (sizes.length > 0) {
      const maxSize = Math.max(...sizes);
      const minSize = Math.min(...sizes);
      return maxSize === minSize ? maxSize.toString() : `${minSize}-${maxSize}`;
    }
    
    return 'N/A';
  };

  const determineStatus = (year) => {
    if (!year || year === 'N/A') return 'Unknown';
    
    const currentYear = new Date().getFullYear();
    const yearNum = parseInt(year);
    
    if (yearNum >= currentYear - 2) return 'Recent';
    if (yearNum >= currentYear - 5) return 'Completed';
    if (yearNum >= currentYear - 10) return 'Completed';
    return 'Archived';
  };

  const extractResearchFocus = (keywords) => {
    if (!keywords) return 'N/A';
    
    const text = keywords.toLowerCase();
    const focusAreas = [];
    
    // Research focus categories
    if (text.includes('bone') || text.includes('osteoporosis') || text.includes('skeletal')) {
      focusAreas.push('Bone Health');
    }
    if (text.includes('immune') || text.includes('lymphocyte') || text.includes('cytokine')) {
      focusAreas.push('Immune System');
    }
    if (text.includes('cardiovascular') || text.includes('heart') || text.includes('cardiac')) {
      focusAreas.push('Cardiovascular');
    }
    if (text.includes('neurological') || text.includes('brain') || text.includes('neural')) {
      focusAreas.push('Neurological');
    }
    if (text.includes('muscle') || text.includes('muscular') || text.includes('skeletal muscle')) {
      focusAreas.push('Muscle Function');
    }
    if (text.includes('stem cell') || text.includes('regeneration') || text.includes('differentiation')) {
      focusAreas.push('Stem Cell Biology');
    }
    if (text.includes('metabolism') || text.includes('metabolic') || text.includes('glucose')) {
      focusAreas.push('Metabolism');
    }
    if (text.includes('vision') || text.includes('ocular') || text.includes('retinal')) {
      focusAreas.push('Vision');
    }
    if (text.includes('balance') || text.includes('vestibular') || text.includes('sensorimotor')) {
      focusAreas.push('Balance & Coordination');
    }
    
    return focusAreas.length > 0 ? focusAreas.join(', ') : 'General Research';
  };

  const extractFunding = (title, keywords) => {
    const text = `${title} ${keywords}`.toLowerCase();
    
    // Look for funding agency patterns
    if (text.includes('nasa')) return 'NASA';
    if (text.includes('esa') || text.includes('european space agency')) return 'ESA';
    if (text.includes('jaxa') || text.includes('japan aerospace')) return 'JAXA';
    if (text.includes('roscosmos') || text.includes('russian space')) return 'Roscosmos';
    if (text.includes('nsf') || text.includes('national science foundation')) return 'NSF';
    if (text.includes('nih') || text.includes('national institutes of health')) return 'NIH';
    if (text.includes('international') || text.includes('collaboration')) return 'International';
    
    return 'N/A';
  };

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        await dataService.loadPublications();
        const transformed = dataService.transformPublicationsForSearch(dataService.publications);
        const mapped = transformed.map(pub => ({
          id: pub.pub_id,
          title: pub.title || 'N/A',
          type: mapPlatformToType(pub.platform),
          duration: extractDuration(pub.title, pub.keywords),
          subjects: pub.organism || 'N/A',
          location: pub.platform || 'N/A',
          year: pub.year || 'N/A',
          status: determineStatus(pub.year),
          methodology: extractMethodology(pub.keywords),
          sampleSize: extractSampleSize(pub.title, pub.keywords),
          funding: extractFunding(pub.title, pub.keywords),
          researchFocus: extractResearchFocus(pub.keywords),
          results: pub.summary || 'N/A',
          publications: '1', // Each entry represents one publication
          citations: typeof pub.citations === 'number' ? pub.citations : 'N/A'
        }));
        setExperiments(mapped);
        setError(null);
      } catch (e) {
        setError('Failed to load experiments');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const comparisonFields = [
    { key: 'title', label: 'Experiment Title', type: 'text' },
    { key: 'type', label: 'Type', type: 'badge' },
    { key: 'researchFocus', label: 'Research Focus', type: 'badge' },
    { key: 'duration', label: 'Duration', type: 'text' },
    { key: 'subjects', label: 'Test Subjects', type: 'text' },
    { key: 'location', label: 'Location', type: 'text' },
    { key: 'year', label: 'Year', type: 'text' },
    { key: 'status', label: 'Status', type: 'status' },
    { key: 'methodology', label: 'Methodology', type: 'highlight' },
    { key: 'sampleSize', label: 'Sample Size', type: 'number' },
    { key: 'funding', label: 'Funding', type: 'text' },
    { key: 'results', label: 'Key Results', type: 'highlight' },
    { key: 'publications', label: 'Publications', type: 'number' },
    { key: 'citations', label: 'Citations', type: 'number' }
  ];

  const handleExperimentSelect = (experiment) => {
    if (selectedExperiments.find(exp => exp.id === experiment.id)) {
      setSelectedExperiments(selectedExperiments.filter(exp => exp.id !== experiment.id));
    } else if (selectedExperiments.length < 3) {
      setSelectedExperiments([...selectedExperiments, experiment]);
    }
  };

  const getFieldValue = (experiment, field) => {
    const value = experiment[field.key];
    if (value === undefined || value === null || value === '') return 'N/A';
    return value;
  };

  const getFieldDifferences = (field) => {
    if (selectedExperiments.length < 2) return [];
    
    const values = selectedExperiments.map(exp => getFieldValue(exp, field));
    const differences = [];
    
    for (let i = 0; i < values.length; i++) {
      let isDifferent = false;
      for (let j = 0; j < values.length; j++) {
        if (i !== j && values[i] !== values[j]) {
          isDifferent = true;
          break;
        }
      }
      differences.push(isDifferent);
    }
    
    return differences;
  };

  const renderFieldValue = (experiment, field, isDifferent) => {
    const value = getFieldValue(experiment, field);
    const baseClasses = `p-3 ${isDifferent ? 'bg-yellow-50 border-l-4 border-yellow-400' : ''}`;
    
    switch (field.type) {
      case 'badge':
        const getBadgeColor = (value) => {
          // Type badges
          if (value === 'In-flight') return 'bg-purple-100 text-purple-800';
          if (value === 'Ground-based') return 'bg-blue-100 text-blue-800';
          if (value === 'Simulation') return 'bg-green-100 text-green-800';
          
          // Research focus badges
          if (value.includes('Bone Health')) return 'bg-orange-100 text-orange-800';
          if (value.includes('Immune System')) return 'bg-red-100 text-red-800';
          if (value.includes('Cardiovascular')) return 'bg-pink-100 text-pink-800';
          if (value.includes('Neurological')) return 'bg-indigo-100 text-indigo-800';
          if (value.includes('Muscle Function')) return 'bg-yellow-100 text-yellow-800';
          if (value.includes('Stem Cell Biology')) return 'bg-teal-100 text-teal-800';
          if (value.includes('Metabolism')) return 'bg-emerald-100 text-emerald-800';
          if (value.includes('Vision')) return 'bg-cyan-100 text-cyan-800';
          if (value.includes('Balance & Coordination')) return 'bg-violet-100 text-violet-800';
          if (value.includes('General Research')) return 'bg-slate-100 text-slate-800';
          
          return 'bg-gray-100 text-gray-700';
        };
        
        return (
          <div className={baseClasses}>
            <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getBadgeColor(value)}`}>
              {value}
            </span>
          </div>
        );
      case 'status':
        return (
          <div className={baseClasses}>
            <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
              value === 'Recent' ? 'bg-green-100 text-green-800' :
              value === 'Completed' ? 'bg-blue-100 text-blue-800' :
              value === 'Archived' ? 'bg-gray-100 text-gray-800' :
              'bg-yellow-100 text-yellow-800'
            }`}>
              {value}
            </span>
          </div>
        );
      case 'highlight':
        return (
          <div className={baseClasses}>
            <span className="text-sm font-medium text-gray-900 block truncate" title={String(value)}>{value}</span>
          </div>
        );
      case 'number':
        return (
          <div className={baseClasses}>
            {value === 'N/A' ? (
              <span className="text-sm text-gray-600">N/A</span>
            ) : (
              <span className="text-sm font-semibold text-purple-600 block truncate" title={String(value)}>{value}</span>
            )}
          </div>
        );
      default:
        return (
          <div className={baseClasses}>
            <span className="text-sm text-gray-900 block truncate" title={String(value)}>{value}</span>
          </div>
        );
    }
  };

  return (
    <Layout>
      <div className="space-y-6">
        {/* Page Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Compare Experiments</h1>
            <p className="text-gray-600">Side-by-side comparison of research experiments and methodologies</p>
          </div>
          <button className="px-4 py-2 bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-lg hover:from-purple-600 hover:to-purple-700 transition-colors">
            Export Comparison
          </button>
        </div>

        {/* Loading / Error */}
        {loading && (
          <div className="bg-white rounded-2xl p-6 shadow-md text-center">Loading experiments...</div>
        )}
        {error && (
          <div className="bg-white rounded-2xl p-6 shadow-md text-center text-red-600">{error}</div>
        )}

        {/* Experiment Selection */}
        {!loading && !error && selectedExperiments.length < 3 && (
          <div className="bg-white rounded-2xl p-6 shadow-md">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Select Experiments to Compare</h2>
            <div className="mb-4">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search publications..."
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {experiments
                .filter(exp => !selectedExperiments.find(sel => sel.id === exp.id))
                .filter(exp => !searchQuery || exp.title.toLowerCase().includes(searchQuery.toLowerCase()))
                .slice(0, 6)
                .map((experiment) => (
                <div 
                  key={experiment.id}
                  onClick={() => handleExperimentSelect(experiment)}
                  className="border border-gray-200 rounded-lg p-4 cursor-pointer hover:border-purple-300 hover:bg-purple-50 transition-colors"
                >
                  <h3 className="font-medium text-gray-900 mb-2 truncate" title={experiment.title}>{experiment.title}</h3>
                  <div className="flex items-center space-x-2 mb-2">
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                      experiment.type === 'In-flight' ? 'bg-purple-100 text-purple-800' :
                      experiment.type === 'Ground-based' ? 'bg-blue-100 text-blue-800' :
                      experiment.type === 'Simulation' ? 'bg-green-100 text-green-800' :
                      'bg-gray-100 text-gray-700'
                    }`}>
                      {experiment.type}
                    </span>
                    <span className="text-xs text-gray-500">{experiment.year}</span>
                  </div>
                  <div className="mb-2">
                    <span className="text-xs text-gray-500">Focus: </span>
                    <span className="text-xs text-gray-700">{experiment.researchFocus}</span>
                  </div>
                  <div className="flex items-center justify-between text-xs text-gray-600">
                    <span>{experiment.location}</span>
                    <span>{experiment.duration}</span>
                  </div>
                </div>
              ))}
              {experiments
                .filter(exp => !selectedExperiments.find(sel => sel.id === exp.id))
                .filter(exp => !searchQuery || exp.title.toLowerCase().includes(searchQuery.toLowerCase()))
                .length === 0 && (
                  <div className="col-span-full text-sm text-gray-500">No matches found.</div>
                )}
            </div>
          </div>
        )}

        {/* Comparison Table */}
        {selectedExperiments.length >= 2 && (
          <div className="bg-white rounded-2xl shadow-md overflow-hidden">
            {/* Header with purple accent */}
            <div className="bg-gradient-to-r from-purple-500 to-purple-600 px-6 py-4">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold text-white">Experiment Comparison</h2>
                <div className="flex items-center space-x-2">
                  <span className="text-purple-100 text-sm">{selectedExperiments.length} experiments selected</span>
                  <button 
                    onClick={() => setSelectedExperiments([])}
                    className="text-purple-100 hover:text-white"
                  >
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>

            {/* Comparison Grid */}
            <div className="overflow-x-hidden max-h-[520px] overflow-y-auto">
              <table className="w-full table-fixed">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-48">
                      Field
                    </th>
                    {selectedExperiments.map((experiment, index) => (
                      <th key={experiment.id} className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-64">
                        <div className="flex items-center justify-between">
                          <span className="truncate" title={`Experiment ${index + 1}`}>Experiment {index + 1}</span>
                          <button 
                            onClick={() => handleExperimentSelect(experiment)}
                            className="text-red-400 hover:text-red-600"
                          >
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          </button>
                        </div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {comparisonFields.map((field) => {
                    const differences = getFieldDifferences(field);
                    return (
                      <tr key={field.key} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 bg-gray-50 w-48">
                          <span className="block truncate" title={field.label}>{field.label}</span>
                        </td>
                        {selectedExperiments.map((experiment, index) => (
                          <td key={experiment.id} className="px-0 py-0 whitespace-nowrap text-sm text-gray-900 w-64">
                            {renderFieldValue(experiment, field, differences[index])}
                          </td>
                        ))}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Summary Insights */}
        {selectedExperiments.length >= 2 && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white rounded-2xl p-6 shadow-md">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Key Differences</h3>
              <div className="space-y-3">
                <div className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-yellow-400 rounded-full mt-2"></div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">Research Focus Areas</p>
                    <p className="text-sm text-gray-600">Different research focuses may require different methodologies</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-yellow-400 rounded-full mt-2"></div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">Experimental Duration</p>
                    <p className="text-sm text-gray-600">Varying study durations may affect outcome comparability</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-yellow-400 rounded-full mt-2"></div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">Methodology & Techniques</p>
                    <p className="text-sm text-gray-600">Different experimental approaches may yield different insights</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-yellow-400 rounded-full mt-2"></div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">Funding Sources</p>
                    <p className="text-sm text-gray-600">Different funding agencies may have different research priorities</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl p-6 shadow-md">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Research Insights</h3>
              <div className="space-y-3">
                <div className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-green-400 rounded-full mt-2"></div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">Complementary Studies</p>
                    <p className="text-sm text-gray-600">These studies may provide complementary insights into space biology</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-green-400 rounded-full mt-2"></div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">Methodology Comparison</p>
                    <p className="text-sm text-gray-600">Compare effectiveness of different experimental approaches</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-green-400 rounded-full mt-2"></div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">Future Research Directions</p>
                    <p className="text-sm text-gray-600">Identify gaps and opportunities for follow-up studies</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-green-400 rounded-full mt-2"></div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">Collaboration Potential</p>
                    <p className="text-sm text-gray-600">Consider cross-agency collaboration for comprehensive studies</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Empty State */}
        {selectedExperiments.length === 0 && (
          <div className="bg-white rounded-2xl p-12 shadow-md text-center">
            <svg className="mx-auto h-12 w-12 text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Experiments Selected</h3>
            <p className="text-gray-600">Select at least 2 experiments from the list above to begin comparison</p>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default CompareExperiments;
