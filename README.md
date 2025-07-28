# Psychometric Testing Platform

A comprehensive web-based psychometric testing platform built with React and Node.js, featuring multiple assessment types including personality, cognitive aptitude, emotional intelligence, and integrity tests.

## Features

### 🧠 Psychometric Tests
- **Big Five Personality Assessment** - 20 questions measuring extraversion, agreeableness, conscientiousness, neuroticism, and openness
- **Cognitive Aptitude Test** - 15 questions testing logical reasoning, numerical skills, and verbal comprehension
- **Emotional Intelligence Assessment** - 25 questions across self-awareness, self-management, social awareness, and relationship management
- **Integrity & Honesty Test** - 20 scenario-based questions evaluating ethical decision-making

### 📊 Advanced Features
- Real-time test taking with timer
- Comprehensive scoring and analysis
- PDF report generation
- Test result visualization
- Admin dashboard for test management
- Candidate result tracking

### 🎯 User Roles
- **Test Takers** - Complete assessments via shareable links
- **HR Administrators** - Create tests, manage candidates, view results
- **System Administrators** - Full platform management

## Tech Stack

- **Frontend**: React 18, TypeScript, Tailwind CSS, Radix UI
- **Backend**: Node.js, Express, PostgreSQL
- **Database**: Neon PostgreSQL with Drizzle ORM
- **Authentication**: Secure session-based auth
- **PDF Generation**: jsPDF for comprehensive reports

## Quick Start

### Prerequisites
- Node.js 18+
- PostgreSQL database (or Neon account)

### Installation

1. Clone the repository
```bash
git clone <repository-url>
cd psychometric-testing-platform
```

2. Install dependencies
```bash
npm install
```

3. Set up environment variables
```bash
cp .env.example .env
# Edit .env with your database URL and session secret
```

4. Run database migrations
```bash
npm run db:push
```

5. Start development server
```bash
npm run dev
```

The application will be available at `http://localhost:5000`

## Deployment

### Production Build
```bash
npm run build
npm start
```

### Environment Variables
- `DATABASE_URL` - PostgreSQL connection string
- `SESSION_SECRET` - Secret key for session encryption
- `NODE_ENV` - Set to 'production' for production builds

## Project Structure

```
├── client/                 # React frontend
│   ├── src/
│   │   ├── components/     # Reusable UI components
│   │   ├── pages/         # Page components
│   │   ├── hooks/         # Custom React hooks
│   │   └── lib/           # Utilities and configurations
├── server/                # Express backend
│   ├── routes.ts          # API routes
│   ├── storage.ts         # Database operations
│   └── index.ts           # Server entry point
├── shared/                # Shared TypeScript types
└── dist/                  # Production build output
```

## API Endpoints

### Tests
- `GET /api/psychometric-tests` - List all tests
- `POST /api/psychometric-tests` - Create new test
- `GET /api/psychometric-tests/:id` - Get test details
- `GET /api/psychometric-tests/:id/questions` - Get test questions

### Test Attempts
- `POST /api/psychometric-test-attempts` - Submit test attempt
- `GET /api/psychometric-test-attempts` - List attempts
- `GET /api/psychometric-test-attempts/:id` - Get attempt results

### Administration
- `GET /api/auth/user` - Get current user
- `GET /api/dashboard/stats` - Dashboard statistics

## Sample Tests Included

The platform comes with pre-configured psychometric tests:

1. **Big Five Personality** (25 min, 20 questions)
2. **Cognitive Aptitude** (20 min, 15 questions) 
3. **Emotional Intelligence** (30 min, 25 questions)
4. **Integrity Assessment** (25 min, 20 questions)

## License

MIT License - see LICENSE file for details

## Support

For technical support or questions, please open an issue in the repository.