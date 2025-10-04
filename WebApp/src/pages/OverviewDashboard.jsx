import React from 'react';
import Layout from '../components/Layout';
import KPICard from '../components/KPICard';
import ChartCard from '../components/ChartCard';
import SimpleBarChart from '../components/SimpleBarChart';
import SimpleDonutChart from '../components/SimpleDonutChart';
import SimpleLineChart from '../components/SimpleLineChart';
import { kpiData, publicationsByYear, researchAreas, monthlyTrends, experimentTypes } from '../data/mockData';

const OverviewDashboard = () => {
  return (
    <Layout>
      <div className="space-y-6">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Overview Dashboard</h1>
          <p className="text-gray-600">Comprehensive analysis of 608 NASA bioscience publications and research initiatives</p>
        </div>

        {/* Top KPI Cards Row (4 cards) */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <KPICard
            title="Total Publications"
            value={kpiData.totalPublications.toLocaleString()}
            change="12%"
            changeType="positive"
            gradient="purple"
            icon={
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9 4.804A7.968 7.968 0 005.5 4c-1.255 0-2.443.29-3.5.804v10A7.969 7.969 0 015.5 14c1.669 0 3.218.51 4.5 1.385A7.962 7.962 0 0114.5 14c1.255 0 2.443.29 3.5.804v-10A7.968 7.968 0 0014.5 4c-1.255 0-2.443.29-3.5.804V12a1 1 0 11-2 0V4.804z" />
              </svg>
            }
          />
          
          <KPICard
            title="Active Experiments"
            value={kpiData.activeExperiments}
            change="8%"
            changeType="positive"
            gradient="purple"
            icon={
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M7 2a1 1 0 00-.707 1.707L7 4.414v3.758a1 1 0 01-.293.707l-4 4C.817 14.769 2.156 18 4.828 18h10.343c2.673 0 4.012-3.231 2.122-5.121l-4-4A1 1 0 0113 8.172V4.414l.707-.707A1 1 0 0013 2H7zm2 6.172V4h2v4.172a3 3 0 00.879 2.12l1.027 1.028a4 4 0 00-2.171.102l-.47.156a4 4 0 01-2.53 0l-.563-.187a1.993 1.993 0 00-.114-.035l1.063-1.063A3 3 0 009 8.172z" clipRule="evenodd" />
              </svg>
            }
          />

          <KPICard
            title="Research Areas"
            value={kpiData.researchAreas}
            gradient="purple"
            icon={
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                <path d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z" />
              </svg>
            }
          />

          <KPICard
            title="Citation Index"
            value={kpiData.citationIndex.toLocaleString()}
            change="23%"
            changeType="positive"
            gradient="purple"
            icon={
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M3 3a1 1 0 000 2v8a2 2 0 002 2h2.586l-1.293 1.293a1 1 0 101.414 1.414L10 15.414l2.293 2.293a1 1 0 001.414-1.414L12.414 15H15a2 2 0 002-2V5a1 1 0 100-2H3zm11.707 4.707a1 1 0 00-1.414-1.414L10 9.586 8.707 8.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
            }
          />
        </div>

        {/* Main Content Grid: Two-column layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Large Center Card with Primary Chart (2/3 width) */}
          <div className="lg:col-span-2">
            <ChartCard
              title="Research Publication Timeline"
              subtitle="Growth trend and activity over the past 6 years"
              className="h-96"
            >
              <div className="h-full">
                <SimpleLineChart 
                  data={publicationsByYear} 
                  xKey="year" 
                  yKey="count"
                  color="#7c3aed"
                />
              </div>
            </ChartCard>
          </div>

          {/* Right Column: Small Summary Cards (1/3 width) */}
          <div className="space-y-6">
            {/* Experiment Types Donut Chart */}
            <ChartCard
              title="Experiment Types"
              subtitle="Distribution by methodology"
              className="h-96"
            >
              <div className="h-full">
                <SimpleDonutChart 
                  data={experimentTypes}
                  colors={['#7c3aed', '#a855f7', '#c084fc', '#e9d5ff']}
                />
              </div>
            </ChartCard>

            {/* Quick Stats Card */}
            {/* <div className="bg-white rounded-2xl p-6 shadow-md hover-lift h-36">
              <div className="mb-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-1">Quick Stats</h3>
                <p className="text-sm text-gray-500">Key metrics at a glance</p>
              </div>
              
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Avg Citations/Paper</span>
                  <span className="text-base font-semibold text-gray-900">4.7</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Active Collaborations</span>
                  <span className="text-base font-semibold text-gray-900">{kpiData.collaborations}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">This Month</span>
                  <span className="text-base font-semibold text-purple-600">{kpiData.recentPublications}</span>
                </div>
              </div>
            </div> */}
          </div>
        </div>

        {/* Bottom Row: Research Areas Distribution */}
        <ChartCard
          title="Research Areas Distribution"
          subtitle="Publications by research focus and impact"
          className="h-80"
        >
          <div className="h-full">
            <SimpleBarChart 
              data={researchAreas} 
              xKey="name" 
              yKey="count"
              color="#7c3aed"
            />
          </div>
        </ChartCard>
      </div>
    </Layout>
  );
};

export default OverviewDashboard;
