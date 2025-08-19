import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import {
  BookOpen,
  Clock,
  Star,
  Target,
  Users,
  ChevronRight,
  Filter,
  Search,
  Play,
  CheckCircle,
  Award,
  Brain,
  Code,
  Zap
} from 'lucide-react'
import { LoadingSpinner } from '../common/LoadingSpinner'

interface Lesson {
  id: string
  title: string
  description: string
  gradeLevel: string
  difficulty: 'beginner' | 'intermediate' | 'advanced'
  duration: number
  category: string
  rating: number
  enrolledStudents: number
  completed: boolean
  progress?: number
  aiConcepts: string[]
  thumbnail?: string
}

interface GradeGroup {
  id: string
  label: string
  description: string
  grades: string[]
  color: string
  icon: React.ComponentType<{ className?: string }>
}

const gradeGroups: GradeGroup[] = [
  {
    id: 'k-2',
    label: 'K-2',
    description: 'Early Elementary - Play-based learning with smart helpers',
    grades: ['K', '1', '2'],
    color: 'bg-green-100 text-green-800 border-green-200',
    icon: Play
  },
  {
    id: '3-5',
    label: '3-5',
    description: 'Late Elementary - Block programming and AI applications',
    grades: ['3', '4', '5'],
    color: 'bg-blue-100 text-blue-800 border-blue-200',
    icon: Code
  },
  {
    id: '6-8',
    label: '6-8',
    description: 'Middle School - Computational thinking and AI ethics',
    grades: ['6', '7', '8'],
    color: 'bg-purple-100 text-purple-800 border-purple-200',
    icon: Brain
  },
  {
    id: '9-12',
    label: '9-12',
    description: 'High School - Advanced programming and machine learning',
    grades: ['9', '10', '11', '12'],
    color: 'bg-orange-100 text-orange-800 border-orange-200',
    icon: Zap
  }
]

export const LessonCatalog: React.FC = () => {
  const [lessons, setLessons] = useState<Lesson[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [selectedGradeGroup, setSelectedGradeGroup] = useState<string>('all')
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('all')
  const [selectedCategory, setSelectedCategory] = useState<string>('all')

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

  // Function to map grade to grade level
  const mapGradeToLevel = (grade: string): string => {
    if (grade === 'K-2' || grade.includes('K') || grade === '1' || grade === '2') return 'K-2'
    if (grade === '3' || grade === '4' || grade === '5') return '3-5'
    if (grade === '6' || grade === '7' || grade === '8') return '6-8'
    if (grade === '9' || grade === '10' || grade === '11' || grade === '12') return '9-12'
    return grade
  }

  // Function to extract AI concepts from lesson content
  const extractAIConcepts = (lessonData: any): string[] => {
    if (lessonData.aiIntegration?.concepts) {
      return lessonData.aiIntegration.concepts.slice(0, 3) // Take first 3 concepts
    }
    return ['AI concepts', 'Problem solving', 'Critical thinking']
  }

  // Function to map category to display name
  const mapCategory = (category: string): string => {
    const categoryMap: { [key: string]: string } = {
      'ai-awareness': 'AI Basics',
      'block-programming': 'Programming',
      'computational-thinking': 'Computational Thinking',
      'data-structures-ethics': 'Data Science',
      'fundamentals': 'Programming',
      'machine-learning': 'Machine Learning'
    }
    return categoryMap[category] || category
  }

  useEffect(() => {
    const loadLessons = async () => {
      setIsLoading(true)
      
      // List of available lesson files
      const lessonIds = [
        'k2-smart-helpers-around-us',
        'smart-helpers',
        'grade-3-block-programming-ai',
        'block-programming-ai',
        'grade-6-intro-computational-thinking',
        'computational-thinking-ai-ethics',
        'grade-7-data-structures-ai-ethics',
        'grade-9-python-fundamentals',
        'variables-and-data-types',
        'control-structures',
        'intro-to-programming',
        'grade-10-machine-learning-intro',
        'grade-10-machine-learning-projects'
      ]
      
      const loadedLessons: Lesson[] = []
      
      for (const lessonId of lessonIds) {
        const lessonData = await loadLessonData(lessonId)
        if (lessonData) {
          const lesson: Lesson = {
            id: lessonData.id,
            title: lessonData.title,
            description: lessonData.description,
            gradeLevel: mapGradeToLevel(lessonData.grade || 'K-2'),
            difficulty: lessonData.difficulty || 'beginner',
            duration: lessonData.estimatedTime || 30,
            category: mapCategory(lessonData.category || 'fundamentals'),
            rating: 4.5 + Math.random() * 0.5, // Random rating between 4.5-5.0
            enrolledStudents: Math.floor(Math.random() * 300) + 50, // Random 50-350
            completed: Math.random() > 0.7, // 30% chance of being completed
            progress: Math.random() > 0.5 ? Math.floor(Math.random() * 100) : 0,
            aiConcepts: extractAIConcepts(lessonData)
          }
          loadedLessons.push(lesson)
        }
      }
      
      setLessons(loadedLessons)
      setIsLoading(false)
    }

    loadLessons()
  }, [])

  const filteredLessons = lessons.filter(lesson => {
    const matchesGrade = selectedGradeGroup === 'all' || lesson.gradeLevel === selectedGradeGroup
    const matchesSearch = lesson.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         lesson.description.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesDifficulty = selectedDifficulty === 'all' || lesson.difficulty === selectedDifficulty
    const matchesCategory = selectedCategory === 'all' || lesson.category === selectedCategory
    
    return matchesGrade && matchesSearch && matchesDifficulty && matchesCategory
  })

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner': return 'bg-green-100 text-green-800'
      case 'intermediate': return 'bg-yellow-100 text-yellow-800'
      case 'advanced': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getProgressColor = (progress: number) => {
    if (progress === 100) return 'bg-green-500'
    if (progress > 0) return 'bg-blue-500'
    return 'bg-gray-300'
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingSpinner size="lg" text="Loading lessons..." />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Lesson Catalog
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Explore AI and programming lessons organized by grade levels
          </p>
        </div>

        {/* Grade Level Groups */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <button
            onClick={() => setSelectedGradeGroup('all')}
            className={`p-4 rounded-lg border-2 transition-all ${
              selectedGradeGroup === 'all'
                ? 'bg-gray-100 text-gray-800 border-gray-300 ring-2 ring-gray-400'
                : 'bg-white text-gray-600 border-gray-200 hover:border-gray-300'
            }`}
          >
            <div className="flex items-center justify-center mb-2">
              <BookOpen className="w-6 h-6" />
            </div>
            <h3 className="font-semibold text-lg">All Grades</h3>
            <p className="text-sm opacity-75">View all lessons</p>
          </button>
          
          {gradeGroups.map((group) => {
            const Icon = group.icon
            return (
              <button
                key={group.id}
                onClick={() => setSelectedGradeGroup(group.label)}
                className={`p-4 rounded-lg border-2 transition-all ${
                  selectedGradeGroup === group.label
                    ? `${group.color} ring-2 ring-opacity-50`
                    : 'bg-white text-gray-600 border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center justify-center mb-2">
                  <Icon className="w-6 h-6" />
                </div>
                <h3 className="font-semibold text-lg">Grades {group.label}</h3>
                <p className="text-sm opacity-75">{group.description}</p>
              </button>
            )
          })}
        </div>

        {/* Filters */}
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 mb-6 shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search lessons..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
              />
            </div>

            {/* Difficulty Filter */}
            <select
              value={selectedDifficulty}
              onChange={(e) => setSelectedDifficulty(e.target.value)}
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
            >
              <option value="all">All Difficulties</option>
              <option value="beginner">Beginner</option>
              <option value="intermediate">Intermediate</option>
              <option value="advanced">Advanced</option>
            </select>

            {/* Category Filter */}
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
            >
              <option value="all">All Categories</option>
              <option value="AI Basics">AI Basics</option>
              <option value="Programming">Programming</option>
              <option value="Computational Thinking">Computational Thinking</option>
              <option value="Data Science">Data Science</option>
              <option value="Machine Learning">Machine Learning</option>
            </select>

            {/* Results Count */}
            <div className="flex items-center text-gray-600 dark:text-gray-400">
              <Filter className="w-4 h-4 mr-2" />
              {filteredLessons.length} lesson{filteredLessons.length !== 1 ? 's' : ''} found
            </div>
          </div>
        </div>

        {/* Lessons Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredLessons.map((lesson) => (
            <Link
              key={lesson.id}
              to={`/app/lesson/${lesson.id}`}
              className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 hover:shadow-md transition-all duration-200 overflow-hidden group"
            >
              {/* Lesson Header */}
              <div className="p-6">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center space-x-2">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      gradeGroups.find(g => g.label === lesson.gradeLevel)?.color || 'bg-gray-100 text-gray-800'
                    }`}>
                      Grade {lesson.gradeLevel}
                    </span>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getDifficultyColor(lesson.difficulty)}`}>
                      {lesson.difficulty}
                    </span>
                  </div>
                  {lesson.completed && (
                    <CheckCircle className="w-5 h-5 text-green-500" />
                  )}
                </div>

                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                  {lesson.title}
                </h3>
                
                <p className="text-gray-600 dark:text-gray-400 text-sm mb-4 line-clamp-2">
                  {lesson.description}
                </p>

                {/* AI Concepts */}
                <div className="flex flex-wrap gap-1 mb-4">
                  {lesson.aiConcepts.slice(0, 2).map((concept, index) => (
                    <span
                      key={index}
                      className="px-2 py-1 bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 text-xs rounded"
                    >
                      {concept}
                    </span>
                  ))}
                  {lesson.aiConcepts.length > 2 && (
                    <span className="px-2 py-1 bg-gray-50 dark:bg-gray-700 text-gray-600 dark:text-gray-400 text-xs rounded">
                      +{lesson.aiConcepts.length - 2} more
                    </span>
                  )}
                </div>

                {/* Progress Bar */}
                {lesson.progress !== undefined && lesson.progress > 0 && (
                  <div className="mb-4">
                    <div className="flex items-center justify-between text-sm mb-1">
                      <span className="text-gray-600 dark:text-gray-400">Progress</span>
                      <span className="text-gray-900 dark:text-white font-medium">{lesson.progress}%</span>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full transition-all duration-300 ${getProgressColor(lesson.progress)}`}
                        style={{ width: `${lesson.progress}%` }}
                      />
                    </div>
                  </div>
                )}

                {/* Lesson Stats */}
                <div className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-400">
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-1">
                      <Clock className="w-4 h-4" />
                      <span>{lesson.duration} min</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Users className="w-4 h-4" />
                      <span>{lesson.enrolledStudents}</span>
                    </div>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Star className="w-4 h-4 text-yellow-500" />
                    <span className="font-medium">{lesson.rating}</span>
                  </div>
                </div>
              </div>

              {/* Action Footer */}
              <div className="px-6 py-4 bg-gray-50 dark:bg-gray-700/50 border-t border-gray-200 dark:border-gray-600">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    {lesson.category}
                  </span>
                  <div className="flex items-center text-blue-600 dark:text-blue-400 group-hover:translate-x-1 transition-transform">
                    <span className="text-sm font-medium mr-1">
                      {lesson.completed ? 'Review' : lesson.progress && lesson.progress > 0 ? 'Continue' : 'Start'}
                    </span>
                    <ChevronRight className="w-4 h-4" />
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* Empty State */}
        {filteredLessons.length === 0 && (
          <div className="text-center py-12">
            <BookOpen className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              No lessons found
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Try adjusting your filters or search terms
            </p>
            <button
              onClick={() => {
                setSelectedGradeGroup('all')
                setSearchTerm('')
                setSelectedDifficulty('all')
                setSelectedCategory('all')
              }}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Clear Filters
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

export default LessonCatalog