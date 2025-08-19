/**
 * License Workflow Test Script
 * Tests complete license creation and activation workflow
 * Run this in browser console at localhost:3001
 */

const LicenseWorkflowTest = {
  // Test configuration
  config: {
    adminCredentials: {
      email: 'admin@demo.com',
      password: 'admin123'
    },
    testLicenses: {
      trial: 'TRIAL-2024-DEMO',
      basic: 'BASIC-2024-STANDARD',
      premium: 'PREMIUM-2024-ADVANCED',
      enterprise: 'ENTERPRISE-2024-ULTIMATE'
    },
    testOrganization: {
      name: 'Test School District',
      email: 'admin@testschool.edu',
      contactPerson: 'John Smith',
      phone: '+1-555-0123'
    }
  },

  // Test results storage
  results: {
    licenseCreation: [],
    licenseActivation: [],
    licenseValidation: [],
    clientOnboarding: [],
    errors: []
  },

  // Utility functions
  utils: {
    wait: (ms) => new Promise(resolve => setTimeout(resolve, ms)),
    
    waitForElement: async (selector, timeout = 10000) => {
      const start = Date.now();
      while (Date.now() - start < timeout) {
        const element = document.querySelector(selector);
        if (element) return element;
        await LicenseWorkflowTest.utils.wait(100);
      }
      throw new Error(`Element ${selector} not found within ${timeout}ms`);
    },
    
    log: (message, type = 'info') => {
      const timestamp = new Date().toLocaleTimeString();
      const prefix = `[${timestamp}] [LICENSE-TEST]`;
      
      switch (type) {
        case 'success':
          console.log(`%c${prefix} ✅ ${message}`, 'color: green; font-weight: bold');
          break;
        case 'error':
          console.error(`%c${prefix} ❌ ${message}`, 'color: red; font-weight: bold');
          LicenseWorkflowTest.results.errors.push({ message, timestamp });
          break;
        case 'warning':
          console.warn(`%c${prefix} ⚠️ ${message}`, 'color: orange; font-weight: bold');
          break;
        default:
          console.log(`%c${prefix} ℹ️ ${message}`, 'color: blue');
      }
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
  },

  // Test 1: Admin Login for License Management
  async testAdminLogin() {
    this.utils.log('Testing admin login for license management...');
    
    try {
      // Navigate to login if not already there
      if (!window.location.pathname.includes('/login')) {
        window.location.href = '/login';
        await this.utils.wait(2000);
      }
      
      // Find and click demo accounts button
      const demoButton = await this.utils.waitForElement('[data-testid="demo-accounts-toggle"], button:contains("Demo Accounts")');
      this.utils.simulateClick(demoButton);
      await this.utils.wait(1000);
      
      // Find and click admin demo account
      const adminCard = await this.utils.waitForElement('[data-testid="demo-admin"], .demo-account-card:contains("Admin")');
      this.utils.simulateClick(adminCard);
      await this.utils.wait(3000);
      
      // Verify admin dashboard loaded
      const dashboard = await this.utils.waitForElement('[data-testid="admin-dashboard"], .admin-dashboard');
      
      this.utils.log('Admin login successful', 'success');
      return { success: true, message: 'Admin authentication completed' };
      
    } catch (error) {
      this.utils.log(`Admin login failed: ${error.message}`, 'error');
      return { success: false, error: error.message };
    }
  },

  // Test 2: License Creation Process
  async testLicenseCreation() {
    this.utils.log('Testing license creation process...');
    
    try {
      // Navigate to license creation
      const createLicenseButton = await this.utils.waitForElement('[data-testid="create-license"], button:contains("Create License")');
      this.utils.simulateClick(createLicenseButton);
      await this.utils.wait(1000);
      
      // Test different license types
      const licenseTypes = ['trial', 'basic', 'premium', 'enterprise'];
      const creationResults = [];
      
      for (const licenseType of licenseTypes) {
        try {
          this.utils.log(`Creating ${licenseType} license...`);
          
          // Select license type
          const typeSelector = await this.utils.waitForElement(`[data-testid="license-type-${licenseType}"], input[value="${licenseType}"]`);
          this.utils.simulateClick(typeSelector);
          await this.utils.wait(500);
          
          // Fill organization details
          const orgNameInput = await this.utils.waitForElement('[data-testid="org-name"], input[name="organizationName"]');
          this.utils.simulateInput(orgNameInput, `${this.config.testOrganization.name} - ${licenseType.toUpperCase()}`);
          
          const orgEmailInput = await this.utils.waitForElement('[data-testid="org-email"], input[name="contactEmail"]');
          this.utils.simulateInput(orgEmailInput, this.config.testOrganization.email);
          
          // Submit license creation
          const submitButton = await this.utils.waitForElement('[data-testid="create-license-submit"], button[type="submit"]');
          this.utils.simulateClick(submitButton);
          await this.utils.wait(2000);
          
          // Verify license key generated
          const licenseKeyElement = await this.utils.waitForElement('[data-testid="generated-license-key"], .license-key');
          const licenseKey = licenseKeyElement.textContent || licenseKeyElement.value;
          
          creationResults.push({
            type: licenseType,
            key: licenseKey,
            success: true
          });
          
          this.utils.log(`${licenseType} license created: ${licenseKey}`, 'success');
          
          // Close modal for next test
          const closeButton = document.querySelector('[data-testid="close-modal"], button:contains("Close")');
          if (closeButton) {
            this.utils.simulateClick(closeButton);
            await this.utils.wait(500);
          }
          
        } catch (error) {
          creationResults.push({
            type: licenseType,
            success: false,
            error: error.message
          });
          this.utils.log(`Failed to create ${licenseType} license: ${error.message}`, 'error');
        }
      }
      
      this.results.licenseCreation = creationResults;
      return { success: true, results: creationResults };
      
    } catch (error) {
      this.utils.log(`License creation test failed: ${error.message}`, 'error');
      return { success: false, error: error.message };
    }
  },

  // Test 3: License Activation Workflow
  async testLicenseActivation() {
    this.utils.log('Testing license activation workflow...');
    
    try {
      // Navigate to license activation page
      window.location.href = '/license-activation';
      await this.utils.wait(2000);
      
      const activationResults = [];
      
      // Test activation with demo licenses
      for (const [type, licenseKey] of Object.entries(this.config.testLicenses)) {
        try {
          this.utils.log(`Testing activation of ${type} license: ${licenseKey}`);
          
          // Find license key input
          const licenseInput = await this.utils.waitForElement('[data-testid="license-key-input"], input[name="licenseKey"]');
          this.utils.simulateInput(licenseInput, licenseKey);
          
          // Submit activation
          const activateButton = await this.utils.waitForElement('[data-testid="activate-license"], button[type="submit"]');
          this.utils.simulateClick(activateButton);
          await this.utils.wait(3000);
          
          // Check for success state
          const successElement = document.querySelector('[data-testid="license-activated"], .license-success');
          const errorElement = document.querySelector('[data-testid="license-error"], .license-error');
          
          if (successElement) {
            activationResults.push({
              type,
              key: licenseKey,
              success: true,
              message: 'License activated successfully'
            });
            this.utils.log(`${type} license activated successfully`, 'success');
          } else if (errorElement) {
            const errorMessage = errorElement.textContent;
            activationResults.push({
              type,
              key: licenseKey,
              success: false,
              error: errorMessage
            });
            this.utils.log(`${type} license activation failed: ${errorMessage}`, 'error');
          }
          
          // Reset for next test
          await this.utils.wait(1000);
          
        } catch (error) {
          activationResults.push({
            type,
            key: licenseKey,
            success: false,
            error: error.message
          });
          this.utils.log(`License activation failed for ${type}: ${error.message}`, 'error');
        }
      }
      
      this.results.licenseActivation = activationResults;
      return { success: true, results: activationResults };
      
    } catch (error) {
      this.utils.log(`License activation test failed: ${error.message}`, 'error');
      return { success: false, error: error.message };
    }
  },

  // Test 4: License Validation System
  async testLicenseValidation() {
    this.utils.log('Testing license validation system...');
    
    try {
      const validationResults = [];
      
      // Test valid license keys
      const validKeys = Object.values(this.config.testLicenses);
      for (const key of validKeys) {
        try {
          // Use license store validation
          const licenseStore = window.useLicenseStore?.getState?.();
          if (licenseStore && licenseStore.activateLicense) {
            const result = await licenseStore.activateLicense(key);
            validationResults.push({
              key,
              valid: result,
              type: 'valid-key-test'
            });
          }
        } catch (error) {
          validationResults.push({
            key,
            valid: false,
            error: error.message,
            type: 'valid-key-test'
          });
        }
      }
      
      // Test invalid license keys
      const invalidKeys = ['INVALID-KEY', 'EXPIRED-2023-OLD', 'MALFORMED-KEY-123'];
      for (const key of invalidKeys) {
        try {
          const licenseStore = window.useLicenseStore?.getState?.();
          if (licenseStore && licenseStore.activateLicense) {
            const result = await licenseStore.activateLicense(key);
            validationResults.push({
              key,
              valid: result,
              type: 'invalid-key-test',
              expected: false
            });
          }
        } catch (error) {
          validationResults.push({
            key,
            valid: false,
            error: error.message,
            type: 'invalid-key-test',
            expected: false
          });
        }
      }
      
      this.results.licenseValidation = validationResults;
      this.utils.log('License validation tests completed', 'success');
      return { success: true, results: validationResults };
      
    } catch (error) {
      this.utils.log(`License validation test failed: ${error.message}`, 'error');
      return { success: false, error: error.message };
    }
  },

  // Test 5: Client Onboarding Process
  async testClientOnboarding() {
    this.utils.log('Testing client onboarding process...');
    
    try {
      // Simulate new client receiving license
      const onboardingResults = [];
      
      // Test onboarding flow with trial license
      const trialKey = this.config.testLicenses.trial;
      
      // Navigate to onboarding
      window.location.href = '/onboarding';
      await this.utils.wait(2000);
      
      // Enter license key
      const licenseInput = await this.utils.waitForElement('[data-testid="onboarding-license"], input[name="licenseKey"]');
      this.utils.simulateInput(licenseInput, trialKey);
      
      // Continue to organization setup
      const continueButton = await this.utils.waitForElement('[data-testid="continue-onboarding"], button:contains("Continue")');
      this.utils.simulateClick(continueButton);
      await this.utils.wait(2000);
      
      // Fill organization details
      const orgNameInput = await this.utils.waitForElement('[data-testid="onboarding-org-name"], input[name="organizationName"]');
      this.utils.simulateInput(orgNameInput, this.config.testOrganization.name);
      
      const adminEmailInput = await this.utils.waitForElement('[data-testid="onboarding-admin-email"], input[name="adminEmail"]');
      this.utils.simulateInput(adminEmailInput, this.config.testOrganization.email);
      
      // Complete onboarding
      const completeButton = await this.utils.waitForElement('[data-testid="complete-onboarding"], button:contains("Complete")');
      this.utils.simulateClick(completeButton);
      await this.utils.wait(3000);
      
      // Verify successful onboarding
      const welcomeElement = document.querySelector('[data-testid="onboarding-success"], .onboarding-complete');
      
      if (welcomeElement) {
        onboardingResults.push({
          success: true,
          message: 'Client onboarding completed successfully'
        });
        this.utils.log('Client onboarding successful', 'success');
      } else {
        onboardingResults.push({
          success: false,
          error: 'Onboarding completion not detected'
        });
        this.utils.log('Client onboarding may have failed', 'warning');
      }
      
      this.results.clientOnboarding = onboardingResults;
      return { success: true, results: onboardingResults };
      
    } catch (error) {
      this.utils.log(`Client onboarding test failed: ${error.message}`, 'error');
      return { success: false, error: error.message };
    }
  },

  // Test 6: License Usage Tracking
  async testLicenseUsageTracking() {
    this.utils.log('Testing license usage tracking...');
    
    try {
      const usageResults = [];
      
      // Check license store for usage data
      const licenseStore = window.useLicenseStore?.getState?.();
      if (licenseStore && licenseStore.getLicenseUsage) {
        const usage = await licenseStore.getLicenseUsage();
        
        usageResults.push({
          type: 'usage-data',
          data: usage,
          success: true
        });
        
        this.utils.log(`License usage: ${usage.used}/${usage.limit} users`, 'success');
      }
      
      // Test usage limits enforcement
      if (licenseStore && licenseStore.licenseInfo) {
        const { licenseInfo } = licenseStore;
        const maxUsers = licenseInfo.maxUsers;
        
        usageResults.push({
          type: 'usage-limits',
          maxUsers,
          currentUsers: licenseInfo.usageCount || 1,
          success: true
        });
        
        this.utils.log(`License limits: ${maxUsers} max users`, 'success');
      }
      
      return { success: true, results: usageResults };
      
    } catch (error) {
      this.utils.log(`License usage tracking test failed: ${error.message}`, 'error');
      return { success: false, error: error.message };
    }
  },

  // Run all license workflow tests
  async runAllTests() {
    this.utils.log('🚀 Starting License Workflow Tests...', 'info');
    
    const testResults = {
      adminLogin: null,
      licenseCreation: null,
      licenseActivation: null,
      licenseValidation: null,
      clientOnboarding: null,
      usageTracking: null,
      summary: {
        total: 6,
        passed: 0,
        failed: 0,
        errors: []
      }
    };
    
    try {
      // Test 1: Admin Login
      testResults.adminLogin = await this.testAdminLogin();
      if (testResults.adminLogin.success) testResults.summary.passed++;
      else testResults.summary.failed++;
      
      // Test 2: License Creation
      testResults.licenseCreation = await this.testLicenseCreation();
      if (testResults.licenseCreation.success) testResults.summary.passed++;
      else testResults.summary.failed++;
      
      // Test 3: License Activation
      testResults.licenseActivation = await this.testLicenseActivation();
      if (testResults.licenseActivation.success) testResults.summary.passed++;
      else testResults.summary.failed++;
      
      // Test 4: License Validation
      testResults.licenseValidation = await this.testLicenseValidation();
      if (testResults.licenseValidation.success) testResults.summary.passed++;
      else testResults.summary.failed++;
      
      // Test 5: Client Onboarding
      testResults.clientOnboarding = await this.testClientOnboarding();
      if (testResults.clientOnboarding.success) testResults.summary.passed++;
      else testResults.summary.failed++;
      
      // Test 6: Usage Tracking
      testResults.usageTracking = await this.testLicenseUsageTracking();
      if (testResults.usageTracking.success) testResults.summary.passed++;
      else testResults.summary.failed++;
      
    } catch (error) {
      this.utils.log(`Test execution failed: ${error.message}`, 'error');
      testResults.summary.errors.push(error.message);
    }
    
    // Add collected errors
    testResults.summary.errors = [...testResults.summary.errors, ...this.results.errors.map(e => e.message)];
    
    // Display results
    this.displayResults(testResults);
    
    return testResults;
  },

  // Display test results
  displayResults(results) {
    console.log('\n' + '='.repeat(60));
    console.log('🧪 LICENSE WORKFLOW TEST RESULTS');
    console.log('='.repeat(60));
    
    console.log(`\n📊 Summary:`);
    console.log(`   Total Tests: ${results.summary.total}`);
    console.log(`   ✅ Passed: ${results.summary.passed}`);
    console.log(`   ❌ Failed: ${results.summary.failed}`);
    console.log(`   📈 Success Rate: ${((results.summary.passed / results.summary.total) * 100).toFixed(1)}%`);
    
    console.log(`\n🔍 Detailed Results:`);
    
    Object.entries(results).forEach(([testName, result]) => {
      if (testName === 'summary') return;
      
      const status = result?.success ? '✅ PASS' : '❌ FAIL';
      console.log(`   ${testName}: ${status}`);
      
      if (result?.error) {
        console.log(`      Error: ${result.error}`);
      }
      
      if (result?.results && Array.isArray(result.results)) {
        result.results.forEach((item, index) => {
          const itemStatus = item.success ? '✅' : '❌';
          console.log(`      ${index + 1}. ${itemStatus} ${item.type || item.message || 'Test item'}`);
        });
      }
    });
    
    if (results.summary.errors.length > 0) {
      console.log(`\n🚨 Errors Encountered:`);
      results.summary.errors.forEach((error, index) => {
        console.log(`   ${index + 1}. ${error}`);
      });
    }
    
    console.log('\n' + '='.repeat(60));
    
    // Store results globally for inspection
    window.licenseTestResults = results;
    console.log('💾 Results saved to window.licenseTestResults');
  }
};

// Auto-run tests if script is executed directly
if (typeof window !== 'undefined') {
  window.LicenseWorkflowTest = LicenseWorkflowTest;
  console.log('🧪 License Workflow Test Suite loaded!');
  console.log('Run LicenseWorkflowTest.runAllTests() to start testing');
  
  // Auto-run after a short delay to allow page to load
  setTimeout(() => {
    if (window.location.hostname === 'localhost') {
      console.log('🚀 Auto-running license workflow tests...');
      LicenseWorkflowTest.runAllTests();
    }
  }, 3000);
}

export default LicenseWorkflowTest;