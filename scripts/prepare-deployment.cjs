#!/usr/bin/env node

// Deployment preparation script for cPanel hosting
const fs = require('fs');
const path = require('path');

console.log('🚀 Preparing deployment for cPanel...');

// Create deployment directory structure
const deployDir = path.join(__dirname, '../deployment');
if (fs.existsSync(deployDir)) {
  fs.rmSync(deployDir, { recursive: true });
}
fs.mkdirSync(deployDir, { recursive: true });

// Copy static files from dist/public
const publicDir = path.join(__dirname, '../dist/public');
if (fs.existsSync(publicDir)) {
  console.log('📁 Copying static files...');
  copyDir(publicDir, deployDir);
}

// Copy .htaccess file
const htaccessSrc = path.join(__dirname, '../.htaccess');
const htaccessDest = path.join(deployDir, '.htaccess');
if (fs.existsSync(htaccessSrc)) {
  console.log('⚙️ Copying .htaccess configuration...');
  fs.copyFileSync(htaccessSrc, htaccessDest);
}

// Create a simple static file server for cPanel
console.log('🔧 Creating static server configuration...');

// Update .htaccess for static-only hosting
const staticHtaccess = `# HR Management System - Static Hosting Configuration
RewriteEngine On

# Security Headers
Header always set X-Content-Type-Options nosniff
Header always set X-Frame-Options DENY
Header always set X-XSS-Protection "1; mode=block"

# HTTPS Redirect (uncomment when SSL is enabled)
# RewriteCond %{HTTPS} off
# RewriteRule ^(.*)$ https://%{HTTP_HOST}%{REQUEST_URI} [L,R=301]

# Static Assets - Serve directly
RewriteCond %{REQUEST_FILENAME} -f
RewriteRule ^(.*)$ - [L]

# Client-side Routing - All other requests to index.html
RewriteCond %{REQUEST_FILENAME} !-f
RewriteCond %{REQUEST_FILENAME} !-d
RewriteRule ^(.*)$ /index.html [L]

# Cache Control for Static Assets
<IfModule mod_expires.c>
    ExpiresActive On
    ExpiresByType text/css "access plus 1 month"
    ExpiresByType application/javascript "access plus 1 month"
    ExpiresByType image/png "access plus 1 month"
    ExpiresByType image/jpg "access plus 1 month"
    ExpiresByType image/jpeg "access plus 1 month"
    ExpiresByType image/gif "access plus 1 month"
    ExpiresByType image/svg+xml "access plus 1 month"
    ExpiresByType text/html "access plus 1 hour"
</IfModule>

# Compression
<IfModule mod_deflate.c>
    AddOutputFilterByType DEFLATE text/plain
    AddOutputFilterByType DEFLATE text/html
    AddOutputFilterByType DEFLATE text/css
    AddOutputFilterByType DEFLATE application/javascript
    AddOutputFilterByType DEFLATE application/json
</IfModule>

# File Security
<Files ".env">
    Order Allow,Deny
    Deny from all
</Files>

Options -Indexes
`;

fs.writeFileSync(htaccessDest, staticHtaccess);

// Create deployment README
const deployReadme = `# HR Management System - cPanel Deployment

## Static Build Deployment

This is a static build of the HR Management System that can be deployed to any web hosting service including cPanel shared hosting.

### Deployment Instructions

1. **Upload Files**: Upload all files from this deployment folder to your cPanel public_html directory
2. **Configure Domain**: Point your domain to the uploaded files
3. **Enable HTTPS**: Uncomment the HTTPS redirect lines in .htaccess after SSL is configured

### What's Included

- **index.html**: Main application entry point
- **assets/**: All CSS, JavaScript, and static assets
- **.htaccess**: Apache configuration for URL rewriting and caching
- **README.md**: This deployment guide

### Features Included

✅ Complete HR management interface
✅ Employee onboarding system with shareable links  
✅ Task management and tracking
✅ Announcements and recognition system
✅ Logistics and equipment management
✅ Role-based access control
✅ Document upload and verification
✅ Psychometric test integration
✅ Responsive design for mobile and desktop

### Technical Details

- **Frontend**: React 18 with TypeScript
- **UI**: Tailwind CSS with Radix UI components
- **Routing**: Client-side routing with proper .htaccess configuration
- **Authentication**: Replit Auth integration (requires backend for full functionality)
- **Database**: PostgreSQL compatible (requires backend setup)

### Notes

This is a static frontend build. For full functionality including:
- Database operations
- Authentication
- File uploads
- Real-time features

You will need to deploy the backend server separately or use this with your existing API infrastructure.

### Support

For technical support or questions about deployment, please refer to the project documentation.

Built with ❤️ for Meeting Matters organization.
`;

fs.writeFileSync(path.join(deployDir, 'README.md'), deployReadme);

console.log('✅ Deployment files prepared in ./deployment folder');
console.log('📦 Files ready for cPanel upload:');
console.log('   - index.html (main app)');
console.log('   - assets/ (CSS, JS files)');
console.log('   - .htaccess (Apache config)');
console.log('   - README.md (deployment guide)');
console.log('');
console.log('📁 Upload the contents of ./deployment folder to your cPanel public_html directory');

// Helper function to copy directories recursively
function copyDir(src, dest) {
  const entries = fs.readdirSync(src, { withFileTypes: true });
  
  for (const entry of entries) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);
    
    if (entry.isDirectory()) {
      fs.mkdirSync(destPath, { recursive: true });
      copyDir(srcPath, destPath);
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  }
}