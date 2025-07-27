# HR Management System - cPanel Deployment

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
