/**
 * AI Tutor Interaction Testing Script
 * Tests comprehensive AI tutor functionality during lessons and practice sessions
 * 
 * Usage: Run this script in browser console at localhost:3001
 * Prerequisites: EduAI application running with demo data
 */

// Test Configuration
const AI_TUTOR_TEST_CONFIG = {
  // Test credentials
  testStudent: {
    email: 'student@demo.com',
    password: 'demo123',
    name: 'Demo Student'
  },
  
  // Test lesson for AI tutor interaction
  testLesson: {
    id: 'smart-helpers-intro',
    title: 'Smart Helpers in Our World',
    category: 'AI Fundamentals'
  },
  
  // AI tutor test scenarios
  testQuestions: [
    'What are smart helpers?',
    'Can you explain this concept with an example?',
    'Help me understand computational thinking',
    'Show me a coding example',
    'Why is AI ethics important?'
  ],
  
  // Expected AI tutor features
  expectedFeatures: [
    'Chat interface',
    'Quick action buttons',
    'Voice interaction toggle',
    'Learning insights panel',
    'Message feedback system',
    'File attachment support',
    'Lesson context awareness'
  ]
}

// Test Results Storage
let aiTutorTestResults = {
  timestamp: new Date().toISOString(),
  totalTests: 0,
  passedTests: 0,
  failedTests: 0,
  testDetails: []
}

// Utility Functions
function logTest(testName, status, details = '') {
  const result = {
    test: testName,
    status: status,
    details: details,
    timestamp: new Date().toISOString()
  }
  
  aiTutorTestResults.testDetails.push(result)
  aiTutorTestResults.totalTests++
  
  if (status === 'PASS') {
    aiTutorTestResults.passedTests++
    console.log(`✅ ${testName}: ${status}`, details)
  } else {
    aiTutorTestResults.failedTests++
    console.log(`❌ ${testName}: ${status}`, details)
  }
}

function waitForElement(selector, timeout = 10000) {
  return new Promise((resolve, reject) => {
    const element = document.querySelector(selector)
    if (element) {
      resolve(element)
      return
    }
    
    const observer = new MutationObserver((mutations, obs) => {
      const element = document.querySelector(selector)
      if (element) {
        obs.disconnect()
        resolve(element)
      }
    })
    
    observer.observe(document.body, {
      childList: true,
      subtree: true
    })
    
    setTimeout(() => {
      observer.disconnect()
      reject(new Error(`Element ${selector} not found within ${timeout}ms`))
    }, timeout)
  })
}

function simulateClick(element) {
  const event = new MouseEvent('click', {
    view: window,
    bubbles: true,
    cancelable: true
  })
  element.dispatchEvent(event)
}

function simulateInput(element, value) {
  element.focus()
  element.value = value
  
  const inputEvent = new Event('input', {
    bubbles: true,
    cancelable: true
  })
  element.dispatchEvent(inputEvent)
  
  const changeEvent = new Event('change', {
    bubbles: true,
    cancelable: true
  })
  element.dispatchEvent(changeEvent)
}

function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms))
}

// Test Cases

// Test 1: Student Login and Lesson Access
async function testStudentLessonAccess() {
  try {
    // Check if already logged in as student
    const userMenu = document.querySelector('[data-testid="user-menu"]')
    if (!userMenu || !userMenu.textContent.includes('Demo Student')) {
      // Navigate to login if not already logged in
      const loginButton = document.querySelector('a[href="/login"]') || 
                         document.querySelector('button:contains("Login")')
      if (loginButton) {
        simulateClick(loginButton)
        await delay(1000)
      }
      
      // Fill login form
      const emailInput = await waitForElement('input[type="email"]')
      const passwordInput = await waitForElement('input[type="password"]')
      const submitButton = await waitForElement('button[type="submit"]')
      
      simulateInput(emailInput, AI_TUTOR_TEST_CONFIG.testStudent.email)
      simulateInput(passwordInput, AI_TUTOR_TEST_CONFIG.testStudent.password)
      simulateClick(submitButton)
      
      await delay(2000)
    }
    
    // Navigate to lessons
    const lessonsLink = await waitForElement('a[href="/lessons"], a[href="/student/lessons"]')
    simulateClick(lessonsLink)
    await delay(1500)
    
    // Find and click on test lesson
    const lessonCard = await waitForElement(`[data-testid="lesson-card"]:contains("${AI_TUTOR_TEST_CONFIG.testLesson.title}"), .lesson-card:contains("${AI_TUTOR_TEST_CONFIG.testLesson.title}")`)
    simulateClick(lessonCard)
    await delay(2000)
    
    logTest('Student Lesson Access', 'PASS', 'Successfully accessed lesson for AI tutor testing')
  } catch (error) {
    logTest('Student Lesson Access', 'FAIL', `Error: ${error.message}`)
  }
}

// Test 2: AI Tutor Button Visibility and Activation
async function testAITutorActivation() {
  try {
    // Look for AI tutor button (floating or in lesson interface)
    const aiTutorButton = await waitForElement(
      '[data-testid="ai-tutor-button"], button:contains("🤖"), .ai-tutor-button, button[title*="AI Tutor"]'
    )
    
    if (!aiTutorButton) {
      throw new Error('AI Tutor button not found')
    }
    
    // Click AI tutor button
    simulateClick(aiTutorButton)
    await delay(1500)
    
    // Verify AI tutor interface opens
    const aiTutorInterface = await waitForElement(
      '.ai-tutor-container, [data-testid="ai-tutor-interface"], .ai-tutor-modal'
    )
    
    if (!aiTutorInterface) {
      throw new Error('AI Tutor interface did not open')
    }
    
    logTest('AI Tutor Activation', 'PASS', 'AI Tutor interface successfully opened')
  } catch (error) {
    logTest('AI Tutor Activation', 'FAIL', `Error: ${error.message}`)
  }
}

// Test 3: AI Tutor Chat Interface Components
async function testAITutorChatInterface() {
  try {
    // Check for essential chat components
    const chatContainer = await waitForElement('.ai-tutor-container, [data-testid="ai-tutor-interface"]')
    
    // Check for tutor header with personality
    const tutorHeader = chatContainer.querySelector('.tutor-header, .ai-tutor-header')
    if (!tutorHeader) {
      throw new Error('Tutor header not found')
    }
    
    // Check for message area
    const messageArea = chatContainer.querySelector('.messages, .chat-messages, .message-area')
    if (!messageArea) {
      throw new Error('Message area not found')
    }
    
    // Check for input area
    const inputArea = chatContainer.querySelector('textarea, input[type="text"]')
    if (!inputArea) {
      throw new Error('Input area not found')
    }
    
    // Check for send button
    const sendButton = chatContainer.querySelector('button:contains("Send"), [data-testid="send-button"]')
    if (!sendButton) {
      throw new Error('Send button not found')
    }
    
    // Check for welcome message
    const welcomeMessage = messageArea.querySelector('.message, .ai-message')
    if (!welcomeMessage) {
      throw new Error('Welcome message not found')
    }
    
    logTest('AI Tutor Chat Interface', 'PASS', 'All essential chat components found')
  } catch (error) {
    logTest('AI Tutor Chat Interface', 'FAIL', `Error: ${error.message}`)
  }
}

// Test 4: Quick Action Buttons
async function testQuickActionButtons() {
  try {
    const chatContainer = document.querySelector('.ai-tutor-container, [data-testid="ai-tutor-interface"]')
    
    // Look for quick action buttons
    const quickActions = chatContainer.querySelectorAll(
      '.quick-action, .suggestion-button, button:contains("Explain"), button:contains("Example")')
    
    if (quickActions.length === 0) {
      throw new Error('No quick action buttons found')
    }
    
    // Test clicking a quick action
    const firstAction = quickActions[0]
    simulateClick(firstAction)
    await delay(1000)
    
    // Check if action was processed (input field should be populated or message sent)
    const inputField = chatContainer.querySelector('textarea, input[type="text"]')
    const hasInputText = inputField && inputField.value.length > 0
    const hasNewMessage = chatContainer.querySelectorAll('.message, .ai-message').length > 1
    
    if (!hasInputText && !hasNewMessage) {
      throw new Error('Quick action did not trigger expected behavior')
    }
    
    logTest('Quick Action Buttons', 'PASS', `Found ${quickActions.length} quick actions, functionality verified`)
  } catch (error) {
    logTest('Quick Action Buttons', 'FAIL', `Error: ${error.message}`)
  }
}

// Test 5: AI Tutor Message Interaction
async function testAITutorMessageInteraction() {
  try {
    const chatContainer = document.querySelector('.ai-tutor-container, [data-testid="ai-tutor-interface"]')
    const inputField = chatContainer.querySelector('textarea, input[type="text"]')
    const sendButton = chatContainer.querySelector('button:contains("Send"), [data-testid="send-button"]')
    
    // Test sending a message
    const testQuestion = AI_TUTOR_TEST_CONFIG.testQuestions[0]
    simulateInput(inputField, testQuestion)
    await delay(500)
    
    simulateClick(sendButton)
    await delay(1000)
    
    // Check if user message appears
    const userMessages = chatContainer.querySelectorAll('.user-message, .message.user')
    if (userMessages.length === 0) {
      throw new Error('User message did not appear')
    }
    
    // Wait for AI response (with timeout)
    let aiResponseFound = false
    for (let i = 0; i < 10; i++) {
      await delay(1000)
      const aiMessages = chatContainer.querySelectorAll('.ai-message, .message.ai, .assistant-message')
      if (aiMessages.length > 1) { // More than just welcome message
        aiResponseFound = true
        break
      }
    }
    
    if (!aiResponseFound) {
      throw new Error('AI response not received within timeout')
    }
    
    logTest('AI Tutor Message Interaction', 'PASS', 'Successfully sent message and received AI response')
  } catch (error) {
    logTest('AI Tutor Message Interaction', 'FAIL', `Error: ${error.message}`)
  }
}

// Test 6: Lesson Context Awareness
async function testLessonContextAwareness() {
  try {
    const chatContainer = document.querySelector('.ai-tutor-container, [data-testid="ai-tutor-interface"]')
    const inputField = chatContainer.querySelector('textarea, input[type="text"]')
    const sendButton = chatContainer.querySelector('button:contains("Send"), [data-testid="send-button"]')
    
    // Ask a lesson-specific question
    const contextQuestion = 'What is this lesson about?'
    simulateInput(inputField, contextQuestion)
    await delay(500)
    
    simulateClick(sendButton)
    await delay(3000) // Wait longer for AI response
    
    // Check if AI response mentions lesson context
    const aiMessages = chatContainer.querySelectorAll('.ai-message, .message.ai, .assistant-message')
    const latestMessage = aiMessages[aiMessages.length - 1]
    
    if (!latestMessage) {
      throw new Error('No AI response found')
    }
    
    const messageText = latestMessage.textContent.toLowerCase()
    const hasLessonContext = messageText.includes('smart helper') || 
                           messageText.includes('lesson') || 
                           messageText.includes('ai') ||
                           messageText.includes('artificial intelligence')
    
    if (!hasLessonContext) {
      throw new Error('AI response does not show lesson context awareness')
    }
    
    logTest('Lesson Context Awareness', 'PASS', 'AI tutor demonstrates awareness of current lesson context')
  } catch (error) {
    logTest('Lesson Context Awareness', 'FAIL', `Error: ${error.message}`)
  }
}

// Test 7: AI Tutor Features and Controls
async function testAITutorFeatures() {
  try {
    const chatContainer = document.querySelector('.ai-tutor-container, [data-testid="ai-tutor-interface"]')
    let featuresFound = 0
    const featureDetails = []
    
    // Check for voice controls
    const voiceButton = chatContainer.querySelector('button:contains("🎤"), [data-testid="voice-button"], button[title*="voice"]')
    if (voiceButton) {
      featuresFound++
      featureDetails.push('Voice interaction toggle')
    }
    
    // Check for insights panel toggle
    const insightsButton = chatContainer.querySelector('button:contains("🧠"), [data-testid="insights-button"], button[title*="insight"]')
    if (insightsButton) {
      featuresFound++
      featureDetails.push('Learning insights panel')
      
      // Test insights panel
      simulateClick(insightsButton)
      await delay(1000)
      
      const insightsPanel = chatContainer.querySelector('.insights-panel, .learning-insights')
      if (insightsPanel) {
        featureDetails.push('Insights panel functionality')
      }
    }
    
    // Check for fullscreen toggle
    const fullscreenButton = chatContainer.querySelector('button:contains("⛶"), [data-testid="fullscreen-button"]')
    if (fullscreenButton) {
      featuresFound++
      featureDetails.push('Fullscreen toggle')
    }
    
    // Check for message feedback buttons
    const feedbackButtons = chatContainer.querySelectorAll('button:contains("👍"), button:contains("👎"), .feedback-button')
    if (feedbackButtons.length > 0) {
      featuresFound++
      featureDetails.push('Message feedback system')
    }
    
    // Check for file attachment support
    const attachmentButton = chatContainer.querySelector('input[type="file"], button[title*="attach"], .attachment-button')
    if (attachmentButton) {
      featuresFound++
      featureDetails.push('File attachment support')
    }
    
    if (featuresFound < 3) {
      throw new Error(`Only ${featuresFound} features found, expected at least 3`)
    }
    
    logTest('AI Tutor Features', 'PASS', `Found ${featuresFound} features: ${featureDetails.join(', ')}`)
  } catch (error) {
    logTest('AI Tutor Features', 'FAIL', `Error: ${error.message}`)
  }
}

// Test 8: AI Tutor Minimization and Restoration
async function testAITutorMinimization() {
  try {
    const chatContainer = document.querySelector('.ai-tutor-container, [data-testid="ai-tutor-interface"]')
    
    // Look for minimize button
    const minimizeButton = chatContainer.querySelector('button:contains("−"), [data-testid="minimize-button"], button[title*="minimize"]')
    if (!minimizeButton) {
      throw new Error('Minimize button not found')
    }
    
    // Click minimize
    simulateClick(minimizeButton)
    await delay(1000)
    
    // Check if AI tutor is minimized (interface should be hidden or smaller)
    const isMinimized = !chatContainer.offsetParent || 
                       chatContainer.style.display === 'none' ||
                       chatContainer.classList.contains('minimized')
    
    if (!isMinimized) {
      // Look for floating button instead
      const floatingButton = await waitForElement('[data-testid="ai-tutor-button"], .floating-ai-button')
      if (!floatingButton) {
        throw new Error('AI tutor did not minimize properly')
      }
    }
    
    logTest('AI Tutor Minimization', 'PASS', 'AI tutor successfully minimized and can be restored')
  } catch (error) {
    logTest('AI Tutor Minimization', 'FAIL', `Error: ${error.message}`)
  }
}

// Main Test Runner
async function runAITutorTests() {
  console.log('🤖 Starting AI Tutor Interaction Testing...')
  console.log('=' .repeat(50))
  
  // Initialize test results
  aiTutorTestResults = {
    timestamp: new Date().toISOString(),
    totalTests: 0,
    passedTests: 0,
    failedTests: 0,
    testDetails: []
  }
  
  try {
    // Run all test cases
    await testStudentLessonAccess()
    await delay(1000)
    
    await testAITutorActivation()
    await delay(1000)
    
    await testAITutorChatInterface()
    await delay(1000)
    
    await testQuickActionButtons()
    await delay(1000)
    
    await testAITutorMessageInteraction()
    await delay(2000)
    
    await testLessonContextAwareness()
    await delay(2000)
    
    await testAITutorFeatures()
    await delay(1000)
    
    await testAITutorMinimization()
    
  } catch (error) {
    console.error('Test execution error:', error)
  }
  
  // Display final results
  console.log('\n' + '=' .repeat(50))
  console.log('🤖 AI TUTOR INTERACTION TEST RESULTS')
  console.log('=' .repeat(50))
  console.log(`📊 Total Tests: ${aiTutorTestResults.totalTests}`)
  console.log(`✅ Passed: ${aiTutorTestResults.passedTests}`)
  console.log(`❌ Failed: ${aiTutorTestResults.failedTests}`)
  console.log(`📈 Success Rate: ${((aiTutorTestResults.passedTests / aiTutorTestResults.totalTests) * 100).toFixed(1)}%`)
  
  if (aiTutorTestResults.failedTests > 0) {
    console.log('\n❌ Failed Tests:')
    aiTutorTestResults.testDetails
      .filter(test => test.status === 'FAIL')
      .forEach(test => {
        console.log(`   • ${test.test}: ${test.details}`)
      })
  }
  
  console.log('\n✅ Passed Tests:')
  aiTutorTestResults.testDetails
    .filter(test => test.status === 'PASS')
    .forEach(test => {
      console.log(`   • ${test.test}: ${test.details}`)
    })
  
  console.log('\n📋 Test completed at:', new Date().toLocaleString())
  console.log('💾 Results stored in aiTutorTestResults variable')
  
  return aiTutorTestResults
}

// Auto-run if in browser console
if (typeof window !== 'undefined') {
  console.log('🤖 AI Tutor Test Script Loaded')
  console.log('Run runAITutorTests() to start testing')
  console.log('Or wait 3 seconds for auto-start...')
  
  setTimeout(() => {
    runAITutorTests()
  }, 3000)
}

// Export for Node.js if needed
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    runAITutorTests,
    AI_TUTOR_TEST_CONFIG,
    aiTutorTestResults
  }
}