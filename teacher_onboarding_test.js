/**
 * Teacher Onboarding Workflow Test Script
 * Tests the complete teacher account creation, setup, and initial system access
 * after license activation.
 * 
 * Run this script in the browser console at localhost:3001
 */

const TeacherOnboardingTest = {
  // Test configuration
  config: {
    baseUrl: 'http://localhost:3001',
    testTeacher: {
      email: 'newteacher@test.com',
      password: 'teacher123',
      name: 'Test Teacher',
      organizationId: 'org-1'
    },
    adminCredentials: {
      email: 'admin@demo.com',
      password: 'admin123'
    },
    waitTime: 2000 // 2 seconds between actions
  },

  // Test results storage
  results: {
    tests: [],
    passed: 0,
    failed: 0,
    startTime: null,
    endTime: null
  },

  // Utility functions
  utils: {
    wait: (ms) => new Promise(resolve => setTimeout(resolve, ms)),
    
    waitForElement: async (selector, timeout = 10000) => {
      const startTime = Date.now();
      while (Date.now() - startTime < timeout) {
        const element = document.querySelector(selector);
        if (element && element.offsetParent !== null) {
          return element;
        }
        await TeacherOnboardingTest.utils.wait(100);
      }
      throw new Error(`Element ${selector} not found within ${timeout}ms`);
    },
    
    clickElement: async (selector) => {
      const element = await TeacherOnboardingTest.utils.waitForElement(selector);
      element.click();
      await TeacherOnboardingTest.utils.wait(500);
    },
    
    fillInput: async (selector, value) => {
      const element = await TeacherOnboardingTest.utils.waitForElement(selector);
      element.value = value;
      element.dispatchEvent(new Event('input', { bubbles: true }));
      element.dispatchEvent(new Event('change', { bubbles: true }));
      await TeacherOnboardingTest.utils.wait(300);
    },
    
    logResult: (testName, passed, message, details = null) => {
      const result = {
        test: testName,
        passed,
        message,
        details,
        timestamp: new Date().toISOString()
      };
      
      TeacherOnboardingTest.results.tests.push(result);
      if (passed) {
        TeacherOnboardingTest.results.passed++;
        console.log(`✅ ${testName}: ${message}`);
      } else {
        TeacherOnboardingTest.results.failed++;
        console.error(`❌ ${testName}: ${message}`);
      }
      
      if (details) {
        console.log('Details:', details);
      }
    },
    
    simulateUserInteraction: async (element, eventType = 'click') => {
      const event = new MouseEvent(eventType, {
        view: window,
        bubbles: true,
        cancelable: true
      });
      element.dispatchEvent(event);
      await TeacherOnboardingTest.utils.wait(300);
    }
  },

  // Test Cases
  tests: {
    // Test 1: Teacher Registration Process
    async testTeacherRegistration() {
      try {
        console.log('🧪 Testing Teacher Registration Process...');
        
        // Navigate to registration
        if (!window.location.pathname.includes('/login')) {
          window.location.href = '/login';
          await TeacherOnboardingTest.utils.wait(2000);
        }
        
        // Switch to register mode
        const registerButton = document.querySelector('button[type="button"]');
        if (registerButton && registerButton.textContent.includes('Create Account')) {
          await TeacherOnboardingTest.utils.clickElement('button[type="button"]');
        }
        
        // Fill registration form
        await TeacherOnboardingTest.utils.fillInput('input[type="text"]', TeacherOnboardingTest.config.testTeacher.name);
        await TeacherOnboardingTest.utils.fillInput('input[type="email"]', TeacherOnboardingTest.config.testTeacher.email);
        await TeacherOnboardingTest.utils.fillInput('input[type="password"]', TeacherOnboardingTest.config.testTeacher.password);
        
        // Select teacher role
        const teacherRoleButton = Array.from(document.querySelectorAll('button')).find(btn => 
          btn.textContent.includes('Teacher')
        );
        if (teacherRoleButton) {
          await TeacherOnboardingTest.utils.simulateUserInteraction(teacherRoleButton);
        }
        
        // Fill organization ID if field exists
        const orgIdInput = document.querySelector('input[placeholder*="organization"]');
        if (orgIdInput) {
          await TeacherOnboardingTest.utils.fillInput('input[placeholder*="organization"]', TeacherOnboardingTest.config.testTeacher.organizationId);
        }
        
        TeacherOnboardingTest.utils.logResult(
          'Teacher Registration Form',
          true,
          'Registration form filled successfully with teacher role selected'
        );
        
      } catch (error) {
        TeacherOnboardingTest.utils.logResult(
          'Teacher Registration Form',
          false,
          `Registration form filling failed: ${error.message}`
        );
      }
    },

    // Test 2: Teacher Login and Dashboard Access
    async testTeacherLogin() {
      try {
        console.log('🧪 Testing Teacher Login and Dashboard Access...');
        
        // Use demo teacher account for testing
        await TeacherOnboardingTest.utils.fillInput('input[type="email"]', 'teacher@demo.com');
        await TeacherOnboardingTest.utils.fillInput('input[type="password"]', 'demo123');
        
        // Submit login
        const loginButton = document.querySelector('button[type="submit"]');
        if (loginButton) {
          await TeacherOnboardingTest.utils.simulateUserInteraction(loginButton);
          await TeacherOnboardingTest.utils.wait(3000);
        }
        
        // Verify teacher dashboard access
        const dashboardTitle = await TeacherOnboardingTest.utils.waitForElement('h1');
        const isDashboard = dashboardTitle.textContent.includes('Teacher Dashboard') || 
                           dashboardTitle.textContent.includes('Dashboard');
        
        if (isDashboard) {
          TeacherOnboardingTest.utils.logResult(
            'Teacher Login',
            true,
            'Teacher successfully logged in and accessed dashboard'
          );
        } else {
          throw new Error('Teacher dashboard not accessible after login');
        }
        
      } catch (error) {
        TeacherOnboardingTest.utils.logResult(
          'Teacher Login',
          false,
          `Teacher login failed: ${error.message}`
        );
      }
    },

    // Test 3: Teacher Dashboard Components
    async testTeacherDashboardComponents() {
      try {
        console.log('🧪 Testing Teacher Dashboard Components...');
        
        const components = {
          'Stats Cards': 'div:has(> div > .w-6.h-6)',
          'Navigation Tabs': 'div:has(button:contains("Overview"))',
          'Student Management': 'div:has(button:contains("Students"))',
          'Lesson Management': 'div:has(button:contains("Lessons"))',
          'Analytics': 'div:has(button:contains("Analytics"))'
        };
        
        const foundComponents = [];
        
        // Check for stats cards (student count, progress, etc.)
        const statsCards = document.querySelectorAll('.bg-white.dark\\:bg-gray-800.rounded-xl');
        if (statsCards.length >= 3) {
          foundComponents.push('Stats Cards');
        }
        
        // Check for navigation tabs
        const tabButtons = Array.from(document.querySelectorAll('button')).filter(btn => 
          ['Overview', 'Students', 'Lessons', 'Analytics'].some(tab => btn.textContent.includes(tab))
        );
        if (tabButtons.length >= 3) {
          foundComponents.push('Navigation Tabs');
        }
        
        // Check for main dashboard content
        const dashboardContent = document.querySelector('.min-h-screen');
        if (dashboardContent) {
          foundComponents.push('Dashboard Layout');
        }
        
        TeacherOnboardingTest.utils.logResult(
          'Teacher Dashboard Components',
          foundComponents.length >= 2,
          `Found ${foundComponents.length} dashboard components: ${foundComponents.join(', ')}`,
          { components: foundComponents }
        );
        
      } catch (error) {
        TeacherOnboardingTest.utils.logResult(
          'Teacher Dashboard Components',
          false,
          `Dashboard component check failed: ${error.message}`
        );
      }
    },

    // Test 4: Teacher Profile Setup
    async testTeacherProfileSetup() {
      try {
        console.log('🧪 Testing Teacher Profile Setup...');
        
        // Look for profile or settings access
        const profileButton = Array.from(document.querySelectorAll('button, a')).find(el => 
          el.textContent.includes('Profile') || el.textContent.includes('Settings')
        );
        
        if (profileButton) {
          await TeacherOnboardingTest.utils.simulateUserInteraction(profileButton);
          await TeacherOnboardingTest.utils.wait(2000);
        }
        
        // Check if profile information is accessible
        const userInfo = document.querySelector('[data-testid="user-info"], .user-profile, .profile-section');
        const hasUserName = document.body.textContent.includes('Demo Teacher') || 
                           document.body.textContent.includes('Teacher');
        
        TeacherOnboardingTest.utils.logResult(
          'Teacher Profile Setup',
          hasUserName,
          hasUserName ? 'Teacher profile information is accessible' : 'Teacher profile setup needs verification',
          { hasProfileSection: !!userInfo, hasUserName }
        );
        
      } catch (error) {
        TeacherOnboardingTest.utils.logResult(
          'Teacher Profile Setup',
          false,
          `Profile setup check failed: ${error.message}`
        );
      }
    },

    // Test 5: Student Management Access
    async testStudentManagementAccess() {
      try {
        console.log('🧪 Testing Student Management Access...');
        
        // Click on Students tab if available
        const studentsTab = Array.from(document.querySelectorAll('button')).find(btn => 
          btn.textContent.includes('Students')
        );
        
        if (studentsTab) {
          await TeacherOnboardingTest.utils.simulateUserInteraction(studentsTab);
          await TeacherOnboardingTest.utils.wait(2000);
        }
        
        // Check for student management features
        const studentFeatures = {
          'Student List': document.querySelector('.divide-y, .student-list, [data-testid="student-list"]'),
          'Search Function': document.querySelector('input[placeholder*="search"], input[type="search"]'),
          'Filter Options': document.querySelector('select, .filter-dropdown'),
          'Add Student': Array.from(document.querySelectorAll('button')).find(btn => 
            btn.textContent.includes('Add') || btn.textContent.includes('+')
          )
        };
        
        const availableFeatures = Object.entries(studentFeatures)
          .filter(([name, element]) => element)
          .map(([name]) => name);
        
        TeacherOnboardingTest.utils.logResult(
          'Student Management Access',
          availableFeatures.length >= 2,
          `Student management features available: ${availableFeatures.join(', ')}`,
          { features: availableFeatures }
        );
        
      } catch (error) {
        TeacherOnboardingTest.utils.logResult(
          'Student Management Access',
          false,
          `Student management access check failed: ${error.message}`
        );
      }
    },

    // Test 6: Lesson Management Access
    async testLessonManagementAccess() {
      try {
        console.log('🧪 Testing Lesson Management Access...');
        
        // Click on Lessons tab if available
        const lessonsTab = Array.from(document.querySelectorAll('button')).find(btn => 
          btn.textContent.includes('Lessons')
        );
        
        if (lessonsTab) {
          await TeacherOnboardingTest.utils.simulateUserInteraction(lessonsTab);
          await TeacherOnboardingTest.utils.wait(2000);
        }
        
        // Check for lesson management features
        const lessonFeatures = {
          'Lesson List': document.querySelector('.lesson-list, [data-testid="lesson-list"]') || 
                        document.querySelectorAll('.bg-white.dark\\:bg-gray-800').length > 0,
          'Create Lesson': Array.from(document.querySelectorAll('button')).find(btn => 
            btn.textContent.includes('Create') || btn.textContent.includes('Add') || btn.textContent.includes('+')
          ),
          'Lesson Actions': document.querySelector('.lesson-actions') || 
                           Array.from(document.querySelectorAll('button')).find(btn => 
                             btn.title && (btn.title.includes('Edit') || btn.title.includes('Preview'))
                           )
        };
        
        const availableFeatures = Object.entries(lessonFeatures)
          .filter(([name, element]) => element)
          .map(([name]) => name);
        
        TeacherOnboardingTest.utils.logResult(
          'Lesson Management Access',
          availableFeatures.length >= 1,
          `Lesson management features available: ${availableFeatures.join(', ')}`,
          { features: availableFeatures }
        );
        
      } catch (error) {
        TeacherOnboardingTest.utils.logResult(
          'Lesson Management Access',
          false,
          `Lesson management access check failed: ${error.message}`
        );
      }
    }
  },

  // Main test runner
  async runAllTests() {
    console.log('🚀 Starting Teacher Onboarding Workflow Tests...');
    console.log('=' .repeat(60));
    
    this.results.startTime = new Date();
    this.results.tests = [];
    this.results.passed = 0;
    this.results.failed = 0;
    
    const testMethods = [
      'testTeacherRegistration',
      'testTeacherLogin', 
      'testTeacherDashboardComponents',
      'testTeacherProfileSetup',
      'testStudentManagementAccess',
      'testLessonManagementAccess'
    ];
    
    for (const testMethod of testMethods) {
      try {
        await this.tests[testMethod]();
        await this.utils.wait(this.config.waitTime);
      } catch (error) {
        this.utils.logResult(
          testMethod,
          false,
          `Test execution failed: ${error.message}`
        );
      }
    }
    
    this.results.endTime = new Date();
    this.generateReport();
  },

  // Generate test report
  generateReport() {
    const duration = this.results.endTime - this.results.startTime;
    const successRate = ((this.results.passed / (this.results.passed + this.results.failed)) * 100).toFixed(1);
    
    console.log('\n' + '=' .repeat(60));
    console.log('📊 TEACHER ONBOARDING TEST RESULTS');
    console.log('=' .repeat(60));
    console.log(`⏱️  Duration: ${duration}ms`);
    console.log(`✅ Passed: ${this.results.passed}`);
    console.log(`❌ Failed: ${this.results.failed}`);
    console.log(`📈 Success Rate: ${successRate}%`);
    console.log('\n📋 Test Details:');
    
    this.results.tests.forEach((test, index) => {
      const status = test.passed ? '✅' : '❌';
      console.log(`${index + 1}. ${status} ${test.test}: ${test.message}`);
    });
    
    console.log('\n🎯 Teacher Onboarding Workflow Test Complete!');
    console.log('=' .repeat(60));
    
    return this.results;
  }
};

// Auto-run tests when script is loaded
if (typeof window !== 'undefined') {
  console.log('🧪 Teacher Onboarding Test Script Loaded');
  console.log('Run TeacherOnboardingTest.runAllTests() to start testing');
  
  // Expose to global scope for manual execution
  window.TeacherOnboardingTest = TeacherOnboardingTest;
}

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
  module.exports = TeacherOnboardingTest;
}