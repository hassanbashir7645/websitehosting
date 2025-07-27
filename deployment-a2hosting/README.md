# HR Management System - A2Hosting Deployment

## Quick Setup Guide

1. **Upload Files**: Upload ALL files to your public_html directory in cPanel
2. **File Structure**: Ensure this structure in public_html:
   ```
   public_html/
   ├── index.html
   ├── .htaccess
   ├── assets/
   │   ├── index-BsylCeS7.css
   │   └── index-DYiNjWux.js
   └── README.md
   ```

3. **Access**: Visit your domain - the HR system should load immediately

## Troubleshooting

### If you see a blank page:
1. Check browser console (F12 → Console) for errors
2. Ensure .htaccess file is uploaded
3. Verify assets folder contains both CSS and JS files
4. Try accessing: yourdomain.com/assets/index-DYiNjWux.js

### If you get 403 Forbidden:
1. Check file permissions: index.html should be 644
2. Ensure .htaccess is uploaded and readable
3. Contact A2Hosting if mod_rewrite is disabled

### If styles are missing:
1. Verify the CSS file exists at: yourdomain.com/assets/index-BsylCeS7.css
2. Check file permissions on assets folder (755)

## File Permissions
- index.html: 644
- .htaccess: 644
- assets/ folder: 755
- CSS/JS files: 644

## Demo Features
This version includes sample data showing:
- Employee management with 3 sample employees
- Task tracking and management
- Onboarding workflows with checklists
- Company announcements
- Recognition system
- Analytics dashboard

## Support
If issues persist, check:
1. cPanel Error Logs
2. Browser Developer Tools (F12)
3. A2Hosting support for server configuration

Built for Meeting Matters organization.