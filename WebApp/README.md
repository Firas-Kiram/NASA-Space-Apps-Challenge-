# NASA Space Apps Challenge - Bioscience Research Platform

A comprehensive web application for analyzing NASA bioscience publications, research trends, and identifying knowledge gaps in space-related biological research.

## Features

- **Overview Dashboard**: Comprehensive analysis of bioscience publications and research initiatives
- **Publications Search**: Advanced search and filtering of research papers
- **Knowledge Graph**: Interactive visualization of research connections and relationships
- **Experiments Comparison**: Compare different research experiments and methodologies  
- **Gap Analysis**: Identify critical research gaps with interactive heatmaps and insights
- **AI Summaries**: AI-powered publication summaries and analysis

## Tech Stack

- **Frontend**: React 19 + Vite
- **Styling**: Tailwind CSS
- **Routing**: React Router DOM
- **Charts**: Custom chart components
- **Build Tool**: Vite

## Local Development

### Prerequisites

- Node.js (v18 or higher)
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone <your-repository-url>
cd WebApp
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

4. Open your browser and navigate to `http://localhost:5173`

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build locally
- `npm run lint` - Run ESLint

## Deployment

### Deploy to Vercel

This project is configured for easy deployment to Vercel:

#### Option 1: Deploy via Vercel CLI

1. Install Vercel CLI:
```bash
npm install -g vercel
```

2. Deploy:
```bash
vercel
```

#### Option 2: Deploy via GitHub Integration

1. Push your code to a GitHub repository
2. Go to [Vercel Dashboard](https://vercel.com/dashboard)
3. Click "New Project"
4. Import your GitHub repository
5. Vercel will automatically detect the configuration and deploy

#### Option 3: Deploy via Vercel Dashboard

1. Build the project locally:
```bash
npm run build
```

2. Go to [Vercel Dashboard](https://vercel.com/dashboard)
3. Drag and drop the `dist` folder to deploy

### Configuration Files

- `vercel.json` - Vercel deployment configuration
- `vite.config.js` - Vite build configuration
- `tailwind.config.js` - Tailwind CSS configuration

## Project Structure

```
src/
├── components/          # Reusable UI components
├── pages/              # Page components
├── data/               # Mock data and API utilities
├── assets/             # Static assets
├── App.jsx             # Main app component
└── main.jsx           # App entry point
```

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project was created for the NASA Space Apps Challenge.
