// Mock dataset for Search & Results functionality
export const searchResults = [
  {
    "pub_id": "PUB001",
    "title": "Effect of Microgravity on Rodent Bone Density",
    "year": 2018,
    "tags": ["Rodent", "Bone Loss", "ISS"],
    "organism": "Rodent",
    "platform": "ISS",
    "summary": "Rodents on the ISS exhibited significant cortical bone loss after 30 days; results corroborated by micro-CT measurements. Data available in OSDR.",
    "extendedSummary": "This comprehensive study examined the effects of microgravity on bone density in laboratory rodents during a 30-day mission aboard the International Space Station. Using advanced micro-CT imaging techniques, researchers documented significant cortical bone loss patterns that mirror those observed in human astronauts. The findings provide crucial insights for developing countermeasures for long-duration spaceflight missions.",
    "confidence": 0.86,
    "citations": 45,
    "authors": ["Dr. Sarah Johnson", "Dr. Michael Chen"],
    "journal": "Space Medicine & Biology"
  },
  {
    "pub_id": "PUB002",
    "title": "Arabidopsis Growth Patterns in Spaceflight",
    "year": 2019,
    "tags": ["Arabidopsis", "Plant Growth", "ISS"],
    "organism": "Arabidopsis",
    "platform": "ISS",
    "summary": "Arabidopsis showed altered root orientation and delayed flowering under spaceflight conditions. Gene expression data suggest stress-pathway activation.",
    "extendedSummary": "Through detailed analysis of Arabidopsis thaliana grown in microgravity conditions, this research revealed fundamental changes in plant development including disrupted gravitropism, altered cell wall composition, and modified flowering time. Transcriptomic analysis identified key stress response pathways that are activated in the space environment, providing insights for future space agriculture applications.",
    "confidence": 0.78,
    "citations": 32,
    "authors": ["Dr. Lisa Park", "Dr. James Wilson"],
    "journal": "Plant Space Biology"
  },
  {
    "pub_id": "PUB003",
    "title": "Cardiac Function Changes in Spaceflight",
    "year": 2020,
    "tags": ["Human", "Cardiovascular", "ISS"],
    "organism": "Human",
    "platform": "ISS",
    "summary": "Astronauts showed decreased cardiac output and altered heart rhythm patterns during 6-month missions. Ultrasound data revealed structural adaptations.",
    "extendedSummary": "This longitudinal study tracked cardiovascular changes in astronauts during extended stays on the International Space Station. Using advanced ultrasound imaging and continuous monitoring, researchers documented significant changes in cardiac function, including reduced stroke volume, altered ventricular geometry, and modified autonomic regulation. These findings are critical for understanding cardiovascular deconditioning in space.",
    "confidence": 0.92,
    "citations": 67,
    "authors": ["Dr. Robert Kim", "Dr. Amanda Foster"],
    "journal": "Aerospace Medicine"
  },
  {
    "pub_id": "PUB004",
    "title": "Microbial Behavior in Simulated Mars Environment",
    "year": 2021,
    "tags": ["Microbes", "Mars Simulation", "Ground"],
    "organism": "Microbes",
    "platform": "Ground Simulation",
    "summary": "Extremophile bacteria demonstrated enhanced survival rates in Mars-like atmospheric conditions. Metabolic pathways showed significant adaptation.",
    "extendedSummary": "Using a state-of-the-art Mars simulation chamber, this study examined the survival and adaptation mechanisms of extremophile bacteria under Martian atmospheric conditions. The research revealed remarkable metabolic flexibility and stress response mechanisms that could inform both astrobiology research and potential Mars terraforming strategies.",
    "confidence": 0.84,
    "citations": 28,
    "authors": ["Dr. Maria Gonzalez", "Dr. David Lee"],
    "journal": "Astrobiology Research"
  },
  {
    "pub_id": "PUB005",
    "title": "Radiation Effects on DNA Repair Mechanisms",
    "year": 2022,
    "tags": ["Human", "Radiation", "Ground"],
    "organism": "Human",
    "platform": "Ground Simulation",
    "summary": "High-energy particle radiation significantly impaired DNA repair efficiency in human cell cultures. Novel repair pathways were identified.",
    "extendedSummary": "This groundbreaking research investigated the impact of space-relevant radiation on cellular DNA repair mechanisms using human cell cultures exposed to high-energy particle beams. The study identified previously unknown repair pathways and documented the cellular response to radiation doses equivalent to those encountered during deep space missions.",
    "confidence": 0.89,
    "citations": 54,
    "authors": ["Dr. Kevin Zhang", "Dr. Rachel Adams"],
    "journal": "Radiation Biology"
  },
  {
    "pub_id": "PUB006",
    "title": "Muscle Atrophy Countermeasures in Microgravity",
    "year": 2023,
    "tags": ["Human", "Exercise", "ISS"],
    "organism": "Human",
    "platform": "ISS",
    "summary": "Combined resistance and aerobic exercise protocols showed 40% reduction in muscle mass loss during 6-month missions.",
    "extendedSummary": "This comprehensive exercise physiology study evaluated the effectiveness of combined resistance and aerobic training protocols in mitigating muscle atrophy during long-duration spaceflight. The research demonstrated significant improvements in muscle mass retention and functional capacity, providing evidence-based recommendations for future mission exercise prescriptions.",
    "confidence": 0.91,
    "citations": 73,
    "authors": ["Dr. Thomas Brown", "Dr. Jennifer White"],
    "journal": "Space Exercise Science"
  },
  {
    "pub_id": "PUB007",
    "title": "Sleep Patterns and Circadian Rhythms in Space",
    "year": 2023,
    "tags": ["Human", "Sleep", "ISS"],
    "organism": "Human",
    "platform": "ISS",
    "summary": "Astronauts experienced significant circadian rhythm disruption with average sleep efficiency dropping to 65% during first month.",
    "extendedSummary": "Through continuous monitoring of sleep patterns and circadian markers, this study documented the profound impact of the space environment on human sleep architecture. The research identified key factors contributing to sleep disruption and proposed countermeasures including light therapy and sleep hygiene protocols for future missions.",
    "confidence": 0.87,
    "citations": 41,
    "authors": ["Dr. Patricia Davis", "Dr. Mark Johnson"],
    "journal": "Sleep & Space Medicine"
  },
  {
    "pub_id": "PUB008",
    "title": "Protein Crystallization in Microgravity",
    "year": 2024,
    "tags": ["Protein", "Crystallization", "ISS"],
    "organism": "Protein",
    "platform": "ISS",
    "summary": "Protein crystals grown in microgravity showed 30% larger size and improved structural quality compared to Earth-grown controls.",
    "extendedSummary": "This materials science investigation demonstrated the superior quality of protein crystals grown in the microgravity environment of the International Space Station. The enhanced crystal structure and reduced defects observed in space-grown samples have significant implications for drug development and structural biology research.",
    "confidence": 0.93,
    "citations": 19,
    "authors": ["Dr. Alan Cooper", "Dr. Susan Miller"],
    "journal": "Crystal Growth & Design"
  }
];

export const filterOptions = {
  organisms: ["Human", "Rodent", "Arabidopsis", "Microbes", "Protein"],
  platforms: ["ISS", "Ground Simulation", "Parabolic Flight", "Sounding Rocket"],
  years: ["2024", "2023", "2022", "2021", "2020", "2019", "2018"],
  confidence: [
    { label: "High (>0.9)", min: 0.9, max: 1.0 },
    { label: "Medium (0.7-0.9)", min: 0.7, max: 0.9 },
    { label: "Low (<0.7)", min: 0.0, max: 0.7 }
  ]
  // tags removed - now dynamically loaded from API endpoint
};
