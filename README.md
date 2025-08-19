# 🎓 EduAI - AI-Powered Programming Education Platform

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node.js Version](https://img.shields.io/badge/node-%3E%3D18.0.0-brightgreen)](https://nodejs.org/)
[![React](https://img.shields.io/badge/React-18.2.0-blue)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-5.0-purple)](https://vitejs.dev/)

**Transforming K-12 Computer Science Education with Artificial Intelligence**

EduAI is a comprehensive, AI-powered educational platform designed specifically for K-12 programming education. Built with modern web technologies and integrated with cutting-edge AI models, it provides personalized learning experiences aligned with CBSE and ICSE curriculum standards.

## 🌟 Key Features

### 🤖 AI-Powered Learning
- **Local AI Models**: Integrated with HuggingFace models for personalized tutoring
- **Intelligent Code Review**: Real-time code analysis and feedback
- **Adaptive Learning Paths**: AI-driven curriculum adaptation based on student progress
- **Natural Language Explanations**: Complex concepts explained in simple terms
- **Smart Hints System**: Progressive hints that guide without giving away solutions

### 🎮 Gamification System
- **Points & Badges**: Reward system for achievements and milestones
- **Student Leaderboards**: Healthy competition among classmates
- **Learning Streaks**: Encourage consistent daily practice
- **Challenge Competitions**: Special coding challenges and contests
- **Progress Visualization**: Interactive charts and progress tracking

### 📱 Offline-First Architecture
- **Full Offline Functionality**: Complete feature set without internet connection
- **Progressive Web App (PWA)**: Install on any device like a native app
- **Local Data Storage**: IndexedDB for persistent offline data
- **Smart Sync**: Automatic synchronization when connection is restored
- **Service Worker Caching**: Lightning-fast load times

### 👩‍🏫 Comprehensive Teacher Tools
- **Classroom Management**: Create and manage multiple classrooms
- **Student Progress Tracking**: Detailed analytics and performance insights
- **Assignment Creation**: Custom coding assignments and exercises
- **Real-time Monitoring**: Live view of student activities
- **Automated Grading**: AI-powered code evaluation and feedback

### 🏢 School Administration
- **License Management System**: Multi-tier licensing for schools
- **Multi-School Support**: Manage multiple educational institutions
- **Usage Analytics**: Comprehensive usage statistics and reports
- **Support Ticketing**: Built-in help desk system
- **User Role Management**: Granular permissions and access control

### 🔒 Security & Privacy
- **Data Privacy Compliant**: COPPA and FERPA compliant design
- **Secure Authentication**: JWT-based authentication with session management
- **Local Data Processing**: AI processing happens locally when possible
- **Encrypted Storage**: All sensitive data encrypted at rest
- **Audit Logging**: Comprehensive activity logging for compliance

## 🚀 Quick Start

### Prerequisites
- **Node.js** 18.0.0 or higher
- **npm** 8.0.0 or higher (or yarn)
- **Git** for version control
- **Modern web browser** (Chrome, Firefox, Safari, Edge)

### 1. Clone & Setup
```bash
# Clone the repository
git clone https://github.com/satishskid/AIedu-.git
cd AIedu-

# Run automated setup (creates .env, generates keys)
node setup.cjs

# Install dependencies
npm install
```

### 2. Environment Configuration
The setup script creates a `.env` file from `.env.example`. Update the following variables:

```env
# Required: License Management
VITE_LICENSE_SECRET_KEY=auto-generated-key
VITE_ADMIN_PASSWORD=auto-generated-password

# Required: Email Service (Choose one)
VITE_SENDGRID_API_KEY=your-sendgrid-api-key
VITE_FROM_EMAIL=noreply@yourdomain.com
VITE_ADMIN_EMAIL=admin@yourdomain.com

# Optional: Analytics & Monitoring
VITE_GA_MEASUREMENT_ID=G-XXXXXXXXXX
VITE_SENTRY_DSN=https://your-sentry-dsn@sentry.io/project-id

# Optional: AI Model Configuration
VITE_HUGGINGFACE_API_KEY=hf_your-huggingface-key
VITE_AI_MODEL_CDN=https://your-cdn.com/models
```

### 3. Development
```bash
# Start development server
npm run dev

# Open browser to http://localhost:3000
```

### 4. Production Build
```bash
# Build for production
npm run build

# Preview production build
npm run preview

# Run health checks
npm run health-check
```

## 📁 Project Structure

```
eduai/
├── 📁 public/                 # Static assets
│   ├── icons/                 # PWA icons (various sizes)
│   ├── manifest.json          # PWA manifest
│   ├── robots.txt            # SEO robots file
│   ├── sitemap.xml           # SEO sitemap
│   └── sw.js                 # Service worker
├── 📁 src/
│   ├── 📁 components/         # React components
│   │   ├── auth/             # Authentication components
│   │   ├── common/           # Shared/reusable components
│   │   ├── dashboard/        # Dashboard views
│   │   ├── gamification/     # Gamification features
│   │   ├── layout/           # Layout components
│   │   ├── lesson/           # Lesson components
│   │   ├── teacher/          # Teacher-specific components
│   │   ├── ui/               # UI primitives (buttons, inputs, etc.)
│   │   └── user/             # User management components
│   ├── 📁 database/          # Local database (IndexedDB)
│   │   ├── db.ts             # Database configuration
│   │   ├── models.ts         # Data models
│   │   └── repositories/     # Data access layer
│   ├── 📁 hooks/             # Custom React hooks
│   ├── 📁 services/          # API services and business logic
│   │   ├── ai.ts             # AI service integration
│   │   ├── analytics.ts      # Analytics tracking
│   │   ├── api.ts            # API client
│   │   ├── license.ts        # License management
│   │   └── userManagement.ts # User operations
│   ├── 📁 store/             # State management (Zustand)
│   ├── 📁 utils/             # Utility functions
│   └── 📁 types/             # TypeScript type definitions
├── 📁 netlify/functions/      # Serverless functions
├── 📁 content/curriculum/     # Learning content and curriculum
├── 📁 docs/                  # Documentation
│   ├── USER_GUIDE.md         # User manual for schools
│   ├── DEVELOPER_GUIDE.md    # Developer maintenance guide
│   ├── API.md                # API documentation
│   └── ARCHITECTURE.md       # System architecture
├── 📁 scripts/               # Build and utility scripts
└── setup.cjs                 # Automated setup script
```

## 🔧 Configuration

### Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `VITE_LICENSE_SECRET_KEY` | ✅ | License validation key (auto-generated) |
| `VITE_ADMIN_PASSWORD` | ✅ | Admin access password (auto-generated) |
| `VITE_SENDGRID_API_KEY` | ✅ | SendGrid API key for emails |
| `VITE_FROM_EMAIL` | ✅ | Sender email address |
| `VITE_ADMIN_EMAIL` | ✅ | Admin email address |
| `VITE_GA_MEASUREMENT_ID` | ❌ | Google Analytics tracking ID |
| `VITE_SENTRY_DSN` | ❌ | Sentry error tracking DSN |
| `VITE_HUGGINGFACE_API_KEY` | ❌ | HuggingFace API key for AI models |

### License Management
The platform includes a comprehensive license management system:

- **School Licenses**: Manage multiple schools and classrooms
- **User Limits**: Control the number of active users per license
- **Feature Access**: Enable/disable features based on license tier
- **Expiration Handling**: Automatic license expiration and renewal notifications
- **Usage Tracking**: Monitor license usage and generate reports

## 🎯 Usage Guide

### For Students
1. **Login**: Use credentials provided by your teacher
2. **Dashboard**: View your progress, assignments, and achievements
3. **Interactive Lessons**: Learn programming with AI-powered assistance
4. **Coding Challenges**: Complete exercises to earn points and badges
5. **Progress Tracking**: Monitor your learning journey and streaks

### For Teachers
1. **Classroom Setup**: Create and configure your virtual classrooms
2. **Student Management**: Add students, assign roles, and track progress
3. **Assignment Creation**: Design custom coding assignments and exercises
4. **Real-time Monitoring**: View live student activities and progress
5. **Analytics Dashboard**: Access detailed performance analytics
6. **AI Tutor Configuration**: Customize AI assistance levels for different students

### For Administrators
1. **License Management**: Manage school licenses and user limits
2. **User Administration**: Oversee all users, roles, and permissions
3. **System Monitoring**: Monitor system health and performance
4. **Support Management**: Handle support tickets and user issues
5. **Analytics & Reporting**: Generate comprehensive usage reports

## 🚀 Deployment

### Netlify Deployment (Recommended)
1. **Connect Repository**: Link your GitHub repository to Netlify
2. **Build Settings**:
   - Build command: `npm run build`
   - Publish directory: `dist`
   - Node version: `18`
3. **Environment Variables**: Add all required environment variables in Netlify dashboard
4. **Deploy**: Netlify will automatically build and deploy your application

### Manual Deployment
```bash
# Build the application
npm run build

# The dist/ folder contains the built application
# Upload contents to your web server
```

### Docker Deployment
```bash
# Build Docker image
docker build -t eduai .

# Run container
docker run -p 3000:3000 eduai
```

## 🔌 API Documentation

### Health Check
```
GET /.netlify/functions/health-check
```

### Authentication
```
POST /api/auth/login
POST /api/auth/logout
POST /api/auth/refresh
```

### User Management
```
GET /api/users/profile
PUT /api/users/profile
GET /api/users/progress
```

### AI Services
```
POST /api/ai/chat
POST /api/ai/code-review
POST /api/ai/hint
```

For complete API documentation, see [docs/API.md](docs/API.md)

## 🧪 Testing

```bash
# Run all tests
npm test

# Run tests with coverage
npm run test:coverage

# Run E2E tests
npm run test:e2e

# Lint code
npm run lint

# Type check
npm run type-check
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

See [CONTRIBUTING.md](CONTRIBUTING.md) for detailed guidelines.

## 📚 Documentation

- **[User Guide](docs/USER_GUIDE.md)**: Comprehensive manual for schools
- **[Developer Guide](docs/DEVELOPER_GUIDE.md)**: Maintenance and development guide
- **[API Documentation](docs/API.md)**: Complete API reference
- **[Architecture](docs/ARCHITECTURE.md)**: System architecture overview
- **[Security](docs/SECURITY.md)**: Security guidelines and best practices

## 🐛 Troubleshooting

### Common Issues

**Build Errors**
```bash
# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install
```

**Environment Issues**
```bash
# Regenerate environment configuration
node setup.cjs
```

**Database Issues**
```bash
# Clear local database
# Open browser dev tools > Application > Storage > Clear storage
```

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **HuggingFace** for AI model integration
- **React Team** for the amazing framework
- **Vite** for lightning-fast development experience
- **Tailwind CSS** for beautiful, responsive design
- **IndexedDB** for robust offline storage

## 📞 Support

- **Documentation**: Check our comprehensive docs in the `/docs` folder
- **Issues**: Report bugs and request features on GitHub Issues
- **Email**: Contact us at admin@yourdomain.com
- **Community**: Join our discussions on GitHub Discussions

---

**Made with ❤️ for educators and students worldwide**

*EduAI - Empowering the next generation of programmers with AI-powered education*