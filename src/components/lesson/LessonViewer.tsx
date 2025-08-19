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
    try {
      const lessonModule = await import(`../../data/lessons/${lessonId}.json`)
      return lessonModule.default
    } catch (error) {
      console.error(`Error loading lesson ${lessonId}:`, error)
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

  // Function to convert lesson data to component format
  const convertLessonData = (lessonData: any): Lesson => {
    // Create content sections from lesson data
    const content: LessonContent[] = []
    
    if (lessonData.content?.sections) {
      lessonData.content.sections.forEach((section: any, index: number) => {
        // Only add sections with valid content
        if (section.title && section.content && section.content.trim().length > 0) {
          content.push({
            id: `section-${index}`,
            type: 'text',
            title: section.title,
            content: section.content,
            duration: 5,
            completed: false
          })
        }
        
        // Add examples as code sections
        if (section.examples && Array.isArray(section.examples)) {
          section.examples.forEach((example: any, exIndex: number) => {
            const exampleContent = example.code || example.content
            if (exampleContent && exampleContent.trim().length > 0) {
              content.push({
                id: `example-${index}-${exIndex}`,
                type: 'code',
                title: `Example: ${example.language || 'Visual Example'}`,
                content: exampleContent,
                duration: 3,
                completed: false
              })
            }
          })
        }
        
        // Add AI connection as additional text content if available
        if (section.aiConnection && section.aiConnection.trim().length > 0) {
          content.push({
            id: `ai-connection-${index}`,
            type: 'text',
            title: 'AI Connection',
            content: section.aiConnection,
            duration: 3,
            completed: false
          })
        }
      })
    }
    
    return {
      id: lessonData.id,
      title: lessonData.title,
      description: lessonData.description,
      duration: lessonData.estimatedTime || 30,
      difficulty: lessonData.difficulty || 'beginner',
      category: lessonData.category || 'General',
      tags: lessonData.curriculum || [],
      videoUrl: undefined,
      content: content.length > 0 ? content : [
        {
          id: '1',
          type: 'text',
          title: 'Welcome to Learning!',
          content: 'This lesson is being prepared for you. Please check back soon for exciting content!',
          duration: 5,
          completed: false
        }
      ],
      prerequisites: lessonData.prerequisites || ['Basic React knowledge', 'JavaScript ES6'],
      learningObjectives: lessonData.learningObjectives || [
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
    const fetchLesson = async () => {
      setIsLoading(true)
      try {
        // First try to load from data directory
        let lessonData = await loadLessonData(lessonId)
        
        // If no lesson data found, use fallback mock data
        if (!lessonData) {
          console.warn(`No lesson data found for ID: ${lessonId}, using fallback data`)
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
        
        setLesson(formattedLesson)
      } catch (error) {
        console.error('Failed to fetch lesson:', error)
      } finally {
        setIsLoading(false)
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
        <div className="mt-4">
          <div className="flex justify-between text-sm text-secondary-600 mb-2">
            <span>Progress</span>
            <span>{Math.round(((currentContentIndex + 1) / lesson.content.length) * 100)}%</span>
          </div>
          <div className="w-full bg-secondary-200 rounded-full h-2">
            <div 
              className="bg-primary-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${((currentContentIndex + 1) / lesson.content.length) * 100}%` }}
            />
          </div>
        </div>
      </div>

      <div className="flex flex-1">
        {/* Main content area */}
        <div className="flex-1 p-6">
          <div className="max-w-4xl mx-auto">
            {/* Content header */}
            <div className="mb-6">
              <h2 className="text-2xl font-semibold text-secondary-900 mb-2">
                {currentContent.title}
              </h2>
              <div className="flex items-center space-x-4 text-sm text-secondary-600">
                <span className="flex items-center">
                  <Clock className="w-4 h-4 mr-1" />
                  {currentContent.duration} min
                </span>
                <span className="capitalize">{currentContent.type}</span>
                <span>{currentContentIndex + 1} of {lesson.content.length}</span>
              </div>
            </div>

            {/* Content display */}
            <div className="bg-white rounded-lg shadow-sm border border-secondary-200 p-6 mb-6">
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
                <div className="prose max-w-none">
                  <p className="text-secondary-700 leading-relaxed">{currentContent.content}</p>
                </div>
              )}
              
              {currentContent.type === 'code' && (
                <div className="bg-secondary-900 rounded-lg p-4">
                  <pre className="text-green-400 font-mono text-sm overflow-x-auto">
                    <code>{currentContent.content}</code>
                  </pre>
                </div>
              )}
              
              {currentContent.type === 'quiz' && (
                <div className="text-center py-8">
                  <Brain className="w-16 h-16 text-primary-600 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-secondary-900 mb-2">Knowledge Check</h3>
                  <p className="text-secondary-600 mb-4">Ready to test your understanding?</p>
                  <button className="btn btn-primary">
                    Start Quiz
                  </button>
                </div>
              )}
            </div>

            {/* Navigation */}
            <div className="flex justify-between items-center">
              <button
                onClick={goToPreviousContent}
                disabled={currentContentIndex === 0}
                className="btn btn-secondary btn-md flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronLeft className="w-4 h-4" />
                Previous
              </button>
              
              <div className="flex items-center space-x-2">
                {lesson.content.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentContentIndex(index)}
                    className={`w-3 h-3 rounded-full transition-colors ${
                      index === currentContentIndex
                        ? 'bg-primary-600'
                        : index < currentContentIndex
                        ? 'bg-success-600'
                        : 'bg-secondary-300'
                    }`}
                  />
                ))}
              </div>
              
              <button
                onClick={goToNextContent}
                disabled={currentContentIndex === lesson.content.length - 1}
                className="btn btn-primary btn-md flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="w-80 bg-white border-l border-secondary-200 p-6">
          {/* Lesson outline */}
          <div className="mb-6">
            <h3 className="font-semibold text-secondary-900 mb-3">Lesson Outline</h3>
            <div className="space-y-2">
              {lesson.content.map((content, index) => (
                <button
                  key={content.id}
                  onClick={() => setCurrentContentIndex(index)}
                  className={`w-full text-left p-3 rounded-lg transition-colors ${
                    index === currentContentIndex
                      ? 'bg-primary-50 border border-primary-200'
                      : 'hover:bg-secondary-50'
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
          <div className="mb-6">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold text-secondary-900">Notes</h3>
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
                placeholder="Take notes while learning..."
                className="w-full h-32 p-3 border border-secondary-200 rounded-lg resize-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            )}
          </div>

          {/* Resources */}
          <div>
            <h3 className="font-semibold text-secondary-900 mb-3">Resources</h3>
            <div className="space-y-2">
              {lesson.resources.map((resource) => (
                <a
                  key={resource.id}
                  href={resource.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block p-3 border border-secondary-200 rounded-lg hover:bg-secondary-50 transition-colors"
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