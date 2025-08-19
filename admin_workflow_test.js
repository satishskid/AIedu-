// EduAI Admin Workflow Test Script
// This script tests the admin authentication and license creation workflow
// Run this in the browser console after navigating to localhost:3001

console.log('🚀 Starting EduAI Admin Workflow Test...');

// Test Configuration
const TEST_CONFIG = {
  adminCredentials: {
    email: 'admin@demo.com',
    password: 'admin123'
  },
  testLicense: {
    organizationName: 'Test School District',
    contactEmail: 'test@school.edu',
    licenseType: 'premium',
    maxUsers: 100,
    duration: 12
  }
};

// Test Results Tracker
const testResults = {
  adminLogin: { status: 'pending', details: '' },
  dashboardAccess: { status: 'pending', details: '' },
  navigationTest: { status: 'pending', details: '' },
  licenseInterface: { status: 'pending', details: '' },
  userManagement: { status: 'pending', details: '' },
  analyticsAccess: { status: 'pending', details: '' }
};

// Utility Functions
function waitForElement(selector, timeout = 5000) {
  return new Promise((resolve, reject) => {
    const element = document.querySelector(selector);
    if (element) {
      resolve(element);
      return;
    }
    
    const observer = new MutationObserver(() => {
      const element = document.querySelector(selector);
      if (element) {
        observer.disconnect();
        resolve(element);
      }
    });
    
    observer.observe(document.body, {
      childList: true,
      subtree: true
    });
    
    setTimeout(() => {
      observer.disconnect();
      reject(new Error(`Element ${selector} not found within ${timeout}ms`));
    }, timeout);
  });
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function logTest(testName, status, details) {
  const emoji = status === 'pass' ? '✅' : status === 'fail' ? '❌' : '⏳';
  console.log(`${emoji} ${testName}: ${details}`);
  testResults[testName] = { status, details };
}

// Test Functions
async function testAdminLogin() {
  try {
    console.log('\n🔐 Testing Admin Login...');
    
    // Check if we're on the login page
    const currentUrl = window.location.href;
    if (!currentUrl.includes('localhost:3001')) {
      throw new Error('Not on the correct test URL');
    }
    
    // Look for demo accounts button
    const demoButton = await waitForElement('button:contains("Try demo accounts")', 3000);
    if (!demoButton) {
      // Try alternative selector
      const demoButtonAlt = document.querySelector('button');
      const buttons = Array.from(document.querySelectorAll('button'));
      const demoBtn = buttons.find(btn => btn.textContent.includes('demo'));
      if (demoBtn) {
        demoBtn.click();
      } else {
        throw new Error('Demo accounts button not found');
      }
    } else {
      demoButton.click();
    }
    
    await sleep(1000);
    
    // Look for admin demo account
    const adminAccount = document.querySelector('[data-testid="admin-demo"]') || 
                       Array.from(document.querySelectorAll('div')).find(div => 
                         div.textContent.includes('Demo Admin') || 
                         div.textContent.includes('admin@demo.com')
                       );
    
    if (!adminAccount) {
      throw new Error('Admin demo account not found in demo accounts list');
    }
    
    // Click admin account
    adminAccount.click();
    await sleep(2000);
    
    // Check if login was successful by looking for dashboard elements
    const dashboardIndicators = [
      'Admin Dashboard',
      'Overview',
      'Users',
      'Organizations',
      'System',
      'Analytics'
    ];
    
    const foundIndicator = dashboardIndicators.find(indicator => 
      document.body.textContent.includes(indicator)
    );
    
    if (foundIndicator) {
      logTest('adminLogin', 'pass', `Successfully logged in as admin, found: ${foundIndicator}`);
      return true;
    } else {
      throw new Error('Dashboard elements not found after login attempt');
    }
    
  } catch (error) {
    logTest('adminLogin', 'fail', error.message);
    return false;
  }
}

async function testDashboardAccess() {
  try {
    console.log('\n📊 Testing Dashboard Access...');
    
    // Check for admin dashboard elements
    const dashboardElements = {
      'System Stats': ['totalUsers', 'activeUsers', 'totalLessons'],
      'Navigation Tabs': ['Overview', 'Users', 'Organizations', 'System', 'Analytics'],
      'Admin Features': ['License', 'User Management', 'Analytics']
    };
    
    let foundElements = [];
    
    for (const [category, elements] of Object.entries(dashboardElements)) {
      for (const element of elements) {
        if (document.body.textContent.includes(element)) {
          foundElements.push(`${category}: ${element}`);
        }
      }
    }
    
    if (foundElements.length >= 3) {
      logTest('dashboardAccess', 'pass', `Dashboard loaded with elements: ${foundElements.join(', ')}`);
      return true;
    } else {
      throw new Error(`Insufficient dashboard elements found: ${foundElements.join(', ')}`);
    }
    
  } catch (error) {
    logTest('dashboardAccess', 'fail', error.message);
    return false;
  }
}

async function testNavigation() {
  try {
    console.log('\n🧭 Testing Navigation...');
    
    const tabs = ['Users', 'Organizations', 'System', 'Analytics'];
    let successfulTabs = [];
    
    for (const tab of tabs) {
      try {
        // Find and click tab
        const tabButton = Array.from(document.querySelectorAll('button')).find(btn => 
          btn.textContent.trim() === tab
        );
        
        if (tabButton) {
          tabButton.click();
          await sleep(500);
          
          // Verify tab content loaded
          const tabSpecificContent = {
            'Users': ['User Management', 'Add User', 'Export'],
            'Organizations': ['Organizations', 'License Type'],
            'System': ['System Health', 'Server Status'],
            'Analytics': ['Revenue Growth', 'License Distribution']
          };
          
          const expectedContent = tabSpecificContent[tab];
          const foundContent = expectedContent.filter(content => 
            document.body.textContent.includes(content)
          );
          
          if (foundContent.length > 0) {
            successfulTabs.push(`${tab} (${foundContent.join(', ')})`);
          }
        }
      } catch (tabError) {
        console.warn(`Failed to test ${tab} tab:`, tabError.message);
      }
    }
    
    if (successfulTabs.length >= 2) {
      logTest('navigationTest', 'pass', `Successfully navigated tabs: ${successfulTabs.join('; ')}`);
      return true;
    } else {
      throw new Error(`Navigation test failed, successful tabs: ${successfulTabs.join(', ')}`);
    }
    
  } catch (error) {
    logTest('navigationTest', 'fail', error.message);
    return false;
  }
}

async function testLicenseInterface() {
  try {
    console.log('\n🔑 Testing License Creation Interface...');
    
    // Navigate to Users tab first
    const usersTab = Array.from(document.querySelectorAll('button')).find(btn => 
      btn.textContent.trim() === 'Users'
    );
    
    if (usersTab) {
      usersTab.click();
      await sleep(1000);
    }
    
    // Look for Create License button
    const createLicenseButton = Array.from(document.querySelectorAll('button')).find(btn => 
      btn.textContent.includes('Create License') || btn.textContent.includes('License')
    );
    
    if (!createLicenseButton) {
      throw new Error('Create License button not found');
    }
    
    // Click the button to open modal
    createLicenseButton.click();
    await sleep(1000);
    
    // Check if modal opened
    const modalElements = [
      'License Type',
      'Organization Name',
      'Contact Email',
      'Trial',
      'Basic',
      'Premium',
      'Enterprise'
    ];
    
    const foundModalElements = modalElements.filter(element => 
      document.body.textContent.includes(element)
    );
    
    if (foundModalElements.length >= 4) {
      logTest('licenseInterface', 'pass', `License modal opened with elements: ${foundModalElements.join(', ')}`);
      
      // Close modal
      const closeButton = document.querySelector('button[aria-label="Close"]') || 
                         Array.from(document.querySelectorAll('button')).find(btn => 
                           btn.textContent.includes('Cancel') || btn.innerHTML.includes('X')
                         );
      if (closeButton) {
        closeButton.click();
      }
      
      return true;
    } else {
      throw new Error(`License modal elements insufficient: ${foundModalElements.join(', ')}`);
    }
    
  } catch (error) {
    logTest('licenseInterface', 'fail', error.message);
    return false;
  }
}

async function testUserManagement() {
  try {
    console.log('\n👥 Testing User Management...');
    
    // Ensure we're on Users tab
    const usersTab = Array.from(document.querySelectorAll('button')).find(btn => 
      btn.textContent.trim() === 'Users'
    );
    
    if (usersTab) {
      usersTab.click();
      await sleep(1000);
    }
    
    // Check for user management features
    const userManagementFeatures = [
      'User Management',
      'Add User',
      'Export',
      'Search users'
    ];
    
    const foundFeatures = userManagementFeatures.filter(feature => 
      document.body.textContent.includes(feature)
    );
    
    if (foundFeatures.length >= 3) {
      logTest('userManagement', 'pass', `User management features found: ${foundFeatures.join(', ')}`);
      return true;
    } else {
      throw new Error(`Insufficient user management features: ${foundFeatures.join(', ')}`);
    }
    
  } catch (error) {
    logTest('userManagement', 'fail', error.message);
    return false;
  }
}

async function testAnalyticsAccess() {
  try {
    console.log('\n📈 Testing Analytics Access...');
    
    // Navigate to Analytics tab
    const analyticsTab = Array.from(document.querySelectorAll('button')).find(btn => 
      btn.textContent.trim() === 'Analytics'
    );
    
    if (!analyticsTab) {
      throw new Error('Analytics tab not found');
    }
    
    analyticsTab.click();
    await sleep(1000);
    
    // Check for analytics features
    const analyticsFeatures = [
      'Revenue Growth',
      'License Distribution',
      'User Growth',
      'Last 12 Months'
    ];
    
    const foundAnalytics = analyticsFeatures.filter(feature => 
      document.body.textContent.includes(feature)
    );
    
    if (foundAnalytics.length >= 2) {
      logTest('analyticsAccess', 'pass', `Analytics features found: ${foundAnalytics.join(', ')}`);
      return true;
    } else {
      throw new Error(`Insufficient analytics features: ${foundAnalytics.join(', ')}`);
    }
    
  } catch (error) {
    logTest('analyticsAccess', 'fail', error.message);
    return false;
  }
}

// Main Test Runner
async function runAdminWorkflowTest() {
  console.log('\n🎯 EduAI Admin Workflow Test Suite');
  console.log('=====================================');
  
  const tests = [
    { name: 'Admin Login', func: testAdminLogin },
    { name: 'Dashboard Access', func: testDashboardAccess },
    { name: 'Navigation Test', func: testNavigation },
    { name: 'License Interface', func: testLicenseInterface },
    { name: 'User Management', func: testUserManagement },
    { name: 'Analytics Access', func: testAnalyticsAccess }
  ];
  
  let passedTests = 0;
  let totalTests = tests.length;
  
  for (const test of tests) {
    try {
      const result = await test.func();
      if (result) passedTests++;
    } catch (error) {
      console.error(`❌ ${test.name} failed with error:`, error);
    }
    await sleep(500); // Brief pause between tests
  }
  
  // Generate Test Report
  console.log('\n📋 TEST RESULTS SUMMARY');
  console.log('========================');
  
  Object.entries(testResults).forEach(([testName, result]) => {
    const emoji = result.status === 'pass' ? '✅' : result.status === 'fail' ? '❌' : '⏳';
    console.log(`${emoji} ${testName}: ${result.details}`);
  });
  
  console.log(`\n🎯 Overall Results: ${passedTests}/${totalTests} tests passed`);
  console.log(`📊 Success Rate: ${Math.round((passedTests/totalTests) * 100)}%`);
  
  if (passedTests === totalTests) {
    console.log('\n🎉 All tests passed! Admin workflow is functioning correctly.');
  } else {
    console.log('\n⚠️  Some tests failed. Please review the results above.');
  }
  
  return {
    passed: passedTests,
    total: totalTests,
    results: testResults
  };
}

// Auto-run the test
runAdminWorkflowTest().catch(error => {
  console.error('❌ Test suite failed:', error);
});

// Export for manual execution
window.runAdminTest = runAdminWorkflowTest;
console.log('\n💡 Test suite loaded. Run manually with: runAdminTest()');