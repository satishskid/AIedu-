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
  
  const videoRef = useRef<HTMLVideoElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  // Mock lesson data - in real app, this would come from API
  useEffect(() => {
    const fetchLesson = async () => {
      setIsLoading(true)
      try {
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1000))
        
        const mockLesson: Lesson = {
          id: lessonId,
          title: 'Introduction to React Hooks',
          description: 'Learn the fundamentals of React Hooks including useState, useEffect, and custom hooks.',
          duration: 45,
          difficulty: 'intermediate',
          category: 'React',
          tags: ['React', 'Hooks', 'JavaScript', 'Frontend'],
          videoUrl: 'https://example.com/video.mp4',
          content: [
            {
              id: '1',
              type: 'text',
              title: 'What are React Hooks?',
              content: 'React Hooks are functions that let you use state and other React features in functional components.',
              duration: 5,
              completed: false
            },
            {
              id: '2',
              type: 'video',
              title: 'useState Hook Demo',
              content: 'Watch how to implement useState in a real component.',
              duration: 15,
              completed: false
            },
            {
              id: '3',
              type: 'code',
              title: 'Practice Exercise',
              content: 'const [count, setCount] = useState(0);\n\nfunction increment() {\n  setCount(count + 1);\n}',
              duration: 10,
              completed: false
            },
            {
              id: '4',
              type: 'quiz',
              title: 'Knowledge Check',
              content: 'Test your understanding of React Hooks.',
              duration: 15,
              completed: false
            }
          ],
          prerequisites: ['Basic React knowledge', 'JavaScript ES6'],
          learningObjectives: [
            'Understand what React Hooks are',
            'Learn to use useState and useEffect',
            'Create custom hooks',
            'Apply hooks in real projects'
          ],
          resources: [
            {
              id: '1',
              title: 'React Hooks Documentation',
              type: 'link',
              url: 'https://reactjs.org/docs/hooks-intro.html',
              description: 'Official React documentation on Hooks'
            },
            {
              id: '2',
              title: 'Code Examples',
              type: 'code',
              url: 'https://github.com/example/react-hooks-examples',
              description: 'GitHub repository with hook examples'
            }
          ],
          quiz: {
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
          rating: 4.8,
          enrolledStudents: 1250
        }
        
        setLesson(mockLesson)
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
    </div>
  )
}

export default LessonViewer