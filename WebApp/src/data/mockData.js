// Mock data for NASA Bioscience Dashboard

export const kpiData = {
  totalPublications: 608,
  activeExperiments: 127,
  researchAreas: 23,
  collaborations: 89,
  recentPublications: 45,
  citationIndex: 2847
};

export const publicationsByYear = [
  { year: '2019', count: 78 },
  { year: '2020', count: 92 },
  { year: '2021', count: 115 },
  { year: '2022', count: 134 },
  { year: '2023', count: 142 },
  { year: '2024', count: 47 }
];

export const researchAreas = [
  { name: 'Astrobiology', count: 156, percentage: 25.7 },
  { name: 'Space Medicine', count: 134, percentage: 22.0 },
  { name: 'Plant Biology', count: 98, percentage: 16.1 },
  { name: 'Microbiology', count: 87, percentage: 14.3 },
  { name: 'Radiation Biology', count: 65, percentage: 10.7 },
  { name: 'Gravitational Biology', count: 45, percentage: 7.4 },
  { name: 'Other', count: 23, percentage: 3.8 }
];

export const experimentTypes = [
  { type: 'In-flight', count: 45, color: '#7916ff' },
  { type: 'Ground-based', count: 82, color: '#9f75ff' },
  { type: 'Simulation', count: 67, color: '#bea6ff' },
  { type: 'Theoretical', count: 34, color: '#d9ceff' }
];

export const collaborationNetwork = [
  { institution: 'NASA Ames', publications: 89, connections: 12 },
  { institution: 'NASA Johnson', publications: 76, connections: 15 },
  { institution: 'NASA Kennedy', publications: 54, connections: 8 },
  { institution: 'MIT', publications: 43, connections: 18 },
  { institution: 'Stanford', publications: 38, connections: 14 },
  { institution: 'Harvard', publications: 32, connections: 11 },
  { institution: 'Caltech', publications: 29, connections: 9 },
  { institution: 'ESA', publications: 25, connections: 7 }
];

export const recentPublications = [
  {
    id: 1,
    title: "Effects of Microgravity on Plant Cell Wall Composition",
    authors: ["Dr. Sarah Chen", "Dr. Michael Rodriguez"],
    journal: "Nature Microgravity",
    year: 2024,
    citations: 23,
    area: "Plant Biology",
    abstract: "This study investigates how microgravity conditions affect the structural composition of plant cell walls..."
  },
  {
    id: 2,
    title: "Radiation Shielding Properties of Biological Materials",
    authors: ["Dr. James Wilson", "Dr. Lisa Park"],
    journal: "Space Medicine Journal",
    year: 2024,
    citations: 18,
    area: "Radiation Biology",
    abstract: "We examine the potential of biological materials as radiation shielding for long-duration space missions..."
  },
  {
    id: 3,
    title: "Microbial Adaptation in Extreme Space Environments",
    authors: ["Dr. Maria Gonzalez", "Dr. Robert Kim"],
    journal: "Astrobiology Review",
    year: 2024,
    citations: 31,
    area: "Astrobiology",
    abstract: "Analysis of microbial survival and adaptation mechanisms in simulated Mars atmospheric conditions..."
  },
  {
    id: 4,
    title: "Bone Density Changes in Long-Duration Spaceflight",
    authors: ["Dr. Amanda Foster", "Dr. David Lee"],
    journal: "Space Health Quarterly",
    year: 2024,
    citations: 27,
    area: "Space Medicine",
    abstract: "Longitudinal study of bone mineral density changes in astronauts during 6-month ISS missions..."
  },
  {
    id: 5,
    title: "Genetic Expression in Zero-G Plant Growth",
    authors: ["Dr. Kevin Zhang", "Dr. Rachel Adams"],
    journal: "Plant Space Biology",
    year: 2024,
    citations: 15,
    area: "Plant Biology",
    abstract: "Comprehensive analysis of gene expression patterns in plants grown under microgravity conditions..."
  }
];

export const researchGaps = [
  {
    area: "Long-term Radiation Effects",
    priority: "High",
    publications: 23,
    needed: 45,
    gap: 22,
    description: "Limited research on multi-generational radiation exposure effects"
  },
  {
    area: "Closed-loop Life Support",
    priority: "High", 
    publications: 18,
    needed: 40,
    gap: 22,
    description: "Insufficient data on sustainable biological life support systems"
  },
  {
    area: "Mars Soil Interaction",
    priority: "Medium",
    publications: 31,
    needed: 50,
    gap: 19,
    description: "More research needed on biological systems in Martian regolith"
  },
  {
    area: "Psychological Adaptation",
    priority: "Medium",
    publications: 15,
    needed: 30,
    gap: 15,
    description: "Limited studies on long-term psychological effects of space travel"
  }
];

export const monthlyTrends = [
  { month: 'Jan', publications: 12, experiments: 8, citations: 145 },
  { month: 'Feb', publications: 15, experiments: 11, citations: 167 },
  { month: 'Mar', publications: 18, experiments: 9, citations: 189 },
  { month: 'Apr', publications: 14, experiments: 13, citations: 201 },
  { month: 'May', publications: 16, experiments: 10, citations: 178 },
  { month: 'Jun', publications: 19, experiments: 15, citations: 234 },
  { month: 'Jul', publications: 21, experiments: 12, citations: 256 },
  { month: 'Aug', publications: 17, experiments: 14, citations: 198 },
  { month: 'Sep', publications: 20, experiments: 16, citations: 287 },
  { month: 'Oct', publications: 8, experiments: 6, citations: 92 }
];
