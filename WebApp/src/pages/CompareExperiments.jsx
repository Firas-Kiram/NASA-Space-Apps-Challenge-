import React, { useState } from 'react';
import Layout from '../components/Layout';

const CompareExperiments = () => {
  const [selectedExperiments, setSelectedExperiments] = useState([]);

  // Mock experiment data
  const experiments = [
    {
      id: 1,
      title: "Microgravity Plant Growth Study",
      type: "In-flight",
      duration: "6 months",
      subjects: "Arabidopsis thaliana",
      location: "ISS",
      year: 2024,
      status: "Completed",
      results: "15% reduction in cellulose content",
      methodology: "Controlled growth chambers",
      sampleSize: 120,
      funding: "$2.3M",
      publications: 3,
      citations: 45
    },
    {
      id: 2,
      title: "Ground-based Gravity Simulation",
      type: "Ground-based",
      duration: "3 months",
      subjects: "Arabidopsis thaliana",
      location: "NASA Ames",
      year: 2023,
      status: "Completed",
      results: "8% reduction in cellulose content",
      methodology: "Centrifuge simulation",
      sampleSize: 200,
      funding: "$1.1M",
      publications: 2,
      citations: 23
    },
    {
      id: 3,
      title: "Mars Soil Interaction Study",
      type: "Simulation",
      duration: "4 months",
      subjects: "Multiple species",
      location: "NASA JPL",
      year: 2024,
      status: "Ongoing",
      results: "Preliminary data available",
      methodology: "Martian regolith simulant",
      sampleSize: 80,
      funding: "$1.8M",
      publications: 1,
      citations: 12
    }
  ];

  const comparisonFields = [
    { key: 'title', label: 'Experiment Title', type: 'text' },
    { key: 'type', label: 'Type', type: 'badge' },
    { key: 'duration', label: 'Duration', type: 'text' },
    { key: 'subjects', label: 'Test Subjects', type: 'text' },
    { key: 'location', label: 'Location', type: 'text' },
    { key: 'year', label: 'Year', type: 'text' },
    { key: 'status', label: 'Status', type: 'status' },
    { key: 'methodology', label: 'Methodology', type: 'text' },
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
    return experiment[field.key];
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
        return (
          <div className={baseClasses}>
            <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
              value === 'In-flight' ? 'bg-purple-100 text-purple-800' :
              value === 'Ground-based' ? 'bg-blue-100 text-blue-800' :
              'bg-green-100 text-green-800'
            }`}>
              {value}
            </span>
          </div>
        );
      case 'status':
        return (
          <div className={baseClasses}>
            <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
              value === 'Completed' ? 'bg-green-100 text-green-800' :
              value === 'Ongoing' ? 'bg-blue-100 text-blue-800' :
              'bg-gray-100 text-gray-800'
            }`}>
              {value}
            </span>
          </div>
        );
      case 'highlight':
        return (
          <div className={baseClasses}>
            <span className="text-sm font-medium text-gray-900">{value}</span>
          </div>
        );
      case 'number':
        return (
          <div className={baseClasses}>
            <span className="text-sm font-semibold text-purple-600">{value}</span>
          </div>
        );
      default:
        return (
          <div className={baseClasses}>
            <span className="text-sm text-gray-900">{value}</span>
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

        {/* Experiment Selection */}
        {selectedExperiments.length < 3 && (
          <div className="bg-white rounded-2xl p-6 shadow-md">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Select Experiments to Compare</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {experiments.filter(exp => !selectedExperiments.find(sel => sel.id === exp.id)).map((experiment) => (
                <div 
                  key={experiment.id}
                  onClick={() => handleExperimentSelect(experiment)}
                  className="border border-gray-200 rounded-lg p-4 cursor-pointer hover:border-purple-300 hover:bg-purple-50 transition-colors"
                >
                  <h3 className="font-medium text-gray-900 mb-2">{experiment.title}</h3>
                  <div className="flex items-center space-x-2 mb-2">
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                      experiment.type === 'In-flight' ? 'bg-purple-100 text-purple-800' :
                      experiment.type === 'Ground-based' ? 'bg-blue-100 text-blue-800' :
                      'bg-green-100 text-green-800'
                    }`}>
                      {experiment.type}
                    </span>
                    <span className="text-xs text-gray-500">{experiment.year}</span>
                  </div>
                  <p className="text-sm text-gray-600">{experiment.location}</p>
                </div>
              ))}
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
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-48">
                      Field
                    </th>
                    {selectedExperiments.map((experiment, index) => (
                      <th key={experiment.id} className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        <div className="flex items-center justify-between">
                          <span>Experiment {index + 1}</span>
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
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 bg-gray-50">
                          {field.label}
                        </td>
                        {selectedExperiments.map((experiment, index) => (
                          <td key={experiment.id} className="px-0 py-0 whitespace-nowrap text-sm text-gray-900">
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
                    <p className="text-sm font-medium text-gray-900">Methodology Variation</p>
                    <p className="text-sm text-gray-600">Different experimental approaches may affect result comparability</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-yellow-400 rounded-full mt-2"></div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">Sample Size Differences</p>
                    <p className="text-sm text-gray-600">Varying sample sizes may impact statistical significance</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-yellow-400 rounded-full mt-2"></div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">Environmental Conditions</p>
                    <p className="text-sm text-gray-600">Different testing environments show varied results</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl p-6 shadow-md">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Recommendations</h3>
              <div className="space-y-3">
                <div className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-green-400 rounded-full mt-2"></div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">Standardize Protocols</p>
                    <p className="text-sm text-gray-600">Consider standardizing measurement protocols for better comparison</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-green-400 rounded-full mt-2"></div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">Cross-validation Study</p>
                    <p className="text-sm text-gray-600">A follow-up study could validate findings across conditions</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-green-400 rounded-full mt-2"></div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">Meta-analysis Opportunity</p>
                    <p className="text-sm text-gray-600">Combined data could provide stronger statistical power</p>
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
