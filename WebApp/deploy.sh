#!/bin/bash

# NASA Space Apps Challenge - Deployment Script
echo "🚀 Starting deployment process for NASA Space Apps Challenge WebApp..."

# Check if we're in the correct directory
if [ ! -f "package.json" ]; then
    echo "❌ Error: package.json not found. Make sure you're in the project root directory."
    exit 1
fi

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# Run linting
echo "🔍 Running linter..."
npm run lint

# Build the project
echo "🏗️  Building project..."
npm run build

# Check if build was successful
if [ ! -d "dist" ]; then
    echo "❌ Build failed! dist directory not created."
    exit 1
fi

echo "✅ Build completed successfully!"
echo "📁 Build files are in the 'dist' directory"
echo ""
echo "🌐 To deploy to Vercel:"
echo "   Option 1: Run 'vercel' (requires Vercel CLI)"
echo "   Option 2: Upload 'dist' folder to Vercel dashboard"
echo "   Option 3: Push to GitHub and connect to Vercel"
echo ""
echo "🎉 Ready for deployment!"
