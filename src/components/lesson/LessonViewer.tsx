import React, { useState, useEffect, useRef } from 'react'
import {
  Play,
  Pause,
  SkipForward,
  SkipBack,
  Volume2,
  VolumeX,
  Maximize,
  Minimize,
  BookOpen,
  Code,
  CheckCircle,
  Clock,
  Star,
  MessageSquare,
  Download,
  Share2,
  Bookmark,
  BookmarkCheck,
  ChevronLeft,
  ChevronRight,
  RotateCcw,
  Settings,
  Eye,
  EyeOff,
  Target,
  Award,
  Brain
} from 'lucide-react'
import { useAuthStore } from '../../store/authStore'
import { useLicenseStore } from '../../store/licenseStore'
import { LoadingSpinner } from '../common/LoadingSpinner'
import { AITutor } from './AITutor'

interface Lesson {
  id: string
  title: string
  description: string
  duration: number // in minutes
  difficulty: 'beginner' | 'intermediate' | 'advanced'
  category: string
  tags: string[]
  videoUrl?: string
  content: LessonContent[]
  prerequisites: string[]
  learningObjectives: string[]
  resources: Resource[]
  quiz?: Quiz
  completed: boolean
  progress: number // 0-100
  rating: number
  enrolledStudents: number
}

interface LessonContent {
  id: string
  type: 'text' | 'video' | 'code' | 'interactive' | 'quiz'
  title: string
  content: string
  duration?: number
  completed: boolean
}

interface Resource {
  id: string
  title: string
  type: 'pdf' | 'link' | 'code' | 'image'
  url: string
  description?: string
}

interface Quiz {
  id: string
  questions: QuizQuestion[]
  passingScore: number
  attempts: number
  maxAttempts: number
}

interface QuizQuestion {
  id: string
  question: string
  type: 'multiple-choice' | 'true-false' | 'code'
  options?: string[]
  correctAnswer: string | number
  explanation: string
}

interface LessonViewerProps {
  lessonId: string
  onComplete?: (lessonId: string) => void
  onProgress?: (lessonId: string, progress: number) => void
}

export const LessonViewer: React.FC<LessonViewerProps> = ({
  lessonId,
  onComplete,
  onProgress
}) => {
  console.log('🔍 LessonViewer: Component mounted with lessonId:', lessonId)
  console.log('🔍 LessonViewer: Props received:', { lessonId, onComplete, onProgress })
  console.log('🔍 LessonViewer: Current URL:', window.location.href)
  
  const { user } = useAuthStore()
  const { licenseInfo } = useLicenseStore()
  
  const [lesson, setLesson] = useState<Lesson | null>(null)
  const [currentContentIndex, setCurrentContentIndex] = useState(0)
  const [isLoading, setIsLoading] = useState(true)
  const [isPlaying, setIsPlaying] = useState(false)
  const [isMuted, setIsMuted] = useState(false)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [showNotes, setShowNotes] = useState(false)
  const [notes, setNotes] = useState('')
  const [isBookmarked, setIsBookmarked] = useState(false)
  const [playbackSpeed, setPlaybackSpeed] = useState(1)
  const [volume, setVolume] = useState(1)
  const [showAITutor, setShowAITutor] = useState(false)
  const [aiTutorMinimized, setAITutorMinimized] = useState(true)
  
  const videoRef = useRef<HTMLVideoElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  // Function to load lesson data from JSON files
  const loadLessonData = async (lessonId: string): Promise<any> => {
    console.log(`🔄 Loading lesson data for: ${lessonId}`)
    try {
      const lessonModule = await import(`../../data/lessons/${lessonId}.json`)
      console.log(`✅ Successfully loaded lesson module for: ${lessonId}`, lessonModule.default)
      return lessonModule.default
    } catch (error) {
      console.error(`❌ Error loading lesson ${lessonId}:`, error)
      return null
    }
  }

  // Function to generate contextual resources based on lesson data
  const generateContextualResources = (lessonData: any): Resource[] => {
    const grade = lessonData.grade || 'K-2'
    const category = lessonData.category || 'general'
    const title = lessonData.title || ''
    const curriculum = lessonData.curriculum || []
    const lessonId = lessonData.id || ''
    
    // Create contextual resources based on lesson content and topics
    const resources: Resource[] = []
    
    // Lesson-specific resources based on ID and content
    if (lessonId.includes('smart-helpers') || title.toLowerCase().includes('smart helper')) {
      if (grade === 'K-2' || grade.includes('K')) {
        resources.push(
          {
            id: '1',
            title: 'Smart Helpers Around Us - Interactive Guide',
            type: 'link',
            url: 'https://www.commonsensemedia.org/lists/ai-apps-and-tools-for-kids',
            description: 'Discover smart helpers like Alexa, Siri, and smart toys with fun activities'
          },
          {
            id: '2',
            title: 'AI for Kids - Parent & Teacher Guide',
            type: 'pdf',
            url: '/resources/smart-helpers-guide-k2.pdf',
            description: 'Help children understand AI assistants safely and appropriately'
          }
        )
      }
    }
    
    if (lessonId.includes('computational-thinking') || curriculum.includes('Computational Thinking')) {
      resources.push(
        {
          id: '1',
          title: 'Computational Thinking Unplugged Activities',
          type: 'link',
          url: 'https://csunplugged.org/en/computational-thinking/',
          description: 'Hands-on activities to practice decomposition, patterns, and algorithms'
        },
        {
          id: '2',
          title: 'AI Ethics Framework for Students',
          type: 'pdf',
          url: '/resources/computational-thinking-ethics.pdf',
          description: 'Understanding fairness, privacy, and responsibility in AI systems'
        }
      )
    }
    
    if (lessonId.includes('machine-learning') || category.toLowerCase().includes('machine learning')) {
      if (grade.includes('10') || grade.includes('9') || grade.includes('11') || grade.includes('12')) {
        resources.push(
          {
            id: '1',
            title: 'Python Machine Learning Starter Kit',
            type: 'code',
            url: 'https://github.com/scikit-learn/scikit-learn/tree/main/examples',
            description: 'Complete code examples for building your first ML models'
          },
          {
            id: '2',
            title: 'Kaggle Learn - Machine Learning Course',
            type: 'link',
            url: 'https://www.kaggle.com/learn/machine-learning',
            description: 'Free hands-on course with real datasets and projects'
          },
          {
            id: '3',
            title: 'AI Career Pathways Guide',
            type: 'pdf',
            url: '/resources/ai-careers-high-school.pdf',
            description: 'Explore different AI careers and required skills'
          }
        )
      }
    }
    
    // Grade-specific contextual resources
    if (grade === 'K-2' || grade.includes('K') || grade.includes('kindergarten')) {
      if (resources.length === 0) {
        resources.push(
          {
            id: '1',
            title: `${title} - Fun Activities`,
            type: 'link',
            url: 'https://www.commonsensemedia.org/lists/ai-apps-and-tools-for-kids',
            description: 'Age-appropriate games and activities related to this lesson'
          },
          {
            id: '2',
            title: 'Visual Learning Cards',
            type: 'image',
            url: '/images/lesson-cards-k2.png',
            description: 'Colorful cards to help remember key concepts from this lesson'
          }
        )
      }
    }
    
    if (grade.includes('3') || grade.includes('4') || grade.includes('5')) {
      if (resources.length === 0) {
        resources.push(
          {
            id: '1',
            title: `${category} - Scratch Projects`,
            type: 'link',
            url: 'https://scratch.mit.edu/projects/editor/',
            description: `Create interactive projects related to ${title.toLowerCase()}`
          },
          {
            id: '2',
            title: 'Elementary AI Ethics Guide',
            type: 'pdf',
            url: '/resources/ai-ethics-elementary.pdf',
            description: 'Understanding right and wrong in technology use'
          }
        )
      }
    }
    
    if (grade.includes('6') || grade.includes('7') || grade.includes('8')) {
      if (resources.length === 0) {
        resources.push(
          {
            id: '1',
            title: `${category} - Real-World Applications`,
            type: 'link',
            url: 'https://www.cs-first.com/',
            description: `Explore how ${title.toLowerCase()} is used in everyday life`
          },
          {
            id: '2',
            title: 'Middle School AI Project Ideas',
            type: 'pdf',
            url: '/resources/ai-projects-middle-school.pdf',
            description: 'Hands-on projects to apply what you learned in this lesson'
          }
        )
      }
    }
    
    if (grade.includes('9') || grade.includes('10') || grade.includes('11') || grade.includes('12')) {
      if (resources.length === 0) {
        resources.push(
          {
            id: '1',
            title: `Advanced ${category} Resources`,
            type: 'link',
            url: 'https://www.python.org/about/gettingstarted/',
            description: `Deep dive into ${title.toLowerCase()} with programming examples`
          },
          {
            id: '2',
            title: 'High School AI Research Papers',
            type: 'link',
            url: 'https://arxiv.org/list/cs.AI/recent',
            description: 'Latest research papers related to this lesson topic'
          },
          {
            id: '3',
            title: 'AI Ethics and Society Impact',
            type: 'pdf',
            url: '/resources/ai-ethics-high-school.pdf',
            description: 'Understanding the societal implications of AI technology'
          }
        )
      }
    }
    
    // Add curriculum-specific resources
    if (curriculum.includes('Python') || curriculum.includes('Programming')) {
      resources.push({
        id: `python-${resources.length + 1}`,
        title: 'Python Programming Practice',
        type: 'code',
        url: 'https://repl.it/@python',
        description: 'Interactive Python coding environment to practice concepts from this lesson'
      })
    }
    
    if (curriculum.includes('Ethics') || lessonId.includes('ethics')) {
      resources.push({
        id: `ethics-${resources.length + 1}`,
        title: 'AI Ethics Case Studies',
        type: 'link',
        url: 'https://www.partnershiponai.org/case-studies/',
        description: 'Real-world examples of ethical considerations in AI development'
      })
    }
    
    // Ensure we always have at least one resource
    if (resources.length === 0) {
      resources.push({
        id: '1',
        title: `${title} - Additional Learning`,
        type: 'link',
        url: 'https://www.commonsensemedia.org/lists/coding-apps-and-websites',
        description: `Explore more resources related to ${title.toLowerCase()}`
      })
    }
    
    return resources
  }

  // Function to generate enhanced fallback content when lesson sections are empty or missing
  const generateEnhancedFallbackContent = (lessonData: any): LessonContent[] => {
    const grade = lessonData.grade || 'K-12'
    const category = lessonData.category || 'AI & Programming'
    const title = lessonData.title || 'Learning Module'
    const description = lessonData.description || 'Explore important concepts in artificial intelligence and programming.'
    const objectives = lessonData.learningObjectives || lessonData.learningOutcomes || [
      'Understand fundamental concepts',
      'Apply knowledge through practical examples',
      'Connect learning to real-world applications',
      'Develop critical thinking skills'
    ]

    const fallbackContent: LessonContent[] = []

    // Enhanced introduction section
    fallbackContent.push({
      id: 'enhanced-intro',
      type: 'text',
      title: `Welcome to ${title}`,
      content: `# ${title}

${description}

## 🎯 Learning Objectives

${objectives.map((obj: string, i: number) => `**${i + 1}.** ${obj}`).join('\n\n')}

## 🚀 What Makes This Lesson Special

This lesson is designed to help you:

• **Understand** core concepts through clear explanations
• **Practice** with hands-on activities and examples
• **Connect** your learning to real-world applications
• **Explore** additional resources for deeper understanding

## 📚 How to Get the Most Out of This Lesson

1. **Read actively** - Take notes and ask questions
2. **Practice regularly** - Try the examples and exercises
3. **Use the AI tutor** - Get help when you need it
4. **Explore resources** - Check out the additional materials in the sidebar

*Ready to begin your learning journey? Let's dive in!*`,
      duration: 10,
      completed: false
    })

    // Grade-specific content sections
    if (grade.includes('K') || grade.includes('1') || grade.includes('2')) {
      fallbackContent.push({
        id: 'k2-exploration',
        type: 'text',
        title: '🌟 Let\'s Explore Together!',
        content: `# Fun Learning Activities

## 🎮 Interactive Games

Let's learn through play! Here are some fun ways to explore ${category.toLowerCase()}:

• **Story Time**: Listen to stories about smart helpers and AI friends
• **Picture Matching**: Match pictures of technology we use every day
• **Simple Coding**: Use colorful blocks to create simple programs
• **Ask Questions**: What makes something "smart"? Let's find out!

## 🤖 Meet Your AI Friends

Did you know that AI helpers are all around us?

• **Alexa and Siri** help answer questions
• **Smart toys** can play games with you
• **Video games** use AI to create fun challenges
• **Drawing apps** can help you create amazing art

## 🎨 Creative Activities

• Draw your favorite smart helper
• Tell a story about a robot friend
• Build something with blocks or LEGO
• Sing a song about technology

*Remember: Learning should be fun! Take your time and enjoy exploring.*`,
        duration: 8,
        completed: false
      })
    } else if (grade.includes('3') || grade.includes('4') || grade.includes('5')) {
      fallbackContent.push({
        id: 'elementary-concepts',
        type: 'text',
        title: '🔍 Understanding the Basics',
        content: `# Core Concepts in ${category}

## 🧠 What is Artificial Intelligence?

Artificial Intelligence (AI) is like giving computers a brain! It helps them:

• **Think** and solve problems
• **Learn** from examples and practice
• **Recognize** patterns in pictures, sounds, and text
• **Make decisions** based on information

## 💡 Real-World Examples

You use AI more than you think!

**At Home:**
• Voice assistants that answer questions
• Recommendation systems on YouTube or Netflix
• Smart home devices that learn your preferences

**At School:**
• Educational apps that adapt to your learning style
• Online games that get harder as you improve
• Translation tools for different languages

## 🛠️ Hands-On Activities

1. **Pattern Recognition**: Look for patterns in numbers, shapes, or colors
2. **Algorithm Practice**: Write step-by-step instructions for daily tasks
3. **Data Collection**: Gather information about your favorite topics
4. **Problem Solving**: Break big problems into smaller, manageable pieces

## 🎯 Challenge Yourself

• Can you teach someone else what you learned?
• What questions do you still have?
• How might AI help solve problems in your community?`,
        duration: 12,
        completed: false
      })
    } else if (grade.includes('6') || grade.includes('7') || grade.includes('8')) {
      fallbackContent.push({
        id: 'middle-school-deep-dive',
        type: 'text',
        title: '🚀 Diving Deeper into AI',
        content: `# Advanced Concepts in ${category}

## 🔬 The Science Behind AI

Artificial Intelligence combines multiple fields:

• **Computer Science**: Programming and algorithms
• **Mathematics**: Statistics, probability, and logic
• **Psychology**: Understanding how humans think and learn
• **Engineering**: Building systems that work reliably

## 📊 Types of AI Systems

**Machine Learning**: Systems that improve through experience
• Recommendation engines (Spotify, Amazon)
• Image recognition (photo tagging)
• Predictive text (smartphone keyboards)

**Natural Language Processing**: Understanding human language
• Chatbots and virtual assistants
• Language translation services
• Text analysis and summarization

**Computer Vision**: "Seeing" and understanding images
• Facial recognition systems
• Medical image analysis
• Autonomous vehicle navigation

## 🛠️ Programming Concepts

Key programming ideas you'll encounter:

• **Variables**: Storing and managing data
• **Functions**: Reusable blocks of code
• **Loops**: Repeating actions efficiently
• **Conditionals**: Making decisions in code
• **Data Structures**: Organizing information effectively

## 🌍 AI Ethics and Society

Important questions to consider:

• How do we ensure AI systems are fair to everyone?
• What happens to privacy when AI analyzes our data?
• How can we prevent AI from being used harmfully?
• What jobs might change as AI becomes more common?

## 🎯 Project Ideas

• Create a simple chatbot
• Build a recommendation system
• Design an AI-powered game
• Research AI applications in your interests`,
        duration: 15,
        completed: false
      })
    } else {
      // High school content
      fallbackContent.push({
        id: 'high-school-advanced',
        type: 'text',
        title: '🎓 Advanced AI Concepts & Applications',
        content: `# Professional-Level ${category}

## 🏗️ AI System Architecture

Modern AI systems are built with sophisticated architectures:

**Neural Networks**: Inspired by the human brain
• Deep learning models with multiple layers
• Convolutional networks for image processing
• Recurrent networks for sequential data
• Transformer architectures for language models

**Machine Learning Pipelines**:
1. **Data Collection**: Gathering relevant datasets
2. **Data Preprocessing**: Cleaning and preparing data
3. **Model Training**: Teaching algorithms to recognize patterns
4. **Evaluation**: Testing model performance
5. **Deployment**: Putting models into production
6. **Monitoring**: Ensuring continued performance

## 💼 Industry Applications

**Healthcare**: Diagnostic imaging, drug discovery, personalized treatment
**Finance**: Fraud detection, algorithmic trading, risk assessment
**Transportation**: Autonomous vehicles, route optimization, traffic management
**Entertainment**: Content recommendation, game AI, creative tools
**Education**: Personalized learning, automated grading, intelligent tutoring

## 🔧 Technical Skills Development

**Programming Languages**:
• **Python**: Most popular for AI/ML development
• **R**: Statistical analysis and data science
• **JavaScript**: Web-based AI applications
• **C++**: High-performance computing

**Essential Libraries and Frameworks**:
• **TensorFlow/PyTorch**: Deep learning frameworks
• **Scikit-learn**: Traditional machine learning
• **Pandas/NumPy**: Data manipulation and analysis
• **OpenCV**: Computer vision applications

## 🎯 Career Pathways

• **Machine Learning Engineer**: Building and deploying ML systems
• **Data Scientist**: Extracting insights from complex datasets
• **AI Research Scientist**: Advancing the field through research
• **AI Ethics Specialist**: Ensuring responsible AI development
• **Product Manager**: Leading AI-powered product development

## 🚀 Advanced Project Ideas

• Implement a neural network from scratch
• Create a computer vision application
• Build a natural language processing system
• Develop an AI-powered web application
• Contribute to open-source AI projects`,
        duration: 20,
        completed: false
      })
    }

    // Add a practical application section for all grades
    fallbackContent.push({
      id: 'practical-applications',
      type: 'interactive',
      title: '🎯 Put Your Knowledge to Work',
      content: `# Apply What You've Learned

## 🔍 Reflection Questions

Take a moment to think about:

• What was the most interesting thing you learned?
• How does this connect to things you already know?
• What questions do you still have?
• How might you use this knowledge in the future?

## 🌟 Next Steps

**Continue Learning**:
• Explore the additional resources in the sidebar
• Try the practice exercises and coding examples
• Ask the AI tutor for help with specific concepts
• Connect with classmates to discuss what you've learned

**Apply Your Knowledge**:
• Look for examples of AI in your daily life
• Share what you've learned with friends and family
• Consider how AI might solve problems you care about
• Think about potential career paths in technology

## 🎉 Celebrate Your Progress

Learning about AI and programming is challenging and rewarding. You're building skills that will be valuable throughout your life!

*Remember: Every expert was once a beginner. Keep learning, keep practicing, and keep asking questions.*`,
      duration: 8,
      completed: false
    })

    return fallbackContent
  }

  // Function to convert lesson data to component format
  const convertLessonData = (lessonData: any): Lesson => {
    console.log('🔍 convertLessonData called with:', lessonData)
    console.log('📊 Lesson data structure:', {
      id: lessonData.id,
      title: lessonData.title,
      description: lessonData.description,
      hasContent: !!lessonData.content,
      contentSections: lessonData.content?.sections?.length || 0,
      learningObjectives: (lessonData.learningObjectives || lessonData.learningOutcomes)?.length || 0
    })
    
    // Create content sections from lesson data
    const content: LessonContent[] = []
    
    // Add lesson introduction if available
    if (lessonData.description && lessonData.description.trim().length > 0) {
      console.log('✅ Adding introduction section')
      content.push({
        id: 'introduction',
        type: 'text',
        title: 'Introduction',
        content: `# Welcome to ${lessonData.title}\n\n${lessonData.description}\n\n## What You'll Learn\n\n${(lessonData.learningObjectives || lessonData.learningOutcomes || []).map((obj: string, i: number) => `${i + 1}. ${obj}`).join('\n')}`,
        duration: 5,
        completed: false
      })
    } else {
      console.log('⚠️ No description found, skipping introduction section')
    }
    
    if (lessonData.content?.sections) {
      console.log(`📝 Processing ${lessonData.content.sections.length} content sections`)
      lessonData.content.sections.forEach((section: any, index: number) => {
        console.log(`🔄 Processing section ${index + 1}:`, {
          title: section.title,
          hasContent: !!section.content,
          hasExamples: !!section.examples,
          exampleCount: section.examples?.length || 0
        })
        
        // Add section content with better formatting
        if (section.title) {
          let sectionContent = ''
          
          // Add section title as header
          sectionContent += `# ${section.title}\n\n`
          
          // Add section content if available
          if (section.content && section.content.trim().length > 0) {
            sectionContent += section.content + '\n\n'
          }
          
          // Add key concepts if available
          if (section.keyConcepts && Array.isArray(section.keyConcepts)) {
            sectionContent += '## Key Concepts\n\n'
            section.keyConcepts.forEach((concept: string) => {
              sectionContent += `• ${concept}\n`
            })
            sectionContent += '\n'
          }
          
          // Add AI connection if available
          if (section.aiConnection && section.aiConnection.trim().length > 0) {
            sectionContent += '## AI Connection\n\n'
            sectionContent += section.aiConnection + '\n\n'
          }
          
          // Only add if we have meaningful content
          if (sectionContent.trim().length > section.title.length + 10) {
            console.log(`✅ Adding text section: ${section.title}`)
            content.push({
              id: `section-${index}`,
              type: 'text',
              title: section.title,
              content: sectionContent.trim(),
              duration: Math.max(5, Math.ceil(sectionContent.length / 200)),
              completed: false
            })
          }
        }
        
        // Add examples as code sections
        if (section.examples && Array.isArray(section.examples)) {
          section.examples.forEach((example: any, exIndex: number) => {
            const exampleContent = example.code || example.content
            if (exampleContent && exampleContent.trim().length > 0) {
              console.log(`✅ Adding code example: ${example.title || section.title}`)
              content.push({
                id: `example-${index}-${exIndex}`,
                type: 'code',
                title: `${example.language || 'Code'} Example: ${example.title || section.title}`,
                content: exampleContent,
                duration: 3,
                completed: false
              })
            }
          })
        }
      })
    }
    
    console.log(`📚 Final lesson created with ${content.length} content sections`)
    
    return {
      id: lessonData.id,
      title: lessonData.title,
      description: lessonData.description,
      duration: lessonData.estimatedTime || 30,
      difficulty: lessonData.difficulty || 'beginner',
      category: lessonData.category || 'General',
      tags: lessonData.curriculum || [],
      videoUrl: undefined,
      content: content.length > 0 ? content : generateEnhancedFallbackContent(lessonData),
      prerequisites: lessonData.prerequisites || ['Basic React knowledge', 'JavaScript ES6'],
      learningObjectives: lessonData.learningObjectives || lessonData.learningOutcomes || [
        'Understand what React Hooks are',
        'Learn to use useState and useEffect',
        'Create custom hooks',
        'Apply hooks in real projects'
      ],
      resources: lessonData.resources || generateContextualResources(lessonData),
      quiz: lessonData.quiz || {
        id: 'quiz-1',
        questions: [
          {
            id: 'q1',
            question: 'What is the purpose of useState hook?',
            type: 'multiple-choice',
            options: [
              'To manage component state',
              'To handle side effects',
              'To create custom hooks',
              'To optimize performance'
            ],
            correctAnswer: 0,
            explanation: 'useState is used to add state to functional components.'
          }
        ],
        passingScore: 80,
        attempts: 0,
        maxAttempts: 3
      },
      completed: false,
      progress: 0,
      rating: lessonData.rating || 4.8,
      enrolledStudents: lessonData.enrolledStudents || 1250
    }
  }

  // Load lesson data based on lessonId
  useEffect(() => {
    console.log(`🚀 Starting lesson fetch for lessonId: ${lessonId}`)
    const fetchLesson = async () => {
      setIsLoading(true)
      try {
        // First try to load from data directory
        let lessonData = await loadLessonData(lessonId)
        
        // If no lesson data found, use fallback mock data
        if (!lessonData) {
          console.warn(`⚠️ No lesson data found for ID: ${lessonId}, using fallback data`)
          lessonData = {
            id: lessonId || 'react-hooks',
            title: 'Introduction to React Hooks',
            description: 'Learn the fundamentals of React Hooks including useState, useEffect, and custom hooks.',
            estimatedTime: 45,
            difficulty: 'intermediate',
            category: 'React',
            curriculum: ['React', 'Hooks', 'JavaScript', 'Frontend'],
            content: {
              sections: [
                {
                  title: 'What are React Hooks?',
                  content: 'React Hooks are functions that let you use state and other React features in functional components.'
                },
                {
                  title: 'useState Hook Demo',
                  content: 'The useState hook lets you add state to functional components. It returns a stateful value and a function to update it.',
                  examples: [
                    {
                      language: 'javascript',
                      code: 'const [count, setCount] = useState(0);\n\nreturn (\n  <div>\n    <p>You clicked {count} times</p>\n    <button onClick={() => setCount(count + 1)}>\n      Click me\n    </button>\n  </div>\n);'
                    }
                  ]
                }
              ]
            }
          }
        }
        
        // Convert lesson data to component format
        const formattedLesson = convertLessonData(lessonData)
        console.log(`🎯 Setting lesson state with formatted lesson:`, {
          id: formattedLesson.id,
          title: formattedLesson.title,
          contentCount: formattedLesson.content.length,
          hasQuiz: !!formattedLesson.quiz
        })
        
        setLesson(formattedLesson)
        console.log(`✅ Lesson successfully loaded and set for: ${lessonId}`)
      } catch (error) {
        console.error('❌ Failed to fetch lesson:', error)
      } finally {
        setIsLoading(false)
        console.log(`🏁 Lesson loading completed for: ${lessonId}`)
      }
    }

    fetchLesson()
  }, [lessonId])

  // Handle content navigation
  const goToNextContent = () => {
    if (lesson && currentContentIndex < lesson.content.length - 1) {
      setCurrentContentIndex(currentContentIndex + 1)
      updateProgress()
    }
  }

  const goToPreviousContent = () => {
    if (currentContentIndex > 0) {
      setCurrentContentIndex(currentContentIndex - 1)
    }
  }

  const updateProgress = () => {
    if (lesson) {
      const progress = Math.round(((currentContentIndex + 1) / lesson.content.length) * 100)
      onProgress?.(lessonId, progress)
      
      if (progress === 100) {
        onComplete?.(lessonId)
      }
    }
  }

  // Video controls
  const togglePlay = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause()
      } else {
        videoRef.current.play()
      }
      setIsPlaying(!isPlaying)
    }
  }

  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !isMuted
      setIsMuted(!isMuted)
    }
  }

  const toggleFullscreen = () => {
    if (containerRef.current) {
      if (!isFullscreen) {
        containerRef.current.requestFullscreen()
      } else {
        document.exitFullscreen()
      }
      setIsFullscreen(!isFullscreen)
    }
  }

  const handleSpeedChange = (speed: number) => {
    setPlaybackSpeed(speed)
    if (videoRef.current) {
      videoRef.current.playbackRate = speed
    }
  }

  const handleVolumeChange = (newVolume: number) => {
    setVolume(newVolume)
    if (videoRef.current) {
      videoRef.current.volume = newVolume
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingSpinner size="lg" text="Loading lesson..." />
      </div>
    )
  }

  if (!lesson) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <BookOpen className="w-16 h-16 text-secondary-400 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-secondary-900 mb-2">Lesson not found</h2>
          <p className="text-secondary-600">The requested lesson could not be loaded.</p>
        </div>
      </div>
    )
  }

  const currentContent = lesson.content[currentContentIndex]

  return (
    <div ref={containerRef} className="min-h-screen bg-secondary-50">
      {/* Header */}
      <div className="bg-white border-b border-secondary-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => window.history.back()}
              className="p-2 hover:bg-secondary-100 rounded-lg transition-colors"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-xl font-semibold text-secondary-900">{lesson.title}</h1>
              <div className="flex items-center space-x-4 text-sm text-secondary-600 mt-1">
                <span className="flex items-center">
                  <Clock className="w-4 h-4 mr-1" />
                  {lesson.duration} min
                </span>
                <span className="flex items-center">
                  <Target className="w-4 h-4 mr-1" />
                  {lesson.difficulty}
                </span>
                <span className="flex items-center">
                  <Star className="w-4 h-4 mr-1" />
                  {lesson.rating}
                </span>
              </div>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setIsBookmarked(!isBookmarked)}
              className={`p-2 rounded-lg transition-colors ${
                isBookmarked 
                  ? 'bg-primary-100 text-primary-600' 
                  : 'hover:bg-secondary-100 text-secondary-600'
              }`}
            >
              {isBookmarked ? <BookmarkCheck className="w-5 h-5" /> : <Bookmark className="w-5 h-5" />}
            </button>
            <button className="p-2 hover:bg-secondary-100 rounded-lg transition-colors">
              <Share2 className="w-5 h-5 text-secondary-600" />
            </button>
            <button className="p-2 hover:bg-secondary-100 rounded-lg transition-colors">
              <Download className="w-5 h-5 text-secondary-600" />
            </button>
          </div>
        </div>
        
        {/* Progress bar */}
        <div className="mt-6">
          <div className="flex justify-between text-sm font-medium text-secondary-700 mb-3">
            <span className="flex items-center gap-2">
              <Target className="w-4 h-4 text-primary-600" />
              Progress
            </span>
            <span className="bg-primary-100 text-primary-800 px-3 py-1 rounded-full text-xs font-semibold">
              {Math.round(((currentContentIndex + 1) / lesson.content.length) * 100)}%
            </span>
          </div>
          <div className="relative w-full bg-gradient-to-r from-secondary-100 to-secondary-200 rounded-full h-3 shadow-inner">
            <div 
              className="bg-gradient-to-r from-primary-500 to-primary-600 h-3 rounded-full transition-all duration-500 ease-out shadow-sm relative overflow-hidden"
              style={{ width: `${((currentContentIndex + 1) / lesson.content.length) * 100}%` }}
            >
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-pulse" />
            </div>
          </div>
        </div>
      </div>

      <div className="flex flex-1">
        {/* Main content area */}
        <div className="flex-1 p-6">
          <div className="max-w-4xl mx-auto">
            {/* Content header */}
            <div className="mb-10 pb-8 border-b border-gradient-to-r from-transparent via-secondary-200 to-transparent relative">
              <div className="absolute -top-2 left-0 w-16 h-1 bg-gradient-to-r from-primary-500 to-primary-600 rounded-full" />
              <h2 className="text-4xl font-bold bg-gradient-to-r from-secondary-900 to-secondary-700 bg-clip-text text-transparent mb-4 leading-tight">
                {currentContent.title}
              </h2>
              <div className="flex flex-wrap items-center gap-4 text-sm">
                <span className="flex items-center bg-gradient-to-r from-secondary-50 to-secondary-100 border border-secondary-200 px-4 py-2 rounded-full shadow-sm hover:shadow-md transition-shadow">
                  <Clock className="w-4 h-4 mr-2 text-secondary-600" />
                  <span className="font-medium text-secondary-700">{currentContent.duration} min read</span>
                </span>
                <span className="flex items-center bg-gradient-to-r from-primary-50 to-primary-100 border border-primary-200 text-primary-800 px-4 py-2 rounded-full capitalize font-semibold shadow-sm hover:shadow-md transition-shadow">
                  {currentContent.type === 'text' ? '📖 Reading' : currentContent.type === 'code' ? '💻 Code Example' : currentContent.type === 'video' ? '🎥 Video' : currentContent.type}
                </span>
                <span className="flex items-center bg-gradient-to-r from-success-50 to-success-100 border border-success-200 text-success-800 px-4 py-2 rounded-full font-semibold shadow-sm hover:shadow-md transition-shadow">
                  <Award className="w-4 h-4 mr-2" />
                  {currentContentIndex + 1} of {lesson.content.length}
                </span>
              </div>
            </div>

            {/* Content display */}
            <div className="bg-gradient-to-br from-white to-secondary-50/30 rounded-2xl shadow-xl border border-secondary-200/50 p-10 mb-10 min-h-[500px] backdrop-blur-sm relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-primary-100/20 to-transparent rounded-full -translate-y-16 translate-x-16" />
              <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-secondary-100/20 to-transparent rounded-full translate-y-12 -translate-x-12" />
              <div className="relative z-10">
              {currentContent.type === 'video' && (
                <div className="relative">
                  <video
                    ref={videoRef}
                    className="w-full rounded-lg"
                    poster="/api/placeholder/800/450"
                    onPlay={() => setIsPlaying(true)}
                    onPause={() => setIsPlaying(false)}
                  >
                    <source src={lesson.videoUrl} type="video/mp4" />
                    Your browser does not support the video tag.
                  </video>
                  
                  {/* Video controls */}
                  <div className="absolute bottom-4 left-4 right-4 bg-black/50 rounded-lg p-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <button onClick={togglePlay} className="text-white hover:text-primary-300">
                          {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
                        </button>
                        <button onClick={toggleMute} className="text-white hover:text-primary-300">
                          {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
                        </button>
                        <input
                          type="range"
                          min="0"
                          max="1"
                          step="0.1"
                          value={volume}
                          onChange={(e) => handleVolumeChange(parseFloat(e.target.value))}
                          className="w-20"
                        />
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <select
                          value={playbackSpeed}
                          onChange={(e) => handleSpeedChange(parseFloat(e.target.value))}
                          className="bg-transparent text-white text-sm"
                        >
                          <option value={0.5}>0.5x</option>
                          <option value={0.75}>0.75x</option>
                          <option value={1}>1x</option>
                          <option value={1.25}>1.25x</option>
                          <option value={1.5}>1.5x</option>
                          <option value={2}>2x</option>
                        </select>
                        <button onClick={toggleFullscreen} className="text-white hover:text-primary-300">
                          {isFullscreen ? <Minimize className="w-5 h-5" /> : <Maximize className="w-5 h-5" />}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}
              
              {currentContent.type === 'text' && (
                <div className="prose prose-lg max-w-none">
                  <div className="text-secondary-800 leading-relaxed space-y-6 font-medium">
                    {currentContent.content.split('\n\n').map((paragraph, index) => {
                      // Handle different content formats
                      if (paragraph.trim().startsWith('•') || paragraph.trim().startsWith('-')) {
                        // Bullet points
                        const items = paragraph.split('\n').filter(item => item.trim())
                        return (
                          <ul key={index} className="list-disc list-inside space-y-2 ml-4">
                            {items.map((item, itemIndex) => (
                              <li key={itemIndex} className="text-secondary-700">
                                {item.replace(/^[•-]\s*/, '').trim()}
                              </li>
                            ))}
                          </ul>
                        )
                      } else if (paragraph.trim().match(/^\d+\./)) {
                        // Numbered lists
                        const items = paragraph.split('\n').filter(item => item.trim())
                        return (
                          <ol key={index} className="list-decimal list-inside space-y-2 ml-4">
                            {items.map((item, itemIndex) => (
                              <li key={itemIndex} className="text-secondary-700">
                                {item.replace(/^\d+\.\s*/, '').trim()}
                              </li>
                            ))}
                          </ol>
                        )
                      } else if (paragraph.trim().startsWith('#')) {
                        // Headers
                        const level = paragraph.match(/^#+/)?.[0].length || 1
                        const text = paragraph.replace(/^#+\s*/, '')
                        const HeaderTag = `h${Math.min(level + 2, 6)}` as keyof JSX.IntrinsicElements
                        return (
                          <HeaderTag key={index} className={`font-semibold text-secondary-900 ${
                            level === 1 ? 'text-xl mb-3' : 
                            level === 2 ? 'text-lg mb-2' : 
                            'text-base mb-2'
                          }`}>
                            {text}
                          </HeaderTag>
                        )
                      } else if (paragraph.trim()) {
                        // Regular paragraphs
                        return (
                          <p key={index} className="text-secondary-800 leading-relaxed text-lg mb-4 first-letter:text-2xl first-letter:font-bold first-letter:text-primary-600">
                            {paragraph.trim()}
                          </p>
                        )
                      }
                      return null
                    })}
                  </div>
                </div>
              )}
              
              {currentContent.type === 'code' && (
                <div className="bg-gradient-to-br from-secondary-900 to-secondary-800 rounded-xl p-8 border border-secondary-700 shadow-2xl relative overflow-hidden">
                  <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-green-400 via-blue-400 to-purple-400" />
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center space-x-3">
                      <div className="p-2 bg-green-400/10 rounded-lg">
                        <Code className="w-5 h-5 text-green-400" />
                      </div>
                      <div>
                        <span className="text-green-400 text-base font-semibold block">
                          {currentContent.title.includes('Python') ? '🐍 Python' : 
                           currentContent.title.includes('JavaScript') ? '⚡ JavaScript' : 
                           currentContent.title.includes('HTML') ? '🌐 HTML' : 
                           '💻 Code Example'}
                        </span>
                        <span className="text-secondary-400 text-sm">Interactive Code Block</span>
                      </div>
                    </div>
                    <button 
                      onClick={() => navigator.clipboard.writeText(currentContent.content)}
                      className="flex items-center gap-2 bg-secondary-800 hover:bg-secondary-700 text-secondary-300 hover:text-green-400 px-4 py-2 rounded-lg transition-all duration-200 border border-secondary-600 hover:border-green-400/50"
                      title="Copy code"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                      </svg>
                      <span className="text-sm font-medium">Copy</span>
                    </button>
                  </div>
                  <div className="bg-secondary-950/50 rounded-lg p-6 border border-secondary-700/50">
                    <pre className="text-green-400 font-mono text-base overflow-x-auto leading-relaxed">
                      <code>{currentContent.content}</code>
                    </pre>
                  </div>
                </div>
              )}
              
              {currentContent.type === 'quiz' && (
                <div className="text-center py-12 px-8">
                  <div className="relative inline-block mb-6">
                    <div className="absolute inset-0 bg-gradient-to-r from-primary-400 to-primary-600 rounded-full blur-lg opacity-30 animate-pulse" />
                    <Brain className="w-20 h-20 text-primary-600 mx-auto relative z-10" />
                  </div>
                  <h3 className="text-2xl font-bold text-secondary-900 mb-3 bg-gradient-to-r from-secondary-900 to-secondary-700 bg-clip-text text-transparent">Knowledge Check</h3>
                  <p className="text-secondary-600 mb-8 text-lg max-w-md mx-auto leading-relaxed">Ready to test your understanding and reinforce what you've learned?</p>
                  <button className="bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800 text-white font-semibold px-8 py-4 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105 flex items-center gap-3 mx-auto">
                    <Award className="w-5 h-5" />
                    Start Quiz
                  </button>
                </div>
              )}
              </div>
            </div>

            {/* Navigation */}
            <div className="flex justify-between items-center bg-gradient-to-r from-secondary-50 to-secondary-100/50 rounded-2xl p-8 mt-10 border border-secondary-200/50 shadow-lg">
              <button
                onClick={goToPreviousContent}
                disabled={currentContentIndex === 0}
                className="flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-white to-secondary-50 border border-secondary-200 rounded-xl hover:from-secondary-50 hover:to-secondary-100 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:from-white disabled:hover:to-secondary-50 font-semibold text-secondary-700 shadow-md hover:shadow-lg transform hover:scale-105 disabled:transform-none"
              >
                <ChevronLeft className="w-5 h-5" />
                Previous
              </button>
              
              <div className="flex items-center space-x-3">
                {lesson.content.map((content, index) => (
                  <div key={index} className="flex flex-col items-center">
                    <button
                      onClick={() => setCurrentContentIndex(index)}
                      className={`w-4 h-4 rounded-full transition-all hover:scale-110 ${
                        index === currentContentIndex
                          ? 'bg-primary-600 ring-2 ring-primary-200'
                          : index < currentContentIndex
                          ? 'bg-success-600 hover:bg-success-700'
                          : 'bg-secondary-300 hover:bg-secondary-400'
                      }`}
                      title={content.title}
                    />
                    {index === currentContentIndex && (
                      <span className="text-xs text-secondary-600 mt-1 max-w-[80px] truncate">
                        {content.title}
                      </span>
                    )}
                  </div>
                ))}
              </div>
              
              <button
                onClick={goToNextContent}
                disabled={currentContentIndex === lesson.content.length - 1}
                className="flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-primary-600 to-primary-700 text-white rounded-xl hover:from-primary-700 hover:to-primary-800 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:from-primary-600 disabled:hover:to-primary-700 font-semibold shadow-md hover:shadow-lg transform hover:scale-105 disabled:transform-none"
              >
                Next
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="w-80 bg-gradient-to-b from-white to-secondary-50/30 border-l border-secondary-200/50 p-6 backdrop-blur-sm">
          {/* Lesson outline */}
          <div className="mb-8">
            <h3 className="font-bold text-lg text-secondary-900 mb-4 flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-primary-600" />
              Lesson Outline
            </h3>
            <div className="space-y-2">
              {lesson.content.map((content, index) => (
                <button
                  key={content.id}
                  onClick={() => setCurrentContentIndex(index)}
                  className={`w-full text-left p-4 rounded-xl transition-all duration-200 ${
                    index === currentContentIndex
                      ? 'bg-gradient-to-r from-primary-50 to-primary-100/50 border border-primary-200 shadow-md transform scale-105'
                      : 'hover:bg-gradient-to-r hover:from-secondary-50 hover:to-secondary-100/50 hover:shadow-sm hover:transform hover:scale-102'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      {content.completed ? (
                        <CheckCircle className="w-4 h-4 text-success-600" />
                      ) : (
                        <div className={`w-4 h-4 rounded-full border-2 ${
                          index === currentContentIndex
                            ? 'border-primary-600 bg-primary-600'
                            : 'border-secondary-300'
                        }`} />
                      )}
                      <span className={`text-sm ${
                        index === currentContentIndex
                          ? 'font-medium text-primary-900'
                          : 'text-secondary-700'
                      }`}>
                        {content.title}
                      </span>
                    </div>
                    <span className="text-xs text-secondary-500">
                      {content.duration}m
                    </span>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Notes section */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-lg text-secondary-900 flex items-center gap-2">
                <MessageSquare className="w-5 h-5 text-primary-600" />
                Notes
              </h3>
              <button
                onClick={() => setShowNotes(!showNotes)}
                className="text-sm text-primary-600 hover:text-primary-700"
              >
                {showNotes ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            {showNotes && (
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="✏️ Take notes while learning..."
                className="w-full h-32 p-4 border border-secondary-200 rounded-xl resize-none focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-gradient-to-br from-white to-secondary-50/30 shadow-inner transition-all duration-200 focus:shadow-md"
              />
            )}
          </div>

          {/* Resources */}
          <div>
            <h3 className="font-bold text-lg text-secondary-900 mb-4 flex items-center gap-2">
              <Download className="w-5 h-5 text-primary-600" />
              Resources
            </h3>
            <div className="space-y-2">
              {lesson.resources.map((resource) => (
                <a
                  key={resource.id}
                  href={resource.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block p-4 border border-secondary-200 rounded-xl hover:bg-gradient-to-r hover:from-secondary-50 hover:to-secondary-100/50 transition-all duration-200 hover:shadow-md hover:transform hover:scale-102 bg-gradient-to-br from-white to-secondary-50/20"
                >
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-primary-600 rounded-full" />
                    <span className="text-sm font-medium text-secondary-900">
                      {resource.title}
                    </span>
                  </div>
                  {resource.description && (
                    <p className="text-xs text-secondary-600 mt-1 ml-4">
                      {resource.description}
                    </p>
                  )}
                </a>
              ))}
            </div>
          </div>
        </div>
      </div>
      
      {/* AI Tutor Integration */}
      {showAITutor && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl h-[80vh] flex flex-col">
            <div className="flex items-center justify-between p-4 border-b border-secondary-200">
              <h3 className="text-lg font-semibold text-secondary-900 flex items-center gap-2">
                <span className="text-xl">🤖</span>
                AI Tutor
              </h3>
              <button
                onClick={() => setShowAITutor(false)}
                className="p-2 hover:bg-secondary-100 rounded-lg transition-colors text-secondary-600"
              >
                ×
              </button>
            </div>
            <div className="flex-1">
              <AITutor
                lessonId={lessonId}
                subject={lesson?.category || 'Programming'}
                lessonData={lesson}
                currentSection={lesson?.content?.[currentContentIndex]?.title || 'Overview'}
                studentLevel={user?.stats?.level && user.stats.level > 8 ? 'advanced' : user?.stats?.level && user.stats.level > 4 ? 'intermediate' : 'beginner'}
                onMinimize={() => {
                  setShowAITutor(false)
                  setAITutorMinimized(true)
                }}
                minimized={false}
                className="h-full"
              />
            </div>
          </div>
        </div>
      )}
      
      {/* Floating AI Tutor Button */}
      {aiTutorMinimized && (
        <button
          data-testid="ai-tutor-button"
          onClick={() => {
            setShowAITutor(true)
            setAITutorMinimized(false)
          }}
          className="fixed bottom-6 right-6 z-40 bg-primary-600 hover:bg-primary-700 text-white p-4 rounded-full shadow-lg transition-all duration-200 hover:scale-105"
          title="Ask AI Tutor for help"
        >
          <span className="text-2xl">🤖</span>
        </button>
      )}
    </div>
  )
}

export default LessonViewer