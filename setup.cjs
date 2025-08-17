#!/usr/bin/env node

/**
 * EduAI Tutor - Automated Setup Script
 * 
 * This script automates the initial setup process for the EduAI Tutor platform,
 * including environment configuration, dependency installation, and initial data setup.
 * 
 * Usage: npm run setup
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const readline = require('readline');

// ANSI color codes for console output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m'
};

// Helper functions for colored console output
const log = {
  info: (msg) => console.log(`${colors.blue}ℹ${colors.reset} ${msg}`),
  success: (msg) => console.log(`${colors.green}✓${colors.reset} ${msg}`),
  warning: (msg) => console.log(`${colors.yellow}⚠${colors.reset} ${msg}`),
  error: (msg) => console.log(`${colors.red}✗${colors.reset} ${msg}`),
  header: (msg) => console.log(`\n${colors.bright}${colors.cyan}${msg}${colors.reset}\n`),
  step: (msg) => console.log(`${colors.magenta}▶${colors.reset} ${msg}`)
};

// Configuration constants
const PROJECT_ROOT = process.cwd();
const ENV_FILE = path.join(PROJECT_ROOT, '.env.local');
const PACKAGE_JSON = path.join(PROJECT_ROOT, 'package.json');

// Default environment variables
const DEFAULT_ENV_VARS = {
  // Application Configuration
  NEXT_PUBLIC_APP_NAME: 'EduAI Tutor',
  NEXT_PUBLIC_APP_VERSION: '1.0.0',
  NEXT_PUBLIC_APP_URL: 'http://localhost:3000',
  
  // Development Settings
  NODE_ENV: 'development',
  NEXT_PUBLIC_ENVIRONMENT: 'development',
  
  // Database Configuration (Local SQLite for development)
  DATABASE_URL: 'file:./data/eduai.db',
  
  // Authentication
  NEXTAUTH_URL: 'http://localhost:3000',
  NEXTAUTH_SECRET: generateRandomSecret(),
  
  // AI Configuration
  NEXT_PUBLIC_AI_ENABLED: 'true',
  AI_MODEL_PATH: './public/models',
  NEXT_PUBLIC_OFFLINE_AI: 'true',
  
  // Features
  NEXT_PUBLIC_GAMIFICATION_ENABLED: 'true',
  NEXT_PUBLIC_OFFLINE_MODE: 'true',
  NEXT_PUBLIC_PWA_ENABLED: 'true',
  
  // Analytics (Optional)
  NEXT_PUBLIC_ANALYTICS_ENABLED: 'false',
  // NEXT_PUBLIC_GA_TRACKING_ID: '',
  
  // Email Configuration (Optional)
  EMAIL_ENABLED: 'false',
  // SMTP_HOST: '',
  // SMTP_PORT: '587',
  // SMTP_USER: '',
  // SMTP_PASS: '',
  
  // File Upload
  NEXT_PUBLIC_MAX_FILE_SIZE: '10485760', // 10MB
  UPLOAD_DIR: './public/uploads',
  
  // Security
  BCRYPT_ROUNDS: '12',
  JWT_EXPIRES_IN: '7d',
  
  // Performance
  NEXT_PUBLIC_CACHE_ENABLED: 'true',
  CACHE_TTL: '3600', // 1 hour
  
  // Logging
  LOG_LEVEL: 'info',
  LOG_FILE: './logs/app.log'
};

/**
 * Generate a random secret for authentication
 */
function generateRandomSecret() {
  const crypto = require('crypto');
  return crypto.randomBytes(32).toString('hex');
}

/**
 * Check if a command exists in the system
 */
function commandExists(command) {
  try {
    execSync(`which ${command}`, { stdio: 'ignore' });
    return true;
  } catch {
    return false;
  }
}

/**
 * Execute a command and return the result
 */
function runCommand(command, options = {}) {
  try {
    const result = execSync(command, {
      stdio: options.silent ? 'pipe' : 'inherit',
      cwd: PROJECT_ROOT,
      ...options
    });
    return { success: true, output: result?.toString() };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

/**
 * Check system requirements
 */
function checkSystemRequirements() {
  log.header('🔍 Checking System Requirements');
  
  const requirements = [
    { name: 'Node.js', command: 'node --version', minVersion: '18.0.0' },
    { name: 'npm', command: 'npm --version', minVersion: '8.0.0' },
    { name: 'Git', command: 'git --version', minVersion: '2.0.0' }
  ];
  
  let allRequirementsMet = true;
  
  for (const req of requirements) {
    log.step(`Checking ${req.name}...`);
    
    if (!commandExists(req.command.split(' ')[0])) {
      log.error(`${req.name} is not installed`);
      allRequirementsMet = false;
      continue;
    }
    
    const result = runCommand(req.command, { silent: true });
    if (result.success) {
      const version = result.output.trim().replace(/[^0-9.]/g, '');
      log.success(`${req.name} ${version} found`);
    } else {
      log.warning(`Could not determine ${req.name} version`);
    }
  }
  
  if (!allRequirementsMet) {
    log.error('Some system requirements are not met. Please install the missing dependencies.');
    process.exit(1);
  }
  
  log.success('All system requirements met!');
}

/**
 * Create environment file
 */
function createEnvFile() {
  log.header('⚙️ Setting Up Environment Configuration');
  
  if (fs.existsSync(ENV_FILE)) {
    log.warning('.env.local already exists. Backing up existing file...');
    const backupFile = `${ENV_FILE}.backup.${Date.now()}`;
    fs.copyFileSync(ENV_FILE, backupFile);
    log.info(`Backup created: ${path.basename(backupFile)}`);
  }
  
  log.step('Creating .env.local file...');
  
  const envContent = Object.entries(DEFAULT_ENV_VARS)
    .map(([key, value]) => `${key}=${value}`)
    .join('\n');
  
  const envFileContent = `# EduAI Tutor - Environment Configuration
# Generated on ${new Date().toISOString()}
# 
# This file contains environment variables for local development.
# DO NOT commit this file to version control.
# 
# For production deployment, set these variables in your hosting platform.

${envContent}

# Additional configuration can be added below
# Uncomment and configure as needed:

# Email Configuration (for notifications)
# EMAIL_ENABLED=true
# SMTP_HOST=smtp.gmail.com
# SMTP_PORT=587
# SMTP_USER=your-email@gmail.com
# SMTP_PASS=your-app-password

# Analytics (Google Analytics)
# NEXT_PUBLIC_ANALYTICS_ENABLED=true
# NEXT_PUBLIC_GA_TRACKING_ID=G-XXXXXXXXXX

# External APIs (if needed)
# OPENAI_API_KEY=your-openai-key
# ANTHROPIC_API_KEY=your-anthropic-key

# Custom Branding
# NEXT_PUBLIC_SCHOOL_NAME=Your School Name
# NEXT_PUBLIC_SCHOOL_LOGO=/images/school-logo.png
# NEXT_PUBLIC_PRIMARY_COLOR=#007bff
# NEXT_PUBLIC_SECONDARY_COLOR=#6c757d
`;
  
  fs.writeFileSync(ENV_FILE, envFileContent);
  log.success('.env.local file created successfully!');
}

/**
 * Create necessary directories
 */
function createDirectories() {
  log.header('📁 Creating Project Directories');
  
  const directories = [
    'data',
    'logs',
    'public/uploads',
    'public/models',
    'public/images/avatars',
    'public/images/badges',
    'public/images/achievements',
    'src/data/lessons',
    'src/data/exercises',
    'src/data/templates'
  ];
  
  for (const dir of directories) {
    const fullPath = path.join(PROJECT_ROOT, dir);
    log.step(`Creating ${dir}/...`);
    
    if (!fs.existsSync(fullPath)) {
      fs.mkdirSync(fullPath, { recursive: true });
      log.success(`Created ${dir}/`);
    } else {
      log.info(`${dir}/ already exists`);
    }
  }
}

/**
 * Install dependencies
 */
function installDependencies() {
  log.header('📦 Installing Dependencies');
  
  log.step('Installing npm dependencies...');
  const result = runCommand('npm install');
  
  if (result.success) {
    log.success('Dependencies installed successfully!');
  } else {
    log.error('Failed to install dependencies');
    log.error(result.error);
    process.exit(1);
  }
}

/**
 * Initialize local database
 */
function initializeDatabase() {
  log.header('🗄️ Initializing Local Database');
  
  const dbPath = path.join(PROJECT_ROOT, 'data', 'eduai.db');
  
  log.step('Setting up SQLite database...');
  
  // Create a simple database initialization
  // In a real implementation, you might use Prisma, Drizzle, or another ORM
  const initSQL = `
    -- Users table
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      email TEXT UNIQUE NOT NULL,
      name TEXT NOT NULL,
      role TEXT DEFAULT 'student',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
    
    -- Lessons table
    CREATE TABLE IF NOT EXISTS lessons (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      description TEXT,
      content TEXT,
      difficulty TEXT DEFAULT 'beginner',
      category TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
    
    -- User progress table
    CREATE TABLE IF NOT EXISTS user_progress (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER,
      lesson_id INTEGER,
      completed BOOLEAN DEFAULT FALSE,
      score INTEGER DEFAULT 0,
      completed_at DATETIME,
      FOREIGN KEY (user_id) REFERENCES users (id),
      FOREIGN KEY (lesson_id) REFERENCES lessons (id)
    );
    
    -- Achievements table
    CREATE TABLE IF NOT EXISTS achievements (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER,
      type TEXT NOT NULL,
      title TEXT NOT NULL,
      description TEXT,
      earned_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users (id)
    );
  `;
  
  // Write SQL to a temporary file and execute it
  const sqlFile = path.join(PROJECT_ROOT, 'data', 'init.sql');
  fs.writeFileSync(sqlFile, initSQL);
  
  try {
    // Check if sqlite3 is available
    if (commandExists('sqlite3')) {
      runCommand(`sqlite3 ${dbPath} < ${sqlFile}`);
      log.success('Database initialized successfully!');
    } else {
      log.warning('sqlite3 not found. Database will be initialized on first run.');
    }
  } catch (error) {
    log.warning('Could not initialize database. It will be created on first run.');
  } finally {
    // Clean up temporary SQL file
    if (fs.existsSync(sqlFile)) {
      fs.unlinkSync(sqlFile);
    }
  }
}

/**
 * Create sample lesson data
 */
function createSampleData() {
  log.header('📚 Creating Sample Data');
  
  const lessonsDir = path.join(PROJECT_ROOT, 'src', 'data', 'lessons');
  const exercisesDir = path.join(PROJECT_ROOT, 'src', 'data', 'exercises');
  
  // Sample lesson data
  const sampleLesson = {
    id: 'intro-to-programming',
    title: 'Introduction to Programming',
    description: 'Learn the basics of programming with interactive examples.',
    difficulty: 'beginner',
    category: 'fundamentals',
    estimatedTime: 30,
    content: {
      sections: [
        {
          title: 'What is Programming?',
          content: 'Programming is the process of creating instructions for computers to follow.',
          examples: [
            {
              language: 'javascript',
              code: 'console.log("Hello, World!");',
              explanation: 'This code prints "Hello, World!" to the console.'
            }
          ]
        }
      ]
    },
    exercises: ['hello-world', 'variables-intro']
  };
  
  // Sample exercise data
  const sampleExercise = {
    id: 'hello-world',
    title: 'Hello World',
    description: 'Write your first program that displays "Hello, World!"',
    difficulty: 'beginner',
    language: 'javascript',
    startingCode: '// Write your code here\nconsole.log();',
    solution: 'console.log("Hello, World!");',
    tests: [
      {
        input: '',
        expectedOutput: 'Hello, World!',
        description: 'Should output "Hello, World!"'
      }
    ],
    hints: [
      'Use console.log() to print text',
      'Don\'t forget the quotes around the text'
    ]
  };
  
  log.step('Creating sample lesson...');
  const lessonFile = path.join(lessonsDir, 'intro-to-programming.json');
  fs.writeFileSync(lessonFile, JSON.stringify(sampleLesson, null, 2));
  log.success('Sample lesson created');
  
  log.step('Creating sample exercise...');
  const exerciseFile = path.join(exercisesDir, 'hello-world.json');
  fs.writeFileSync(exerciseFile, JSON.stringify(sampleExercise, null, 2));
  log.success('Sample exercise created');
}

/**
 * Setup Git hooks using Husky
 */
function setupGitHooks() {
  log.header('🪝 Setting Up Git Hooks');
  
  // Check if this is a git repository
  if (!fs.existsSync(path.join(PROJECT_ROOT, '.git'))) {
    log.warning('Not a git repository. Skipping Git hooks setup.');
    return;
  }
  
  log.step('Installing Husky...');
  const huskyResult = runCommand('npx husky install');
  
  if (huskyResult.success) {
    log.success('Husky installed successfully!');
    
    // Add pre-commit hook
    log.step('Adding pre-commit hook...');
    runCommand('npx husky add .husky/pre-commit "npm run lint && npm run type-check"');
    
    // Add commit-msg hook for conventional commits
    log.step('Adding commit-msg hook...');
    runCommand('npx husky add .husky/commit-msg "npx commitlint --edit $1"');
    
    log.success('Git hooks configured!');
  } else {
    log.warning('Could not setup Git hooks. You can set them up manually later.');
  }
}

/**
 * Verify installation
 */
function verifyInstallation() {
  log.header('🔍 Verifying Installation');
  
  const checks = [
    {
      name: 'Environment file',
      check: () => fs.existsSync(ENV_FILE),
      fix: 'Run: npm run setup'
    },
    {
      name: 'Dependencies',
      check: () => fs.existsSync(path.join(PROJECT_ROOT, 'node_modules')),
      fix: 'Run: npm install'
    },
    {
      name: 'Data directory',
      check: () => fs.existsSync(path.join(PROJECT_ROOT, 'data')),
      fix: 'Create data/ directory'
    },
    {
      name: 'TypeScript config',
      check: () => fs.existsSync(path.join(PROJECT_ROOT, 'tsconfig.json')),
      fix: 'Ensure tsconfig.json exists'
    }
  ];
  
  let allChecksPass = true;
  
  for (const check of checks) {
    log.step(`Checking ${check.name}...`);
    
    if (check.check()) {
      log.success(`${check.name} ✓`);
    } else {
      log.error(`${check.name} ✗ - ${check.fix}`);
      allChecksPass = false;
    }
  }
  
  if (allChecksPass) {
    log.success('All verification checks passed!');
  } else {
    log.warning('Some checks failed. Please address the issues above.');
  }
  
  return allChecksPass;
}

/**
 * Display next steps
 */
function displayNextSteps() {
  console.log(`\n${colors.bright}${colors.green}🎉 Setup Complete!${colors.reset}\n`);
  
  console.log('Next steps:');
  console.log(`${colors.cyan}1.${colors.reset} Review and customize your environment variables:`);
  console.log(`   ${colors.yellow}nano .env.local${colors.reset}`);
  console.log('');
  console.log(`${colors.cyan}2.${colors.reset} Start the development server:`);
  console.log(`   ${colors.yellow}npm run dev${colors.reset}`);
  console.log('');
  console.log(`${colors.cyan}3.${colors.reset} Open your browser and navigate to:`);
  console.log(`   ${colors.yellow}http://localhost:3000${colors.reset}`);
  console.log('');
  console.log('Useful commands:');
  console.log(`   ${colors.yellow}npm run build${colors.reset}     - Build for production`);
  console.log(`   ${colors.yellow}npm run test${colors.reset}      - Run tests`);
  console.log(`   ${colors.yellow}npm run lint${colors.reset}      - Lint code`);
  console.log(`   ${colors.yellow}npm run format${colors.reset}    - Format code`);
  console.log(`   ${colors.yellow}npm run storybook${colors.reset} - Start Storybook`);
  console.log('');
  console.log(`${colors.bright}Happy coding! 🚀${colors.reset}\n`);
}

/**
 * Main setup function
 */
function main() {
  console.log(`\n${colors.bright}${colors.cyan}🎓 EduAI Tutor - Automated Setup${colors.reset}`);
  console.log(`${colors.cyan}======================================${colors.reset}\n`);
  
  try {
    // Run setup steps
    checkSystemRequirements();
    createEnvFile();
    createDirectories();
    installDependencies();
    initializeDatabase();
    createSampleData();
    setupGitHooks();
    
    // Verify everything is working
    const verificationPassed = verifyInstallation();
    
    if (verificationPassed) {
      displayNextSteps();
    } else {
      log.error('Setup completed with some issues. Please check the verification results above.');
      process.exit(1);
    }
    
  } catch (error) {
    log.error('Setup failed with an error:');
    console.error(error);
    process.exit(1);
  }
}

// Export functions for testing
module.exports = {
  checkSystemRequirements,
  createEnvFile,
  createDirectories,
  installDependencies,
  initializeDatabase,
  createSampleData,
  setupGitHooks,
  verifyInstallation
};

// Run main function if this script is executed directly
if (require.main === module) {
  main();
}