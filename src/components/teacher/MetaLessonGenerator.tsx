import React, { useState } from 'react'
import { 
  Loader2, 
  Wand2, 
  Download, 
  Copy, 
  RefreshCw, 
  Settings,
  Users,
  Eye,
  BookOpen,
  Target,
  Sparkles,
  Plus,
  Minus,
  Save
} from 'lucide-react'
import { enhancedAIService } from '../../services/aiModels'
import { Button } from '../ui/button'
import { Input } from '../ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select'
import { toast } from 'react-hot-toast'

interface StudentProfile {
  id: string
  name: string
  strengths: string[]
  weaknesses: string[]
  interests: string[]
  learningStyle: 'visual' | 'auditory' | 'kinesthetic' | 'mixed'
  currentLevel: 'beginner' | 'intermediate' | 'advanced'
}

interface MetaLessonRequest {
  topic: string
  gradeLevel: string
  duration: number
  learningObjectives: string[]
  aiConcepts: string[]
}

interface GeneratedLesson {
  title: string
  objectives: string[]
  activities: Array<{
    type: string
    description: string
    duration: number
    materials: string[]
  }>
  assessment: {
    questions: string[]
    rubric: string[]
  }
  adaptations: string[]
}

const MetaLessonGenerator: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'setup' | 'students' | 'generate' | 'preview'>('setup')
  const [studentProfiles, setStudentProfiles] = useState<StudentProfile[]>([])
  const [lessonRequest, setLessonRequest] = useState<MetaLessonRequest>({
    topic: '',
    gradeLevel: 'grades-6-8',
    duration: 45,
    learningObjectives: [''],
    aiConcepts: ['']
  })
  const [generatedLesson, setGeneratedLesson] = useState<GeneratedLesson | null>(null)
  const [isGenerating, setIsGenerating] = useState(false)

  const gradeLevels = [
    { value: 'k', label: 'Kindergarten' },
    { value: 'grade-1', label: 'Grade 1' },
    { value: 'grade-2', label: 'Grade 2' },
    { value: 'grade-3', label: 'Grade 3' },
    { value: 'grade-4', label: 'Grade 4' },
    { value: 'grade-5', label: 'Grade 5' },
    { value: 'grade-6', label: 'Grade 6' },
    { value: 'grade-7', label: 'Grade 7' },
    { value: 'grade-8', label: 'Grade 8' },
    { value: 'grade-9', label: 'Grade 9' },
    { value: 'grade-10', label: 'Grade 10' },
    { value: 'grades-3-5', label: 'Grades 3-5' },
    { value: 'grades-6-8', label: 'Grades 6-8' },
    { value: 'grades-9-12', label: 'Grades 9-12' }
  ]

  const learningStyles = [
    { value: 'visual', label: 'Visual Learner' },
    { value: 'auditory', label: 'Auditory Learner' },
    { value: 'kinesthetic', label: 'Kinesthetic Learner' },
    { value: 'mixed', label: 'Mixed Learning Style' }
  ]

  // Student Profile Management
  const addStudentProfile = () => {
    const newProfile: StudentProfile = {
      id: Date.now().toString(),
      name: '',
      strengths: [''],
      weaknesses: [''],
      interests: [''],
      learningStyle: 'mixed',
      currentLevel: 'intermediate'
    }
    setStudentProfiles([...studentProfiles, newProfile])
  }

  const updateStudentProfile = (id: string, updates: Partial<StudentProfile>) => {
    setStudentProfiles(profiles => 
      profiles.map(profile => 
        profile.id === id ? { ...profile, ...updates } : profile
      )
    )
  }

  const removeStudentProfile = (id: string) => {
    setStudentProfiles(profiles => profiles.filter(profile => profile.id !== id))
  }

  // Array field helpers
  const addArrayItem = (array: string[], setter: (arr: string[]) => void) => {
    setter([...array, ''])
  }

  const removeArrayItem = (array: string[], index: number, setter: (arr: string[]) => void) => {
    if (array.length > 1) {
      setter(array.filter((_, i) => i !== index))
    }
  }

  const updateArrayField = (array: string[], index: number, value: string, setter: (arr: string[]) => void) => {
    const newArray = [...array]
    newArray[index] = value
    setter(newArray)
  }

  // Get most common learning style
  const getMostCommonLearningStyle = (): 'visual' | 'auditory' | 'kinesthetic' | 'mixed' => {
    if (studentProfiles.length === 0) return 'mixed'
    
    const styleCounts = studentProfiles.reduce((acc, profile) => {
      acc[profile.learningStyle] = (acc[profile.learningStyle] || 0) + 1
      return acc
    }, {} as Record<string, number>)
    
    return Object.entries(styleCounts).reduce((a, b) => 
      styleCounts[a[0]] > styleCounts[b[0]] ? a : b
    )[0] as 'visual' | 'auditory' | 'kinesthetic' | 'mixed'
  }

  const generateLesson = async () => {
    if (!lessonRequest.topic.trim()) {
      toast.error('Please provide a lesson topic')
      return
    }

    setIsGenerating(true)
    try {
      // Create a combined student profile for the AI
      const combinedProfile = {
        strengths: [...new Set(studentProfiles.flatMap(p => p.strengths.filter(s => s.trim())))],
        weaknesses: [...new Set(studentProfiles.flatMap(p => p.weaknesses.filter(w => w.trim())))],
        interests: [...new Set(studentProfiles.flatMap(p => p.interests.filter(i => i.trim())))],
        learningStyle: getMostCommonLearningStyle()
      }

      const lesson = await enhancedAIService.generateMetaLesson(
        lessonRequest.topic,
        lessonRequest.gradeLevel,
        combinedProfile
      )
      
      setGeneratedLesson(lesson)
      setActiveTab('preview')
      toast.success('Lesson generated successfully!')
    } catch (error) {
      console.error('Failed to generate lesson:', error)
      toast.error('Failed to generate lesson. Please try again.')
    } finally {
      setIsGenerating(false)
    }
  }

  const saveLesson = () => {
    if (!generatedLesson) return
    
    // In a real app, this would save to a database
    const savedLessons = JSON.parse(localStorage.getItem('savedLessons') || '[]')
    savedLessons.push({
      ...generatedLesson,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
      topic: lessonRequest.topic,
      gradeLevel: lessonRequest.gradeLevel
    })
    localStorage.setItem('savedLessons', JSON.stringify(savedLessons))
    toast.success('Lesson saved successfully!')
  }

  const exportLesson = () => {
    if (!generatedLesson) return
    
    const dataStr = JSON.stringify(generatedLesson, null, 2)
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr)
    
    const exportFileDefaultName = `${lessonRequest.topic.replace(/\s+/g, '-')}-lesson.json`
    
    const linkElement = document.createElement('a')
    linkElement.setAttribute('href', dataUri)
    linkElement.setAttribute('download', exportFileDefaultName)
    linkElement.click()
    
    toast.success('Lesson exported successfully!')
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    toast.success('Copied to clipboard!')
  }

  return (
    <div className="max-w-6xl mx-auto p-6 bg-white rounded-lg shadow-lg">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center space-x-3">
          <div className="p-3 bg-purple-100 rounded-lg">
            <Wand2 className="w-8 h-8 text-purple-600" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">AI Meta-Lesson Generator</h1>
            <p className="text-gray-600">Create personalized lessons using AI for your students</p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <span className="text-sm text-gray-500">{studentProfiles.length} students</span>
          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex space-x-1 mb-8 bg-gray-100 p-1 rounded-lg">
        {[
          { id: 'setup', label: 'Lesson Setup', icon: Settings },
          { id: 'students', label: 'Student Profiles', icon: Users },
          { id: 'generate', label: 'Generate', icon: Wand2 },
          { id: 'preview', label: 'Preview', icon: Eye }
        ].map(tab => {
          const Icon = tab.icon
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center space-x-2 px-4 py-2 rounded-md transition-colors ${
                activeTab === tab.id
                  ? 'bg-white text-purple-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          )
        })}
      </div>

      {/* Tab Content */}
      <div className="min-h-96">
        {/* Setup Tab */}
        {activeTab === 'setup' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Basic Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                  <BookOpen className="w-5 h-5 mr-2" />
                  Basic Information
                </h3>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Lesson Topic *
                  </label>
                  <Input
                    value={lessonRequest.topic}
                    onChange={(e) => setLessonRequest({...lessonRequest, topic: e.target.value})}
                    placeholder="e.g., Introduction to Python Variables"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Grade Level
                  </label>
                  <Select
                    value={lessonRequest.gradeLevel}
                    onValueChange={(value) => setLessonRequest({...lessonRequest, gradeLevel: value})}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {gradeLevels.map(level => (
                        <SelectItem key={level.value} value={level.value}>
                          {level.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Duration (minutes)
                  </label>
                  <Input
                    type="number"
                    value={lessonRequest.duration}
                    onChange={(e) => setLessonRequest({...lessonRequest, duration: parseInt(e.target.value) || 45})}
                    min="15"
                    max="180"
                  />
                </div>
              </div>

              {/* Learning Objectives */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                  <Target className="w-5 h-5 mr-2" />
                  Learning Objectives
                </h3>
                
                {lessonRequest.learningObjectives.map((objective, index) => (
                  <div key={index} className="flex items-center space-x-2">
                    <Input
                      value={objective}
                      onChange={(e) => updateArrayField(
                        lessonRequest.learningObjectives,
                        index,
                        e.target.value,
                        (arr) => setLessonRequest({...lessonRequest, learningObjectives: arr})
                      )}
                      placeholder="e.g., Students will understand variable assignment"
                    />
                    {lessonRequest.learningObjectives.length > 1 && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => removeArrayItem(
                          lessonRequest.learningObjectives,
                          index,
                          (arr) => setLessonRequest({...lessonRequest, learningObjectives: arr})
                        )}
                      >
                        <Minus className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                ))}
                
                <Button
                  variant="outline"
                  onClick={() => addArrayItem(
                    lessonRequest.learningObjectives,
                    (arr) => setLessonRequest({...lessonRequest, learningObjectives: arr})
                  )}
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add Objective
                </Button>
              </div>
            </div>

            {/* AI Concepts */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                <Sparkles className="w-5 h-5 mr-2" />
                AI Concepts to Include
              </h3>
              
              {lessonRequest.aiConcepts.map((concept, index) => (
                <div key={index} className="flex items-center space-x-2">
                  <Input
                    value={concept}
                    onChange={(e) => updateArrayField(
                      lessonRequest.aiConcepts,
                      index,
                      e.target.value,
                      (arr) => setLessonRequest({...lessonRequest, aiConcepts: arr})
                    )}
                    placeholder="e.g., Pattern recognition, Machine learning basics"
                  />
                  {lessonRequest.aiConcepts.length > 1 && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => removeArrayItem(
                        lessonRequest.aiConcepts,
                        index,
                        (arr) => setLessonRequest({...lessonRequest, aiConcepts: arr})
                      )}
                    >
                      <Minus className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              ))}
              
              <Button
                variant="outline"
                onClick={() => addArrayItem(
                  lessonRequest.aiConcepts,
                  (arr) => setLessonRequest({...lessonRequest, aiConcepts: arr})
                )}
              >
                <Plus className="w-4 h-4 mr-2" />
                Add AI Concept
              </Button>
            </div>
          </div>
        )}

        {/* Students Tab */}
        {activeTab === 'students' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                <Users className="w-5 h-5 mr-2" />
                Student Profiles ({studentProfiles.length})
              </h3>
              <Button onClick={addStudentProfile}>
                <Plus className="w-4 h-4 mr-2" />
                Add Student
              </Button>
            </div>

            {studentProfiles.length === 0 ? (
              <div className="text-center py-12 bg-gray-50 rounded-lg">
                <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h4 className="text-lg font-medium text-gray-900 mb-2">No Student Profiles</h4>
                <p className="text-gray-600 mb-4">Add student profiles to personalize the lesson generation</p>
                <Button onClick={addStudentProfile}>
                  Add First Student
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {studentProfiles.map((profile, profileIndex) => (
                  <Card key={profile.id}>
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <CardTitle>Student {profileIndex + 1}</CardTitle>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => removeStudentProfile(profile.id)}
                        >
                          <Minus className="w-4 h-4" />
                        </Button>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Name
                          </label>
                          <Input
                            value={profile.name}
                            onChange={(e) => updateStudentProfile(profile.id, { name: e.target.value })}
                            placeholder="Student name"
                          />
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Learning Style
                          </label>
                          <Select
                            value={profile.learningStyle}
                            onValueChange={(value: any) => updateStudentProfile(profile.id, { learningStyle: value })}
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {learningStyles.map(style => (
                                <SelectItem key={style.value} value={style.value}>
                                  {style.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Current Level
                        </label>
                        <Select
                          value={profile.currentLevel}
                          onValueChange={(value: any) => updateStudentProfile(profile.id, { currentLevel: value })}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="beginner">Beginner</SelectItem>
                            <SelectItem value="intermediate">Intermediate</SelectItem>
                            <SelectItem value="advanced">Advanced</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      
                      {/* Strengths */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Strengths
                        </label>
                        {profile.strengths.map((strength, index) => (
                          <div key={index} className="flex items-center space-x-2 mb-2">
                            <Input
                              value={strength}
                              onChange={(e) => {
                                const newStrengths = [...profile.strengths]
                                newStrengths[index] = e.target.value
                                updateStudentProfile(profile.id, { strengths: newStrengths })
                              }}
                              placeholder="e.g., Good at problem solving"
                              className="text-sm"
                            />
                            {profile.strengths.length > 1 && (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                  const newStrengths = profile.strengths.filter((_, i) => i !== index)
                                  updateStudentProfile(profile.id, { strengths: newStrengths })
                                }}
                              >
                                <Minus className="w-3 h-3" />
                              </Button>
                            )}
                          </div>
                        ))}
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => updateStudentProfile(profile.id, { strengths: [...profile.strengths, ''] })}
                        >
                          + Add Strength
                        </Button>
                      </div>
                      
                      {/* Interests */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Interests
                        </label>
                        {profile.interests.map((interest, index) => (
                          <div key={index} className="flex items-center space-x-2 mb-2">
                            <Input
                              value={interest}
                              onChange={(e) => {
                                const newInterests = [...profile.interests]
                                newInterests[index] = e.target.value
                                updateStudentProfile(profile.id, { interests: newInterests })
                              }}
                              placeholder="e.g., Video games, robotics"
                              className="text-sm"
                            />
                            {profile.interests.length > 1 && (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                  const newInterests = profile.interests.filter((_, i) => i !== index)
                                  updateStudentProfile(profile.id, { interests: newInterests })
                                }}
                              >
                                <Minus className="w-3 h-3" />
                              </Button>
                            )}
                          </div>
                        ))}
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => updateStudentProfile(profile.id, { interests: [...profile.interests, ''] })}
                        >
                          + Add Interest
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Generate Tab */}
        {activeTab === 'generate' && (
          <div className="space-y-6">
            <div className="text-center">
              <div className="p-6 bg-gradient-to-br from-purple-50 to-blue-50 rounded-lg">
                <Wand2 className="w-16 h-16 text-purple-600 mx-auto mb-4" />
                <h3 className="text-2xl font-bold text-gray-900 mb-2">Ready to Generate Your Lesson?</h3>
                <p className="text-gray-600 mb-6">
                  AI will create a personalized lesson based on your topic, student profiles, and preferences.
                </p>
                
                {/* Summary */}
                <div className="bg-white p-4 rounded-lg mb-6 text-left">
                  <h4 className="font-semibold text-gray-900 mb-3">Lesson Summary</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="font-medium text-gray-700">Topic:</span>
                      <span className="ml-2 text-gray-600">{lessonRequest.topic || 'Not specified'}</span>
                    </div>
                    <div>
                      <span className="font-medium text-gray-700">Grade:</span>
                      <span className="ml-2 text-gray-600">{lessonRequest.gradeLevel}</span>
                    </div>
                    <div>
                      <span className="font-medium text-gray-700">Duration:</span>
                      <span className="ml-2 text-gray-600">{lessonRequest.duration} minutes</span>
                    </div>
                    <div>
                      <span className="font-medium text-gray-700">Students:</span>
                      <span className="ml-2 text-gray-600">{studentProfiles.length} profiles</span>
                    </div>
                  </div>
                </div>
                
                <Button
                  onClick={generateLesson}
                  disabled={isGenerating || !lessonRequest.topic.trim()}
                  size="lg"
                >
                  {isGenerating ? (
                    <>
                      <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                      Generating Lesson...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-5 h-5 mr-2" />
                      Generate AI Lesson
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Preview Tab */}
        {activeTab === 'preview' && (
          <div className="space-y-6">
            {generatedLesson ? (
              <>
                <div className="flex items-center justify-between">
                  <h3 className="text-2xl font-bold text-gray-900">{generatedLesson.title}</h3>
                  <div className="flex items-center space-x-2">
                    <Button onClick={saveLesson} variant="outline">
                      <Save className="w-4 h-4 mr-2" />
                      Save
                    </Button>
                    <Button onClick={exportLesson} variant="outline">
                      <Download className="w-4 h-4 mr-2" />
                      Export
                    </Button>
                  </div>
                </div>

                {/* Learning Objectives */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Target className="w-5 h-5 mr-2" />
                      Learning Objectives
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      {generatedLesson.objectives.map((objective, index) => (
                        <li key={index} className="flex items-start space-x-2">
                          <span className="text-blue-600 font-medium">•</span>
                          <span>{objective}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>

                {/* Activities */}
                <Card>
                  <CardHeader>
                    <CardTitle>Learning Activities</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {generatedLesson.activities.map((activity, index) => (
                        <div key={index} className="border rounded-lg p-4">
                          <div className="flex items-center justify-between mb-2">
                            <h5 className="font-medium capitalize">{activity.type}</h5>
                            <span className="text-sm text-gray-500">{activity.duration} min</span>
                          </div>
                          <p className="text-gray-700 mb-3">{activity.description}</p>
                          {activity.materials.length > 0 && (
                            <div>
                              <span className="text-sm font-medium text-gray-600">Materials: </span>
                              <span className="text-sm text-gray-500">{activity.materials.join(', ')}</span>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Assessment */}
                <Card>
                  <CardHeader>
                    <CardTitle>Assessment</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div>
                        <h5 className="font-medium mb-2">Assessment Questions</h5>
                        <ol className="list-decimal list-inside space-y-2">
                          {generatedLesson.assessment.questions.map((question, index) => (
                            <li key={index}>{question}</li>
                          ))}
                        </ol>
                      </div>
                      
                      <div>
                        <h5 className="font-medium mb-2">Rubric Criteria</h5>
                        <ul className="space-y-2">
                          {generatedLesson.assessment.rubric.map((criterion, index) => (
                            <li key={index} className="flex items-start space-x-2">
                              <span className="text-green-600 font-medium">✓</span>
                              <span>{criterion}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Adaptations */}
                <Card>
                  <CardHeader>
                    <CardTitle>Adaptations & Differentiation</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      {generatedLesson.adaptations.map((adaptation, index) => (
                        <li key={index} className="flex items-start space-x-2">
                          <span className="text-orange-600 font-medium">💡</span>
                          <span>{adaptation}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              </>
            ) : (
              <div className="text-center py-12">
                <Eye className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h4 className="text-lg font-medium text-gray-900 mb-2">No Lesson Generated</h4>
                <p className="text-gray-600 mb-4">Generate a lesson to see the preview here</p>
                <Button onClick={() => setActiveTab('generate')}>
                  Go to Generate
                </Button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

export default MetaLessonGenerator