# 🎓 EduAI - AI-Powered Programming Education Platform

> **Transforming K-12 Computer Science Education with Artificial Intelligence**

EduAI is a comprehensive, AI-powered educational platform designed specifically for K-12 programming education. Built with modern web technologies and integrated with cutting-edge AI models, it provides personalized learning experiences aligned with CBSE and ICSE curriculum standards.

![EduAI Platform](https://img.shields.io/badge/Platform-Web-blue) ![React](https://img.shields.io/badge/React-18.2.0-blue) ![TypeScript](https://img.shields.io/badge/TypeScript-5.2.2-blue) ![AI Models](https://img.shields.io/badge/AI%20Models-4%20Integrated-green) ![License](https://img.shields.io/badge/License-MIT-green)

## ✨ Features

### 🤖 **AI-Powered Learning**
- Local AI models for personalized tutoring
- Intelligent code review and feedback
- Adaptive learning paths
- Natural language explanations

### 🎮 **Gamification System**
- Points, badges, and achievements
- Student leaderboards
- Learning streaks
- Challenge competitions

### 📱 **Works Offline**
- Full functionality without internet
- Progressive Web App (PWA)
- Local data storage and sync
- Service worker caching

### 👩‍🏫 **Teacher Tools**
- Classroom management
- Student progress tracking
- Assignment creation
- Analytics dashboard

### 🏢 **School Administration**
- License management system
- Multi-school support
- Usage analytics
- Support ticketing

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- npm 8+ or yarn
- Git
- Modern web browser

### 1. Clone & Setup
```bash
# Clone the repository
git clone https://github.com/yourusername/eduai-tutor.git
cd eduai-tutor

# Run automated setup
node setup.cjs

# Install dependencies
npm install
```

### 2. Configure Environment
```bash
# The setup script creates .env from .env.example
# Update the following variables in .env:

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
```

## 📁 Project Structure

```
eduai-tutor/
├── 📁 public/                 # Static assets
│   ├── icons/                 # PWA icons
│   ├── manifest.json          # PWA manifest
│   ├── robots.txt            # SEO robots file
│   ├── sitemap.xml           # SEO sitemap
│   └── sw.js                 # Service worker
├── 📁 src/
│   ├── 📁 components/         # React components
│   │   ├── auth/             # Authentication
│   │   ├── common/           # Shared components
│   │   ├── dashboard/        # Dashboard views
│   │   ├── gamification/     # Gamification features
│   │   ├── layout/           # Layout components
│   │   ├── lesson/           # Lesson components
│   │   └── user/             # User management
│   ├── 📁 database/          # Local database
│   ├── 📁 hooks/             # Custom React hooks
│   ├── 📁 services/          # API services
│   ├── 📁 store/             # State management
│   ├── 📁 utils/             # Utility functions
│   └── 📁 types/             # TypeScript types
├── 📁 netlify/functions/      # Serverless functions
├── 📁 content/curriculum/     # Learning content
├── 📁 docs/                  # Documentation
└── setup.cjs                 # Setup script
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

The platform includes a built-in license management system:

1. **School Licenses**: Manage multiple schools and classrooms
2. **User Limits**: Control the number of active users
3. **Feature Access**: Enable/disable features per license
4. **Expiration**: Automatic license expiration handling

## 🎯 Usage

### For Students
1. **Login**: Use credentials provided by your teacher
2. **Dashboard**: View your progress and assignments
3. **Lessons**: Interactive coding lessons with AI assistance
4. **Challenges**: Complete coding challenges to earn points
5. **Profile**: Track achievements and learning streaks

### For Teachers
1. **Classroom Setup**: Create and manage classrooms
2. **Student Management**: Add students and track progress
3. **Assignments**: Create custom coding assignments
4. **Analytics**: View detailed student performance data
5. **AI Tutor**: Configure AI assistance levels

### For Administrators
1. **License Management**: Manage school licenses
2. **User Administration**: Oversee all users and permissions
3. **System Monitoring**: Health checks and performance metrics
4. **Support**: Handle support tickets and issues

## 🔌 API Endpoints

### Health Check
```
GET /.netlify/functions/health-check
```
Returns system health status including:
- Environment variables validation
- Network connectivity
- System resource usage

### Authentication
```
POST /api/auth/login
POST /api/auth/logout
POST /api/auth/refresh
```

### License Management
```
GET /api/license/status
POST /api/license/activate
POST /api/license/validate
```

### User Management
```
GET /api/users
POST /api/users
PUT /api/users/:id
DELETE /api/users/:id
```

## 🧪 Testing

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage

# Run E2E tests
npm run test:e2e
```

## 🚀 Deployment

### Netlify (Recommended)

1. **Connect Repository**:
   - Link your GitHub repository to Netlify
   - Set build command: `npm run build`
   - Set publish directory: `dist`

2. **Environment Variables**:
   - Add all required environment variables in Netlify dashboard
   - Ensure `VITE_` prefix for client-side variables

3. **Deploy**:
   ```bash
   # Manual deployment
   npm run build
   netlify deploy --prod --dir=dist
   ```

### Self-Hosted

```bash
# Build for production
npm run build

# Serve with any static file server
npx serve dist
# or
python -m http.server 3000 --directory dist
```

## 🔒 Security

- **License Validation**: Cryptographic license verification
- **Data Encryption**: Local data encryption at rest
- **CORS Protection**: Proper CORS headers for API endpoints
- **Input Validation**: Comprehensive input sanitization
- **Error Handling**: Secure error messages without data leakage

## 📊 Performance

- **Offline First**: Full functionality without internet
- **Service Worker**: Aggressive caching strategy
- **Code Splitting**: Lazy loading of components
- **Bundle Optimization**: Tree shaking and minification
- **Performance Monitoring**: Built-in performance tracking

## 🤝 Contributing

1. **Fork** the repository
2. **Create** a feature branch (`git checkout -b feature/amazing-feature`)
3. **Commit** your changes (`git commit -m 'Add amazing feature'`)
4. **Push** to the branch (`git push origin feature/amazing-feature`)
5. **Open** a Pull Request

### Development Guidelines

- Follow TypeScript best practices
- Write comprehensive tests
- Update documentation
- Follow conventional commit messages
- Ensure accessibility compliance

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

- **Documentation**: Check the `/docs` folder
- **Issues**: Report bugs on GitHub Issues
- **Email**: Contact support@yourdomain.com
- **Community**: Join our Discord server

## 🙏 Acknowledgments

- **React Team** for the amazing framework
- **Vite** for lightning-fast development
- **Tailwind CSS** for utility-first styling
- **HuggingFace** for AI model hosting
- **Netlify** for seamless deployment

---

**Made with ❤️ for educators and students worldwide**

*EduAI Tutor - Empowering the next generation of programmers*