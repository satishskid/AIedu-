#!/usr/bin/env node

/**
 * Lesson Content Population Script
 * This script enhances existing lesson JSON files with structured content
 * to address blank pages and improve lesson presentation.
 */

const fs = require('fs');
const path = require('path');

// Directory containing lesson files
const lessonsDir = path.join(__dirname, 'src', 'data', 'lessons');

// Enhanced content templates based on lesson types
const contentTemplates = {
  'smart-helpers': {
    sections: [
      {
        title: 'What are Smart Helpers?',
        content: 'Smart helpers are AI-powered devices and applications that can understand what we say and help us with different tasks. They use artificial intelligence to learn and respond to our needs.\n\nExamples of smart helpers include:\n\n• Voice assistants like Alexa, Siri, and Google Assistant\n• Smart home devices that can control lights and temperature\n• Educational apps that adapt to how you learn\n• Navigation apps that find the best routes',
        keyConcepts: [
          'AI-powered devices that respond to voice commands',
          'Machine learning helps them understand different accents and languages',
          'They connect to the internet to access information',
          'Privacy and safety are important when using smart helpers'
        ],
        aiConnection: 'Smart helpers use natural language processing (NLP) to understand human speech and machine learning to improve their responses over time. They demonstrate how AI can make technology more accessible and user-friendly.',
        examples: [
          {
            title: 'Voice Command Example',
            language: 'Conversation',
            code: 'You: "Hey Alexa, what\'s the weather like today?"\nAlexa: "Today in your area, it\'s sunny with a high of 75 degrees and a low of 60 degrees."\n\nYou: "Set a timer for 10 minutes"\nAlexa: "10 minute timer starting now."'
          }
        ]
      },
      {
        title: 'How Smart Helpers Learn',
        content: 'Smart helpers get better at helping us by learning from millions of conversations and interactions. This is called machine learning - they use patterns in data to understand what people want and how to respond helpfully.',
        keyConcepts: [
          'Machine learning helps AI improve over time',
          'Training data comes from many different sources',
          'AI systems learn patterns in human language',
          'The more they practice, the better they become'
        ],
        aiConnection: 'This demonstrates supervised learning, where AI systems are trained on large datasets of human conversations to learn appropriate responses and behaviors.'
      }
    ]
  },
  
  'computational-thinking': {
    sections: [
      {
        title: 'What is Computational Thinking?',
        content: 'Computational thinking is a problem-solving process that includes four key steps: decomposition, pattern recognition, abstraction, and algorithms. It\'s how computer scientists approach complex problems, but these skills are useful in many areas of life.',
        keyConcepts: [
          'Decomposition: Breaking big problems into smaller parts',
          'Pattern Recognition: Finding similarities and trends',
          'Abstraction: Focusing on important details',
          'Algorithms: Creating step-by-step solutions'
        ],
        aiConnection: 'AI systems use computational thinking principles to process information, recognize patterns in data, and make decisions. Understanding these concepts helps us better understand how AI works.',
        examples: [
          {
            title: 'Planning a School Event',
            language: 'Process',
            code: '1. DECOMPOSITION:\n   - Choose theme and date\n   - Plan activities\n   - Organize food and drinks\n   - Set up decorations\n   - Invite students\n\n2. PATTERN RECOGNITION:\n   - What made past events successful?\n   - What activities do students enjoy most?\n   - What time of day works best?\n\n3. ABSTRACTION:\n   - Focus on: theme, activities, food, decorations\n   - Ignore: specific colors, exact menu details\n\n4. ALGORITHM:\n   - Step 1: Survey students for theme preferences\n   - Step 2: Book venue and set date\n   - Step 3: Plan 3-4 main activities\n   - Step 4: Organize refreshments\n   - Step 5: Send invitations 2 weeks early'
          }
        ]
      }
    ]
  },
  
  'python-fundamentals': {
    sections: [
      {
        title: 'Introduction to Python Programming',
        content: 'Python is a powerful, easy-to-learn programming language that\'s widely used in artificial intelligence, web development, data science, and automation. Its simple syntax makes it perfect for beginners while being powerful enough for advanced applications.',
        keyConcepts: [
          'Python uses simple, readable syntax',
          'Variables store and manipulate data',
          'Functions help organize and reuse code',
          'Python is interpreted, not compiled'
        ],
        aiConnection: 'Python is one of the most popular languages for AI development. Libraries like TensorFlow, PyTorch, and scikit-learn make it easy to build machine learning models and AI applications.',
        examples: [
          {
            title: 'Hello World Program',
            language: 'Python',
            code: '# This is a comment - it explains what the code does\nprint("Hello, World!")\nprint("Welcome to Python programming!")\n\n# Variables store information\nname = "Student"\nage = 15\nprint(f"Hello {name}, you are {age} years old!")'
          },
          {
            title: 'Simple Calculator',
            language: 'Python',
            code: '# Simple calculator program\nnum1 = float(input("Enter first number: "))\nnum2 = float(input("Enter second number: "))\n\n# Perform calculations\naddition = num1 + num2\nsubtraction = num1 - num2\nmultiplication = num1 * num2\ndivision = num1 / num2 if num2 != 0 else "Cannot divide by zero"\n\n# Display results\nprint(f"Addition: {addition}")\nprint(f"Subtraction: {subtraction}")\nprint(f"Multiplication: {multiplication}")\nprint(f"Division: {division}")'
          }
        ]
      }
    ]
  },
  
  'machine-learning': {
    sections: [
      {
        title: 'Understanding Machine Learning',
        content: 'Machine Learning is a subset of artificial intelligence that enables computers to learn and make decisions from data without being explicitly programmed for every scenario. Instead of following pre-written instructions, ML systems find patterns in data and use those patterns to make predictions or decisions.',
        keyConcepts: [
          'Supervised Learning: Learning from labeled examples',
          'Unsupervised Learning: Finding hidden patterns in data',
          'Training Data: Examples used to teach the algorithm',
          'Model: The AI system that makes predictions'
        ],
        aiConnection: 'Machine learning is the foundation of modern AI applications like image recognition, natural language processing, recommendation systems, and autonomous vehicles.',
        examples: [
          {
            title: 'Simple Linear Regression',
            language: 'Python',
            code: 'import numpy as np\nfrom sklearn.linear_model import LinearRegression\nimport matplotlib.pyplot as plt\n\n# Sample data: hours studied vs test scores\nhours_studied = np.array([[1], [2], [3], [4], [5], [6], [7], [8]])\ntest_scores = np.array([50, 55, 65, 70, 80, 85, 90, 95])\n\n# Create and train the model\nmodel = LinearRegression()\nmodel.fit(hours_studied, test_scores)\n\n# Make a prediction\nhours_to_predict = [[6.5]]\npredicted_score = model.predict(hours_to_predict)\nprint(f"Predicted score for 6.5 hours of study: {predicted_score[0]:.1f}")\n\n# Visualize the results\nplt.scatter(hours_studied, test_scores, color=\'blue\', label=\'Actual data\')\nplt.plot(hours_studied, model.predict(hours_studied), color=\'red\', label=\'Prediction line\')\nplt.xlabel(\'Hours Studied\')\nplt.ylabel(\'Test Score\')\nplt.legend()\nplt.show()'
          }
        ]
      }
    ]
  }
};

// Function to enhance lesson content
function enhanceLessonContent(lessonData, lessonId) {
  // Determine content template based on lesson ID or title
  let templateKey = null;
  
  if (lessonId.includes('smart-helper') || lessonData.title?.toLowerCase().includes('smart helper')) {
    templateKey = 'smart-helpers';
  } else if (lessonId.includes('computational-thinking') || lessonData.title?.toLowerCase().includes('computational thinking')) {
    templateKey = 'computational-thinking';
  } else if (lessonId.includes('python') || lessonData.title?.toLowerCase().includes('python')) {
    templateKey = 'python-fundamentals';
  } else if (lessonId.includes('machine-learning') || lessonData.title?.toLowerCase().includes('machine learning')) {
    templateKey = 'machine-learning';
  }
  
  // If we have a template and the lesson lacks content, enhance it
  if (templateKey && contentTemplates[templateKey]) {
    if (!lessonData.content || !lessonData.content.sections || lessonData.content.sections.length === 0) {
      console.log(`Enhancing ${lessonId} with ${templateKey} template`);
      
      lessonData.content = {
        ...lessonData.content,
        sections: contentTemplates[templateKey].sections
      };
      
      // Ensure learning objectives exist
      if (!lessonData.learningObjectives || lessonData.learningObjectives.length === 0) {
        lessonData.learningObjectives = [
          'Understand key concepts and terminology',
          'Apply knowledge through practical examples',
          'Connect learning to real-world AI applications',
          'Develop problem-solving skills'
        ];
      }
      
      return true; // Content was enhanced
    }
  }
  
  return false; // No enhancement needed
}

// Main function to process all lesson files
function populateLessonContent() {
  console.log('Starting lesson content population...');
  
  if (!fs.existsSync(lessonsDir)) {
    console.error(`Lessons directory not found: ${lessonsDir}`);
    return;
  }
  
  const lessonFiles = fs.readdirSync(lessonsDir).filter(file => file.endsWith('.json'));
  let enhancedCount = 0;
  
  lessonFiles.forEach(filename => {
    const filePath = path.join(lessonsDir, filename);
    const lessonId = filename.replace('.json', '');
    
    try {
      const lessonData = JSON.parse(fs.readFileSync(filePath, 'utf8'));
      
      if (enhanceLessonContent(lessonData, lessonId)) {
        // Write enhanced content back to file
        fs.writeFileSync(filePath, JSON.stringify(lessonData, null, 2));
        enhancedCount++;
        console.log(`✓ Enhanced: ${filename}`);
      } else {
        console.log(`- Skipped: ${filename} (already has content or no template available)`);
      }
    } catch (error) {
      console.error(`Error processing ${filename}:`, error.message);
    }
  });
  
  console.log(`\nContent population complete!`);
  console.log(`Enhanced ${enhancedCount} out of ${lessonFiles.length} lesson files.`);
  console.log('\nTo run this script: node populate-lesson-content.js');
}

// Run the script if called directly
if (require.main === module) {
  populateLessonContent();
}

module.exports = { populateLessonContent, enhanceLessonContent, contentTemplates };