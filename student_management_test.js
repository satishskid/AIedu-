/**
 * Student Management Testing Script
 * Tests teacher's ability to create and manage student accounts
 * Run this script in browser console at localhost:3001
 */

// Test Configuration
const TEST_CONFIG = {
  baseUrl: 'http://localhost:3001',
  teacherCredentials: {
    email: 'teacher@demo.com',
    password: 'demo123'
  },
  testStudents: [
    {
      name: 'Alice Johnson',
      email: 'alice.student@test.com',
      role: 'student'
    },
    {
      name: 'Bob Smith', 
      email: 'bob.student@test.com',
      role: 'student'
    },
    {
      name: 'Carol Davis',
      email: 'carol.student@test.com', 
      role: 'student'
    }
  ]
};

// Utility Functions
const utils = {
  wait: (ms) => new Promise(resolve => setTimeout(resolve, ms)),
  
  waitForElement: async (selector, timeout = 5000) => {
    const start = Date.now();
    while (Date.now() - start < timeout) {
      const element = document.querySelector(selector);
      if (element) return element;
      await utils.wait(100);
    }
    throw new Error(`Element ${selector} not found within ${timeout}ms`);
  },
  
  log: (message, type = 'info') => {
    const timestamp = new Date().toLocaleTimeString();
    const colors = {
      info: 'color: blue',
      success: 'color: green', 
      error: 'color: red',
      warning: 'color: orange'
    };
    console.log(`%c[${timestamp}] ${message}`, colors[type]);
  },
  
  simulateClick: (element) => {
    element.click();
    element.dispatchEvent(new Event('click', { bubbles: true }));
  },
  
  simulateInput: (element, value) => {
    element.value = value;
    element.dispatchEvent(new Event('input', { bubbles: true }));
    element.dispatchEvent(new Event('change', { bubbles: true }));
  }
};

// Test Cases
const tests = {
  // Test 1: Teacher Login and Dashboard Access
  async testTeacherLogin() {
    utils.log('Testing teacher login and dashboard access...', 'info');
    
    try {
      // Navigate to login if not already there
      if (!window.location.pathname.includes('/login')) {
        window.location.href = `${TEST_CONFIG.baseUrl}/login`;
        await utils.wait(2000);
      }
      
      // Fill login form
      const emailInput = await utils.waitForElement('input[type="email"]');
      const passwordInput = await utils.waitForElement('input[type="password"]');
      const loginButton = await utils.waitForElement('button[type="submit"]');
      
      utils.simulateInput(emailInput, TEST_CONFIG.teacherCredentials.email);
      utils.simulateInput(passwordInput, TEST_CONFIG.teacherCredentials.password);
      utils.simulateClick(loginButton);
      
      await utils.wait(3000);
      
      // Verify dashboard access
      const dashboard = await utils.waitForElement('[data-testid="teacher-dashboard"], .teacher-dashboard, h1, h2');
      
      utils.log('✓ Teacher login successful', 'success');
      return { passed: true, message: 'Teacher login and dashboard access verified' };
      
    } catch (error) {
      utils.log(`✗ Teacher login failed: ${error.message}`, 'error');
      return { passed: false, message: error.message };
    }
  },
  
  // Test 2: Access Students Tab
  async testStudentsTabAccess() {
    utils.log('Testing Students tab access...', 'info');
    
    try {
      // Look for Students tab
      const studentsTab = await utils.waitForElement(
        'button:contains("Students"), [data-tab="students"], button[aria-label*="student" i]'
      );
      
      utils.simulateClick(studentsTab);
      await utils.wait(2000);
      
      // Verify Students tab content
      const studentManagement = await utils.waitForElement(
        'h3:contains("Student Management"), [data-testid="student-management"], .student-list'
      );
      
      utils.log('✓ Students tab accessible', 'success');
      return { passed: true, message: 'Students tab access verified' };
      
    } catch (error) {
      utils.log(`✗ Students tab access failed: ${error.message}`, 'error');
      return { passed: false, message: error.message };
    }
  },
  
  // Test 3: Add Student Modal Access
  async testAddStudentModal() {
    utils.log('Testing Add Student modal access...', 'info');
    
    try {
      // Look for Add Student button
      const addButton = await utils.waitForElement(
        'button:contains("Add Student"), [data-testid="add-student"], button:contains("Add")'
      );
      
      utils.simulateClick(addButton);
      await utils.wait(2000);
      
      // Verify modal opened
      const modal = await utils.waitForElement(
        '.modal, [role="dialog"], .add-user-modal, form'
      );
      
      // Check for form fields
      const nameField = await utils.waitForElement('input[name="name"], input[placeholder*="name" i]');
      const emailField = await utils.waitForElement('input[name="email"], input[type="email"]');
      
      utils.log('✓ Add Student modal accessible', 'success');
      return { passed: true, message: 'Add Student modal and form fields verified' };
      
    } catch (error) {
      utils.log(`✗ Add Student modal failed: ${error.message}`, 'error');
      return { passed: false, message: error.message };
    }
  },
  
  // Test 4: Student Creation Process
  async testStudentCreation() {
    utils.log('Testing student creation process...', 'info');
    
    try {
      const testStudent = TEST_CONFIG.testStudents[0];
      
      // Fill student form
      const nameField = await utils.waitForElement('input[name="name"], input[placeholder*="name" i]');
      const emailField = await utils.waitForElement('input[name="email"], input[type="email"]');
      
      utils.simulateInput(nameField, testStudent.name);
      utils.simulateInput(emailField, testStudent.email);
      
      // Select student role if available
      const roleSelect = document.querySelector('select[name="role"], select:contains("Role")');
      if (roleSelect) {
        roleSelect.value = 'student';
        roleSelect.dispatchEvent(new Event('change', { bubbles: true }));
      }
      
      // Submit form
      const submitButton = await utils.waitForElement(
        'button[type="submit"], button:contains("Create"), button:contains("Add")'  
      );
      
      utils.simulateClick(submitButton);
      await utils.wait(3000);
      
      // Check for success message or student in list
      const success = document.querySelector(
        '.success, .alert-success, [data-testid="success"]'
      ) || document.querySelector(`td:contains("${testStudent.name}"), .student-item:contains("${testStudent.name}")`);
      
      if (success) {
        utils.log('✓ Student creation successful', 'success');
        return { passed: true, message: `Student ${testStudent.name} created successfully` };
      } else {
        throw new Error('No success confirmation found');
      }
      
    } catch (error) {
      utils.log(`✗ Student creation failed: ${error.message}`, 'error');
      return { passed: false, message: error.message };
    }
  },
  
  // Test 5: Student Search Functionality
  async testStudentSearch() {
    utils.log('Testing student search functionality...', 'info');
    
    try {
      // Close modal if open
      const closeButton = document.querySelector('button:contains("Cancel"), button:contains("Close"), .modal-close');
      if (closeButton) {
        utils.simulateClick(closeButton);
        await utils.wait(1000);
      }
      
      // Find search input
      const searchInput = await utils.waitForElement(
        'input[placeholder*="search" i], input[type="search"], .search-input'
      );
      
      // Test search with student name
      const searchTerm = 'Alice';
      utils.simulateInput(searchInput, searchTerm);
      await utils.wait(2000);
      
      // Verify search results
      const studentList = document.querySelector('.student-list, tbody, .students-container');
      if (studentList && studentList.textContent.includes(searchTerm)) {
        utils.log('✓ Student search working', 'success');
        return { passed: true, message: 'Student search functionality verified' };
      } else {
        throw new Error('Search results not found or incorrect');
      }
      
    } catch (error) {
      utils.log(`✗ Student search failed: ${error.message}`, 'error');
      return { passed: false, message: error.message };
    }
  },
  
  // Test 6: Student Status Filter
  async testStudentStatusFilter() {
    utils.log('Testing student status filter...', 'info');
    
    try {
      // Find status filter dropdown
      const statusFilter = await utils.waitForElement(
        'select:contains("Status"), select[name="status"], .status-filter'
      );
      
      // Test different status filters
      const statuses = ['all', 'active', 'inactive'];
      
      for (const status of statuses) {
        statusFilter.value = status;
        statusFilter.dispatchEvent(new Event('change', { bubbles: true }));
        await utils.wait(1000);
        
        // Verify filter applied (basic check)
        const studentList = document.querySelector('.student-list, tbody, .students-container');
        if (!studentList) {
          throw new Error(`Student list not found when filtering by ${status}`);
        }
      }
      
      utils.log('✓ Student status filter working', 'success');
      return { passed: true, message: 'Student status filter functionality verified' };
      
    } catch (error) {
      utils.log(`✗ Student status filter failed: ${error.message}`, 'error');
      return { passed: false, message: error.message };
    }
  },
  
  // Test 7: Student List Display
  async testStudentListDisplay() {
    utils.log('Testing student list display...', 'info');
    
    try {
      // Clear search to show all students
      const searchInput = document.querySelector('input[placeholder*="search" i], input[type="search"]');
      if (searchInput) {
        utils.simulateInput(searchInput, '');
        await utils.wait(1000);
      }
      
      // Check for student list elements
      const studentList = await utils.waitForElement(
        '.student-list, tbody, .students-container, .student-item'
      );
      
      // Verify student information display
      const hasStudentInfo = studentList.textContent.includes('Alice') || 
                           studentList.querySelector('.student-name, td, .student-item');
      
      if (hasStudentInfo) {
        utils.log('✓ Student list display working', 'success');
        return { passed: true, message: 'Student list display verified' };
      } else {
        throw new Error('Student information not properly displayed');
      }
      
    } catch (error) {
      utils.log(`✗ Student list display failed: ${error.message}`, 'error');
      return { passed: false, message: error.message };
    }
  }
};

// Test Runner
const runStudentManagementTests = async () => {
  utils.log('Starting Student Management Testing Suite...', 'info');
  utils.log('='.repeat(50), 'info');
  
  const results = [];
  const testMethods = Object.keys(tests);
  
  for (let i = 0; i < testMethods.length; i++) {
    const testName = testMethods[i];
    const testMethod = tests[testName];
    
    utils.log(`\nRunning Test ${i + 1}/${testMethods.length}: ${testName}`, 'info');
    
    try {
      const result = await testMethod();
      results.push({ test: testName, ...result });
      
      if (!result.passed) {
        utils.log(`Test ${testName} failed, continuing with next test...`, 'warning');
      }
      
    } catch (error) {
      utils.log(`Test ${testName} threw error: ${error.message}`, 'error');
      results.push({ test: testName, passed: false, message: error.message });
    }
    
    // Wait between tests
    await utils.wait(2000);
  }
  
  // Generate Report
  utils.log('\n' + '='.repeat(50), 'info');
  utils.log('STUDENT MANAGEMENT TEST RESULTS', 'info');
  utils.log('='.repeat(50), 'info');
  
  const passed = results.filter(r => r.passed).length;
  const total = results.length;
  
  results.forEach((result, index) => {
    const status = result.passed ? '✓ PASS' : '✗ FAIL';
    const color = result.passed ? 'success' : 'error';
    utils.log(`${index + 1}. ${result.test}: ${status} - ${result.message}`, color);
  });
  
  utils.log('\n' + '='.repeat(50), 'info');
  utils.log(`SUMMARY: ${passed}/${total} tests passed (${Math.round(passed/total*100)}%)`, 
           passed === total ? 'success' : 'warning');
  
  if (passed === total) {
    utils.log('🎉 All student management tests passed!', 'success');
  } else {
    utils.log(`⚠️  ${total - passed} test(s) failed. Check the details above.`, 'warning');
  }
  
  return results;
};

// Auto-run if in browser console
if (typeof window !== 'undefined') {
  utils.log('Student Management Test Suite loaded. Run runStudentManagementTests() to start testing.', 'info');
  
  // Expose to global scope
  window.runStudentManagementTests = runStudentManagementTests;
  window.studentManagementTestUtils = utils;
}

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { runStudentManagementTests, utils, tests };
}