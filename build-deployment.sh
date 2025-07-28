#!/bin/bash

# Build script for psychometric testing platform deployment

echo "🚀 Building Psychometric Testing Platform for deployment..."

# Clean previous builds
echo "🧹 Cleaning previous builds..."
rm -rf dist/
rm -rf deployment/

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# Build the application
echo "🔨 Building application..."
npm run build

# Create deployment directory
echo "📁 Creating deployment package..."
mkdir -p deployment

# Copy built files
cp -r dist/public/* deployment/
cp .htaccess deployment/

# Create deployment README
cat > deployment/README.md << 'EOF'
# Psychometric Testing Platform - Deployment Package

## Quick Deployment Guide

### For cPanel/Shared Hosting:
1. Upload all files to your `public_html` directory
2. Ensure `.htaccess` file is uploaded for proper routing
3. Set file permissions: 644 for files, 755 for folders
4. Visit your domain to access the platform

### For VPS/Dedicated Server:
1. Upload files to your web server document root
2. Configure your web server to serve the files
3. Ensure URL rewriting is enabled for client-side routing

### Environment Setup:
- No server-side setup required for demo mode
- For production: Set up PostgreSQL database and configure environment variables

### Features Included:
✅ Complete psychometric testing platform
✅ 4 pre-configured test types (Personality, Cognitive, EI, Integrity)
✅ Admin dashboard for test management
✅ Candidate result tracking and analytics
✅ PDF report generation
✅ Responsive design for all devices

### Demo Access:
- Platform runs in demo mode with sample data
- No authentication required for testing
- All features fully functional

### Support:
For technical support or customization, contact the development team.

Built with React, TypeScript, and modern web technologies.
EOF

echo "✅ Deployment package created successfully!"
echo "📦 Files ready in ./deployment folder"
echo ""
echo "🌐 Upload the contents of ./deployment folder to your web server"
echo "🔗 Access your psychometric testing platform at your domain"