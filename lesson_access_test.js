/**
 * EduAI Lesson Access Testing Suite
 * Tests complete lesson delivery workflow: teacher lesson management to student access
 * 
 * Usage: Run in browser console at localhost:3001
 * Prerequisites: Teacher and student accounts must be available
 */

const LessonAccessTest = {
  config: {
    baseUrl: 'http://localhost:3001',
    teacherCredentials: {
      email: 'teacher@demo.com',
      password: 'demo123'
    },
    studentCredentials: {
      email: 'student@demo.com', 
      password: 'demo123'
    },
    testLesson: {
      title: 'Test Programming Lesson',
      category: 'Programming Fundamentals',
      difficulty: 'beginner',
      duration: 30
    }
  },

  results: [],

  utils: {
    log: (message, type = 'info') => {
      const timestamp = new Date().toLocaleTimeString();
      const prefix = {
        info: '📋',
        success: '✅', 
        error: '❌',
        warning: '⚠️'
      }[type] || '📋';
      
      console.log(`${prefix} [${timestamp}] ${message}`);
    },

    wait: (ms) => new Promise(resolve => setTimeout(resolve, ms)),

    waitForElement: (selector, timeout = 10000) => {
      return new Promise((resolve, reject) => {
        const startTime = Date.now();
        
        const checkElement = () => {
          // Handle jQuery-style selectors
          let element;
          if (selector.includes(':contains(')) {
            const match = selector.match(/(.*):contains\("(.*)"\)(.*)/);
            if (match) {
              const [, baseSelector, text, additional] = match;
              const elements = document.querySelectorAll(baseSelector + additional);
              element = Array.from(elements).find(el => 
                el.textContent && el.textContent.includes(text)
              );
            }
          } else {
            element = document.querySelector(selector);
          }
          
          if (element) {
            resolve(element);
          } else if (Date.now() - startTime > timeout) {
            reject(new Error(`Element not found: ${selector}`));
          } else {
            setTimeout(checkElement, 100);
          }
        };
        
        checkElement();
      });
    },

    simulateInput: (element, value) => {
      if (element) {
        element.focus();
        element.value = value;
        element.dispatchEvent(new Event('input', { bubbles: true }));
        element.dispatchEvent(new Event('change', { bubbles: true }));
      }
    },

    simulateClick: (element) => {
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'center' });
        element.click();
      }
    }
  },

  tests: {
    // Test 1: Teacher Login and Lesson Management Access
    async testTeacherLessonAccess() {
      LessonAccessTest.utils.log('Testing teacher lesson management access...', 'info');
      
      try {
        // Navigate to login if not already there
        if (!window.location.pathname.includes('/login')) {
          window.location.href = `${LessonAccessTest.config.baseUrl}/login`;
          await LessonAccessTest.utils.wait(2000);
        }
        
        // Login as teacher
        const emailInput = await LessonAccessTest.utils.waitForElement('input[type="email"]');
        const passwordInput = await LessonAccessTest.utils.waitForElement('input[type="password"]');
        const loginButton = await LessonAccessTest.utils.waitForElement('button[type="submit"]');
        
        LessonAccessTest.utils.simulateInput(emailInput, LessonAccessTest.config.teacherCredentials.email);
        LessonAccessTest.utils.simulateInput(passwordInput, LessonAccessTest.config.teacherCredentials.password);
        LessonAccessTest.utils.simulateClick(loginButton);
        
        await LessonAccessTest.utils.wait(3000);
        
        // Navigate to Lessons tab
        const lessonsTab = await LessonAccessTest.utils.waitForElement('button:contains("Lessons")');
        LessonAccessTest.utils.simulateClick(lessonsTab);
        await LessonAccessTest.utils.wait(2000);
        
        // Verify lesson management interface
        const lessonManagement = await LessonAccessTest.utils.waitForElement(
          'h3:contains("Lesson Management"), .lesson-management, [data-testid="lesson-management"]'
        );
        
        LessonAccessTest.utils.log('✓ Teacher lesson management access verified', 'success');
        return { passed: true, message: 'Teacher can access lesson management interface' };
        
      } catch (error) {
        LessonAccessTest.utils.log(`✗ Teacher lesson access failed: ${error.message}`, 'error');
        return { passed: false, message: error.message };
      }
    },

    // Test 2: Lesson Creation Interface
    async testLessonCreation() {
      LessonAccessTest.utils.log('Testing lesson creation interface...', 'info');
      
      try {
        // Look for Create Lesson button
        const createButton = await LessonAccessTest.utils.waitForElement(
          'button:contains("Create Lesson"), button:contains("Create"), button:contains("+")'  
        );
        
        LessonAccessTest.utils.simulateClick(createButton);
        await LessonAccessTest.utils.wait(2000);
        
        // Check for lesson creation interface (modal or page)
        const creationInterface = document.querySelector(
          '.modal, [role="dialog"], .lesson-creator, form, .create-lesson'
        ) || document.querySelector('h1, h2, h3').textContent.includes('Create');
        
        if (creationInterface) {
          LessonAccessTest.utils.log('✓ Lesson creation interface accessible', 'success');
          return { passed: true, message: 'Lesson creation interface found' };
        } else {
          throw new Error('Lesson creation interface not found');
        }
        
      } catch (error) {
        LessonAccessTest.utils.log(`✗ Lesson creation failed: ${error.message}`, 'error');
        return { passed: false, message: error.message };
      }
    },

    // Test 3: Lesson List Display
    async testLessonList() {
      LessonAccessTest.utils.log('Testing lesson list display...', 'info');
      
      try {
        // Navigate back to lessons tab if needed
        const lessonsTab = document.querySelector('button:contains("Lessons")');
        if (lessonsTab) {
          LessonAccessTest.utils.simulateClick(lessonsTab);
          await LessonAccessTest.utils.wait(2000);
        }
        
        // Check for lesson list elements
        const lessonElements = {
          'Lesson Cards': document.querySelectorAll('.lesson-card, [data-testid="lesson-card"]').length,
          'Lesson Titles': document.querySelectorAll('h4, .lesson-title').length,
          'Difficulty Badges': document.querySelectorAll('.difficulty, .badge, [class*="difficulty"]').length,
          'Action Buttons': document.querySelectorAll('button[title*="Preview"], button[title*="Edit"]').length
        };
        
        const totalElements = Object.values(lessonElements).reduce((sum, count) => sum + count, 0);
        
        if (totalElements >= 3) {
          LessonAccessTest.utils.log('✓ Lesson list display verified', 'success');
          return { 
            passed: true, 
            message: `Lesson list elements found: ${JSON.stringify(lessonElements)}` 
          };
        } else {
          throw new Error('Insufficient lesson list elements found');
        }
        
      } catch (error) {
        LessonAccessTest.utils.log(`✗ Lesson list display failed: ${error.message}`, 'error');
        return { passed: false, message: error.message };
      }
    },

    // Test 4: Student Login and Dashboard Access
    async testStudentDashboardAccess() {
      LessonAccessTest.utils.log('Testing student dashboard access...', 'info');
      
      try {
        // Logout current user
        const logoutButton = document.querySelector('button:contains("Logout"), button:contains("Sign Out")');
        if (logoutButton) {
          LessonAccessTest.utils.simulateClick(logoutButton);
          await LessonAccessTest.utils.wait(2000);
        } else {
          // Navigate to login page directly
          window.location.href = `${LessonAccessTest.config.baseUrl}/login`;
          await LessonAccessTest.utils.wait(2000);
        }
        
        // Login as student
        const emailInput = await LessonAccessTest.utils.waitForElement('input[type="email"]');
        const passwordInput = await LessonAccessTest.utils.waitForElement('input[type="password"]');
        const loginButton = await LessonAccessTest.utils.waitForElement('button[type="submit"]');
        
        LessonAccessTest.utils.simulateInput(emailInput, LessonAccessTest.config.studentCredentials.email);
        LessonAccessTest.utils.simulateInput(passwordInput, LessonAccessTest.config.studentCredentials.password);
        LessonAccessTest.utils.simulateClick(loginButton);
        
        await LessonAccessTest.utils.wait(3000);
        
        // Verify student dashboard
        const dashboard = await LessonAccessTest.utils.waitForElement(
          'h1:contains("Welcome"), .student-dashboard, [data-testid="student-dashboard"]'
        );
        
        LessonAccessTest.utils.log('✓ Student dashboard access verified', 'success');
        return { passed: true, message: 'Student can access dashboard' };
        
      } catch (error) {
        LessonAccessTest.utils.log(`✗ Student dashboard access failed: ${error.message}`, 'error');
        return { passed: false, message: error.message };
      }
    },

    // Test 5: Student Lesson Catalog Access
    async testStudentLessonCatalog() {
      LessonAccessTest.utils.log('Testing student lesson catalog access...', 'info');
      
      try {
        // Look for lessons or catalog navigation
        const lessonsLink = document.querySelector(
          'a[href*="lesson"], button:contains("Lessons"), nav a:contains("Catalog")'
        );
        
        if (lessonsLink) {
          LessonAccessTest.utils.simulateClick(lessonsLink);
          await LessonAccessTest.utils.wait(3000);
        } else {
          // Try direct navigation to lesson catalog
          window.location.href = `${LessonAccessTest.config.baseUrl}/app/lessons`;
          await LessonAccessTest.utils.wait(3000);
        }
        
        // Check for lesson catalog elements
        const catalogElements = {
          'Grade Filters': document.querySelectorAll('button:contains("Grade"), .grade-filter').length,
          'Lesson Cards': document.querySelectorAll('.lesson-card, [data-testid="lesson"]').length,
          'Search Bar': document.querySelectorAll('input[placeholder*="search"], input[type="search"]').length,
          'Category Filters': document.querySelectorAll('.category, .filter').length
        };
        
        const totalElements = Object.values(catalogElements).reduce((sum, count) => sum + count, 0);
        
        if (totalElements >= 2) {
          LessonAccessTest.utils.log('✓ Student lesson catalog access verified', 'success');
          return { 
            passed: true, 
            message: `Lesson catalog elements found: ${JSON.stringify(catalogElements)}` 
          };
        } else {
          throw new Error('Lesson catalog not accessible or incomplete');
        }
        
      } catch (error) {
        LessonAccessTest.utils.log(`✗ Student lesson catalog failed: ${error.message}`, 'error');
        return { passed: false, message: error.message };
      }
    },

    // Test 6: Lesson Viewer Access
    async testLessonViewer() {
      LessonAccessTest.utils.log('Testing lesson viewer access...', 'info');
      
      try {
        // Look for a lesson to open
        const lessonCard = await LessonAccessTest.utils.waitForElement(
          '.lesson-card, [data-testid="lesson"], .lesson-item'
        );
        
        // Try to click on lesson or find a "Start" button
        const startButton = lessonCard.querySelector('button:contains("Start"), button:contains("Continue"), a') || lessonCard;
        
        LessonAccessTest.utils.simulateClick(startButton);
        await LessonAccessTest.utils.wait(3000);
        
        // Check for lesson viewer elements
        const viewerElements = {
          'Lesson Content': document.querySelectorAll('.lesson-content, .content-section').length,
          'Progress Bar': document.querySelectorAll('.progress, [role="progressbar"]').length,
          'Navigation': document.querySelectorAll('button:contains("Next"), button:contains("Previous")').length,
          'AI Tutor': document.querySelectorAll('.ai-tutor, button:contains("Ask")').length
        };
        
        const totalElements = Object.values(viewerElements).reduce((sum, count) => sum + count, 0);
        
        if (totalElements >= 2) {
          LessonAccessTest.utils.log('✓ Lesson viewer access verified', 'success');
          return { 
            passed: true, 
            message: `Lesson viewer elements found: ${JSON.stringify(viewerElements)}` 
          };
        } else {
          throw new Error('Lesson viewer not accessible or incomplete');
        }
        
      } catch (error) {
        LessonAccessTest.utils.log(`✗ Lesson viewer access failed: ${error.message}`, 'error');
        return { passed: false, message: error.message };
      }
    },

    // Test 7: Lesson Progress Tracking
    async testLessonProgress() {
      LessonAccessTest.utils.log('Testing lesson progress tracking...', 'info');
      
      try {
        // Look for progress indicators
        const progressElements = {
          'Progress Bar': document.querySelector('.progress, [role="progressbar"]'),
          'Completion Status': document.querySelector('.completed, .status, [data-testid="status"]'),
          'Progress Percentage': document.querySelector('.percentage, .progress-text'),
          'Section Indicators': document.querySelectorAll('.section-complete, .step-complete').length
        };
        
        const foundElements = Object.entries(progressElements)
          .filter(([name, element]) => element && (typeof element === 'object' ? true : element > 0))
          .map(([name]) => name);
        
        if (foundElements.length >= 1) {
          LessonAccessTest.utils.log('✓ Lesson progress tracking verified', 'success');
          return { 
            passed: true, 
            message: `Progress tracking elements found: ${foundElements.join(', ')}` 
          };
        } else {
          throw new Error('No progress tracking elements found');
        }
        
      } catch (error) {
        LessonAccessTest.utils.log(`✗ Lesson progress tracking failed: ${error.message}`, 'error');
        return { passed: false, message: error.message };
      }
    }
  },

  // Run all tests
  async runAllTests() {
    LessonAccessTest.utils.log('🚀 Starting Lesson Access Testing Suite...', 'info');
    LessonAccessTest.utils.log('=' .repeat(60), 'info');
    
    const testMethods = [
      'testTeacherLessonAccess',
      'testLessonCreation', 
      'testLessonList',
      'testStudentDashboardAccess',
      'testStudentLessonCatalog',
      'testLessonViewer',
      'testLessonProgress'
    ];
    
    LessonAccessTest.results = [];
    
    for (const testMethod of testMethods) {
      try {
        const result = await LessonAccessTest.tests[testMethod]();
        LessonAccessTest.results.push({
          test: testMethod,
          ...result
        });
      } catch (error) {
        LessonAccessTest.results.push({
          test: testMethod,
          passed: false,
          message: `Test execution failed: ${error.message}`
        });
      }
      
      // Wait between tests
      await LessonAccessTest.utils.wait(1000);
    }
    
    // Display results
    LessonAccessTest.displayResults();
  },

  displayResults() {
    LessonAccessTest.utils.log('\n📊 LESSON ACCESS TEST RESULTS', 'info');
    LessonAccessTest.utils.log('=' .repeat(60), 'info');
    
    const passed = LessonAccessTest.results.filter(r => r.passed).length;
    const total = LessonAccessTest.results.length;
    
    LessonAccessTest.results.forEach((result, index) => {
      const status = result.passed ? '✅ PASSED' : '❌ FAILED';
      LessonAccessTest.utils.log(`${index + 1}. ${result.test}: ${status}`);
      if (result.message) {
        LessonAccessTest.utils.log(`   ${result.message}`, 'info');
      }
    });
    
    LessonAccessTest.utils.log('\n📈 SUMMARY:', 'info');
    LessonAccessTest.utils.log(`Passed: ${passed}/${total} tests`, passed === total ? 'success' : 'warning');
    LessonAccessTest.utils.log(`Success Rate: ${Math.round((passed/total) * 100)}%`, passed === total ? 'success' : 'warning');
    
    if (passed === total) {
      LessonAccessTest.utils.log('🎉 All lesson access tests passed!', 'success');
    } else {
      LessonAccessTest.utils.log('⚠️  Some tests failed. Check the details above.', 'warning');
    }
    
    return {
      passed,
      total,
      successRate: Math.round((passed/total) * 100),
      results: LessonAccessTest.results
    };
  }
};

// Auto-run if in browser console
if (typeof window !== 'undefined') {
  console.log('🧪 EduAI Lesson Access Test Suite Loaded');
  console.log('Run LessonAccessTest.runAllTests() to start testing');
  console.log('Or run individual tests like LessonAccessTest.tests.testTeacherLessonAccess()');
}

// Export for use
if (typeof module !== 'undefined' && module.exports) {
  module.exports = LessonAccessTest;
}