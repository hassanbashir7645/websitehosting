# HR Management System

## Overview

This is a full-stack HR management system built with React frontend and Express backend. The application provides comprehensive employee management capabilities including onboarding, task management, announcements, recognition, logistics, and analytics. It uses a PostgreSQL database via Neon serverless with Drizzle ORM for data management.

## User Preferences

Preferred communication style: Simple, everyday language.

## Recent Changes (July 26, 2025)

### Logistics PDF Export System Created (Latest)
- **Built comprehensive logistics PDF export system with three detailed report types**
- **Inventory Management Report**: Complete inventory list with stock levels, categories, locations, and low stock alerts
- **Logistics Requests Report**: Detailed request tracking with status, costs, approval workflow, and vendor information
- **Comprehensive Analysis Report**: Executive-level report with insights, recommendations, and critical alerts
- **Sample Data Created**: Generated realistic logistics items and requests for demonstration
- **Navigation Integration**: Added "Logistics PDF Export" link to sidebar for HR admins, logistics managers, and branch managers
- **Real-time Analytics**: PDF reports include calculated metrics like average processing time and most requested categories
- **Professional Formatting**: PDFs with proper headers, pagination, color coding for alerts, and comprehensive data presentation

### Two-Phase Onboarding System Created
- **Implemented comprehensive two-step onboarding workflow as requested by user**
- **Step 1 - Employee Self-Service**: Created EmployeeOnboardingStep1 component with 6-step wizard
  - Personal Information, Contact Details, Address, Employment Info, Education & Emergency Contact, Additional Info & Acknowledgments
  - Built-in form validation with required field checking and acknowledgment requirements
  - Progress tracking with visual step indicators and completion percentage
  - Mobile-responsive design with clear navigation between steps
- **Step 2 - HR Administrative Process**: Created HROnboardingStep2 component with 15 HR tasks
  - Organized into 5 categories: Pre-arrival, IT Setup, Access & Permissions, Documentation, Orientation
  - Real-time progress tracking with completion statistics and category breakdowns
  - Step-by-step checklist with notes functionality for each task
  - Employee details review panel with full submitted information display
- **Database Schema**: Added employeeSubmissions table with comprehensive field structure
- **API Endpoints**: Created complete REST API for both phases of onboarding process
- **Navigation Integration**: Added "HR Onboarding Process" link to sidebar for HR admins and managers
- **Public Access**: Employee onboarding step 1 accessible at /employee-onboarding without authentication
- **Role-Based Access**: HR onboarding step 2 restricted to HR administrators and branch managers

### PDF Export Functionality for Psychometric Tests
- Added comprehensive PDF export feature for all psychometric tests
- Created export API endpoint that includes tests with all questions and details
- Built PsychometricTestsPDFExport component using jsPDF library
- Added "Export PDF" tab to psychometric admin interface
- PDF includes complete test information: descriptions, instructions, questions, options, and categories
- Formatted PDF with proper pagination, styling, and table of contents
- Users can download all tests in a single comprehensive PDF document

### Department Management System Enhanced
- Created comprehensive department management system with 8 sample departments
- Built departments page with full CRUD operations (create, edit, delete departments)  
- Added departments to navigation sidebar for HR admins and managers
- Implemented department statistics dashboard with employee counts and manager details
- Connected departments to employee records for organizational tracking
- Added role-based access control for department management features

## Previous Changes (July 17, 2025)

### A2Hosting Deployment Successfully Completed (Latest)
- Successfully resolved A2Hosting compatibility issues with static file deployment
- Fixed asset loading problems by removing folder browsing dependencies  
- Created working HR management system deployment for shared hosting environment
- Verified functionality through diagnostic test page showing all components accessible
- User confirmed test page shows "CSS Loaded" and "JavaScript Ready" status
- DEPLOYMENT CONFIRMED WORKING: User verified complete HR dashboard loading correctly on A2Hosting
- Full navigation sidebar, dashboard statistics, demo banner, and all HR modules operational
- Meeting Matters HR Management System successfully deployed and functional

### A2Hosting Deployment Configuration
- Created comprehensive .htaccess file for Apache server deployment
- Configured URL rewriting for client-side routing support
- Added security headers and cache control for optimal performance
- Set up API route proxying to Express backend server
- Implemented file security and directory protection measures
- Added compression and MIME type configurations
- Prepared error handling for production deployment

### Complete Task Management & Request System Verification
- Systematically tested all task CRUD operations (create, read, update, delete)
- Verified task request workflow with approval/rejection functionality
- Confirmed daily updates system for progress tracking with hours worked and challenges
- Fixed foreign key constraint errors with proper validation and user-friendly messages
- Tested role-based access control for HR, managers, and employees
- Verified data integrity protection with proper error handling
- All API endpoints tested and functioning correctly
- Database relationships properly maintained with referential integrity
- Task deletion now properly prevents removal when active requests exist
- Sample data created for comprehensive testing of all features

### Psychometric Test Integration in Onboarding Process
- Successfully integrated psychometric testing system into the onboarding workflow
- Updated onboarding checklist schema with psychometric test fields (requiresPsychometricTest, psychometricTestId, psychometricTestCompleted, psychometricTestScore)
- Enhanced ChecklistItemCard component to display and handle psychometric test requirements
- Added "Take Assessment" button that opens tests in new window for candidates
- Created API endpoints for linking test completion to onboarding progress
- Implemented automatic checklist completion when psychometric tests are finished
- Added visual indicators for assessment completion status with scores
- Role-based access: HR can create tests, candidates take them during onboarding
- Tests become mandatory onboarding steps that must be completed before proceeding

### Sample Tests Created:
- Big Five Personality Assessment (20 questions, 25 minutes)
- Cognitive Aptitude Assessment (15 questions, 20 minutes)
- Emotional Intelligence Assessment (25 questions, 30 minutes)
  - Self-Awareness: 6 questions covering emotional recognition and personal insight
  - Self-Management: 6 questions on emotional regulation and stress management
  - Social Awareness: 7 questions about reading others and situational awareness
  - Relationship Management: 6 questions on interpersonal skills and conflict resolution
- Integrity and Honesty Assessment (20 questions, 25 minutes) - NEW!
  - Honesty and Truthfulness: 5 questions on truthful reporting and transparency
  - Ethical Decision Making: 5 questions covering moral dilemmas and ethical choices
  - Accountability and Responsibility: 5 questions on taking ownership and responsibility
  - Workplace Pressure: 5 questions on maintaining integrity under pressure and temptation

## Previous Changes (July 16, 2025)

### Employee-Centric Dashboard and Role-Based Access (Latest)
- Created dedicated EmployeeDashboard component with comprehensive employee self-service capabilities
- Implemented role-based routing: employees automatically directed to employee dashboard, managers to admin dashboard
- Added employee document submission system with file upload functionality
- Enhanced task management for employees with status updates (start, complete) directly from dashboard
- Integrated onboarding progress tracking with visual progress indicators
- Built tabbed interface for employees: Overview, My Tasks, Documents, Onboarding
- Added real-time filtering of tasks and documents specific to logged-in employee
- Enhanced navigation with role-based sidebar permissions and proper user designation display
- Implemented employee-specific announcements and recent activities view
- Added comprehensive stats cards showing personal task counts, completion rates, and onboarding progress

### Document Upload and Verification System
- Enhanced onboarding checklist schema with document upload and verification capabilities
- Added document requirement fields: requiresDocument, documentType, documentUrl, documentName, isDocumentVerified, verifiedBy, verifiedAt, verificationNotes
- Created FileUpload component with drag-and-drop functionality and file type validation
- Built ChecklistItemCard component supporting document uploads for specific onboarding items
- Implemented OnboardingChecklistDisplay with HR verification workflow
- Added API routes for document upload (/api/onboarding/:id/upload) and verification (/api/onboarding/:id/verify)
- Updated onboarding template to require documents for: I-9 form, W-4 form, benefits enrollment, direct deposit setup, security training, confidentiality agreement, and employee handbook acknowledgment
- Integrated verification status tracking with HR approval workflow

### Previous Comprehensive Onboarding System Enhancement
- Created complete 32-item onboarding checklist template covering all HR requirements
- Implemented shareable onboarding links that allow employees to complete forms independently
- Built multi-step employee onboarding portal with progress saving
- Added HR management interface with one-click checklist creation and link generation
- Enhanced API routes for onboarding template creation and progress tracking
- Integrated comprehensive data collection including personal info, employment details, payroll setup, IT requirements, and document acknowledgments

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite for development and production builds
- **Routing**: Wouter for client-side routing
- **State Management**: TanStack Query (React Query) for server state management
- **UI Components**: Radix UI with custom shadcn/ui components
- **Styling**: Tailwind CSS with custom design tokens
- **Forms**: React Hook Form with Zod validation

### Backend Architecture
- **Runtime**: Node.js with Express.js server
- **Language**: TypeScript with ES modules
- **Database**: PostgreSQL via Neon serverless
- **ORM**: Drizzle ORM with schema-first approach
- **Authentication**: Replit Auth with OpenID Connect
- **Session Management**: PostgreSQL session store

## Key Components

### Authentication & Authorization
- **Provider**: Replit Auth integration with OpenID Connect
- **Session Storage**: PostgreSQL-based session management
- **Role-based Access Control**: Five user roles (hr_admin, branch_manager, team_lead, employee, logistics_manager)
- **Protected Routes**: All API endpoints require authentication

### Database Schema
- **Users**: Core user information with role-based permissions
- **Employees**: Extended employee profiles with onboarding status
- **Tasks**: Task management with priority levels and status tracking
- **Announcements**: Company-wide communication system
- **Recognition**: Employee recognition and awards
- **Logistics**: Equipment and inventory management
- **Documents**: File management with approval workflows
- **Sessions**: Secure session storage for authentication

### Core Features
1. **Employee Management**: Directory with role-based filtering and editing
2. **Comprehensive Onboarding System**: 
   - 32-item predefined checklist covering pre-arrival through 90-day integration
   - Shareable onboarding links for employee self-service completion
   - Multi-step employee onboarding portal with progress tracking
   - HR management interface for checklist creation and link generation
3. **Task Management**: Assignment, tracking, and completion of tasks
4. **Announcements**: Company-wide communication with role targeting
5. **Recognition**: Employee awards and achievement tracking
6. **Logistics**: Equipment requests and inventory management
7. **Analytics**: Dashboard with metrics and reporting
8. **Settings**: User profile and preference management

## Data Flow

### Client-Server Communication
- **API Pattern**: RESTful API with JSON payloads
- **Error Handling**: Standardized error responses with appropriate HTTP status codes
- **Request/Response**: All requests include credentials for session management
- **Caching**: Client-side caching via React Query with stale-while-revalidate strategy

### Database Operations
- **Connection**: Connection pooling via Neon serverless
- **Transactions**: Automatic transaction handling through Drizzle ORM
- **Migrations**: Schema migrations managed through Drizzle Kit
- **Validation**: Zod schemas for both client and server validation

## External Dependencies

### Core Dependencies
- **@neondatabase/serverless**: PostgreSQL serverless driver
- **drizzle-orm**: Type-safe ORM for database operations
- **@tanstack/react-query**: Server state management
- **@radix-ui/***: Accessible UI component primitives
- **express**: Web server framework
- **passport**: Authentication middleware
- **zod**: Schema validation library

### Development Tools
- **Vite**: Build tool and development server
- **TypeScript**: Type checking and compilation
- **Tailwind CSS**: Utility-first CSS framework
- **ESLint**: Code linting and formatting

## Deployment Strategy

### Production Build
- **Frontend**: Vite builds static assets to `dist/public`
- **Backend**: esbuild compiles TypeScript to single bundled file
- **Environment**: Production mode with optimized builds

### Environment Variables
- **DATABASE_URL**: PostgreSQL connection string (required)
- **SESSION_SECRET**: Session encryption key (required)
- **REPL_ID**: Replit authentication identifier
- **ISSUER_URL**: OpenID Connect issuer URL

### File Structure
```
├── client/          # React frontend
├── server/          # Express backend
├── shared/          # Shared TypeScript definitions
├── migrations/      # Database migrations
├── dist/           # Production build output
└── node_modules/   # Dependencies
```

The application follows a monorepo structure with clear separation between frontend, backend, and shared code, enabling efficient development and deployment workflows.