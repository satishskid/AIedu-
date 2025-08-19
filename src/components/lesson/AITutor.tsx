import React, { useState, useEffect, useRef, useCallback } from 'react'
import {
  MessageSquare,
  Send,
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  Bot,
  User,
  Lightbulb,
  BookOpen,
  Code,
  HelpCircle,
  ThumbsUp,
  ThumbsDown,
  RefreshCw,
  Settings,
  Minimize,
  Maximize,
  Copy,
  Download,
  Star,
  Brain,
  Target,
  TrendingUp,
  Clock,
  Award,
  Zap,
  CheckCircle,
  AlertCircle,
  Loader2,
  Sparkles,
  MessageCircle,
  FileText,
  Image,
  Link
} from 'lucide-react'
import { useAuthStore } from '../../store/authStore'
import { useLicenseStore } from '../../store/licenseStore'
import { LoadingSpinner } from '../common/LoadingSpinner'
import { enhancedAIService } from '../../services/aiModels'
import { AIContext } from '../../services/ai'

interface Message {
  id: string
  type: 'user' | 'ai'
  content: string
  timestamp: Date
  attachments?: Attachment[]
  feedback?: 'positive' | 'negative'
  suggestions?: string[]
  codeSnippet?: string
  relatedTopics?: string[]
}

interface Attachment {
  id: string
  type: 'image' | 'code' | 'link' | 'file'
  name: string
  url: string
  size?: number
}

interface AITutorProps {
  lessonId?: string
  exerciseId?: string
  studentLevel?: 'beginner' | 'intermediate' | 'advanced'
  subject?: string
  lessonData?: any // Current lesson content and metadata
  currentSection?: string // Current section being viewed
  onHelpRequest?: (topic: string) => void
  onCodeAssistance?: (code: string) => void
  className?: string
  minimized?: boolean
  onMinimize?: () => void
}

interface TutorPersonality {
  name: string
  avatar: string
  style: 'friendly' | 'professional' | 'encouraging' | 'technical'
  specialties: string[]
}

interface LearningInsight {
  id: string
  type: 'strength' | 'weakness' | 'suggestion' | 'achievement'
  title: string
  description: string
  actionable: boolean
  priority: 'low' | 'medium' | 'high'
}

export const AITutor: React.FC<AITutorProps> = ({
  lessonId,
  exerciseId,
  studentLevel = 'beginner',
  subject = 'programming',
  lessonData,
  currentSection,
  onHelpRequest,
  onCodeAssistance,
  className = '',
  minimized = false,
  onMinimize
}) => {
  const { user } = useAuthStore()
  const { licenseInfo } = useLicenseStore()
  
  const [messages, setMessages] = useState<Message[]>([])
  const [inputMessage, setInputMessage] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const [isListening, setIsListening] = useState(false)
  const [isSpeaking, setIsSpeaking] = useState(false)
  const [voiceEnabled, setVoiceEnabled] = useState(false)
  const [tutorPersonality, setTutorPersonality] = useState<TutorPersonality>({
    name: 'Alex',
    avatar: '🤖',
    style: 'friendly',
    specialties: ['JavaScript', 'React', 'Python']
  })
  const [showInsights, setShowInsights] = useState(false)
  const [insights, setInsights] = useState<LearningInsight[]>([])
  const [quickActions, setQuickActions] = useState<string[]>([
    'Explain this concept',
    'Show me an example',
    'Help with debugging',
    'Suggest practice exercises'
  ])
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [attachments, setAttachments] = useState<Attachment[]>([])
  
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Initialize with welcome message
  useEffect(() => {
    const welcomeMessage: Message = {
      id: 'welcome',
      type: 'ai',
      content: `Hi ${user?.name || 'there'}! I'm ${tutorPersonality.name}, your AI tutor. I'm here to help you learn ${subject}. What would you like to work on today?`,
      timestamp: new Date(),
      suggestions: quickActions
    }
    setMessages([welcomeMessage])
    
    // Generate initial insights
    generateLearningInsights()
  }, [user, tutorPersonality.name, subject])

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // Generate learning insights
  const generateLearningInsights = useCallback(() => {
    const mockInsights: LearningInsight[] = [
      {
        id: '1',
        type: 'strength',
        title: 'Strong Problem Solving',
        description: 'You consistently break down complex problems into smaller steps.',
        actionable: false,
        priority: 'low'
      },
      {
        id: '2',
        type: 'weakness',
        title: 'Array Methods Practice Needed',
        description: 'Consider practicing more with map(), filter(), and reduce() methods.',
        actionable: true,
        priority: 'medium'
      },
      {
        id: '3',
        type: 'suggestion',
        title: 'Try Advanced Concepts',
        description: 'You\'re ready to explore async/await and Promise handling.',
        actionable: true,
        priority: 'high'
      },
      {
        id: '4',
        type: 'achievement',
        title: 'Completed 5 Lessons This Week',
        description: 'Great consistency! Keep up the excellent learning pace.',
        actionable: false,
        priority: 'low'
      }
    ]
    setInsights(mockInsights)
  }, [])

  // Send message
  const sendMessage = async () => {
    if (!inputMessage.trim() && attachments.length === 0) return
    
    const userMessage: Message = {
      id: Date.now().toString(),
      type: 'user',
      content: inputMessage,
      timestamp: new Date(),
      attachments: attachments.length > 0 ? [...attachments] : undefined
    }
    
    const currentMessage = inputMessage
    setMessages(prev => [...prev, userMessage])
    setInputMessage('')
    setAttachments([])
    setIsTyping(true)
    
    try {
      // Generate AI response
      const aiResponse = await generateAIResponse(currentMessage)
      setMessages(prev => [...prev, aiResponse])
      
      // Text-to-speech if enabled
      if (voiceEnabled && 'speechSynthesis' in window) {
        speakMessage(aiResponse.content)
      }
    } catch (error) {
      console.error('Failed to get AI response:', error)
      const errorMessage: Message = {
        id: Date.now().toString(),
        type: 'ai',
        content: "I'm sorry, I'm having trouble responding right now. Please try again.",
        timestamp: new Date()
      }
      setMessages(prev => [...prev, errorMessage])
    } finally {
      setIsTyping(false)
    }
  }

  // Generate AI response using enhanced AI service with lesson context
  const generateAIResponse = async (userInput: string): Promise<Message> => {
    try {
      // Build comprehensive AI context with lesson data
      const aiContext: AIContext = {
        userId: user?.id || 'anonymous',
        sessionId: Date.now().toString(),
        lessonId,
        codeContext: {
          language: lessonData?.programmingLanguage || 'javascript',
          code: '', // Could include current code context
        },
        userProfile: {
          level: studentLevel,
          preferences: lessonData?.tags || [],
          learningGoals: lessonData?.learningObjectives || []
        }
      }

      // Create contextual prompt based on lesson content
      let contextualMessage = userInput
      if (lessonData) {
        const lessonContext = `\n\nCurrent Lesson Context:\n- Title: ${lessonData.title}\n- Category: ${lessonData.category}\n- Grade Level: ${lessonData.grade}\n- Current Section: ${currentSection || 'General'}\n- Learning Objectives: ${lessonData.learningObjectives?.join(', ') || 'N/A'}`
        contextualMessage = userInput + lessonContext
      }

      // Make request to enhanced AI service
      const aiResponse = await enhancedAIService.generateTutorResponse({
        message: contextualMessage,
        context: aiContext,
        options: {
          includeCodeSuggestions: lessonData?.curriculum?.includes('Programming') || lessonData?.curriculum?.includes('Python'),
          includeExplanations: true,
          includeExamples: true,
          maxTokens: 512,
          temperature: 0.7
        }
      })

      // Generate lesson-specific suggestions
      const lessonSpecificSuggestions = generateLessonSuggestions(lessonData, currentSection)
      const combinedSuggestions = [...(aiResponse.suggestions?.map(s => s.title) || []), ...lessonSpecificSuggestions]

      // Convert AI response to Message format
      return {
        id: aiResponse.message.id,
        type: 'ai',
        content: aiResponse.message.content,
        timestamp: new Date(),
        codeSnippet: aiResponse.codeSnippets?.[0]?.code,
        suggestions: combinedSuggestions.slice(0, 4), // Limit to 4 suggestions
        relatedTopics: aiResponse.resources?.map(r => r.title)
      }
    } catch (error) {
      console.error('AI response generation failed:', error)
      // Fallback to contextual response based on lesson data
      return generateFallbackResponse(userInput, lessonData, currentSection)
    }
  }

  // Generate lesson-specific suggestions
  const generateLessonSuggestions = (lessonData: any, currentSection?: string): string[] => {
    if (!lessonData) return []
    
    const suggestions: string[] = []
    
    // Add suggestions based on lesson content
    if (lessonData.title?.toLowerCase().includes('smart helper')) {
      suggestions.push('What are some examples of smart helpers?', 'How do smart helpers learn?')
    }
    
    if (lessonData.curriculum?.includes('Computational Thinking')) {
      suggestions.push('Explain computational thinking', 'Show me an example of decomposition')
    }
    
    if (lessonData.curriculum?.includes('Python') || lessonData.curriculum?.includes('Programming')) {
      suggestions.push('Help me with this code', 'Show me a coding example')
    }
    
    if (lessonData.curriculum?.includes('Ethics')) {
      suggestions.push('Why is AI ethics important?', 'Give me an ethics example')
    }
    
    // Add section-specific suggestions
    if (currentSection) {
      suggestions.push(`Explain more about ${currentSection}`, `Give me practice for ${currentSection}`)
    }
    
    return suggestions.slice(0, 3) // Limit to 3 lesson-specific suggestions
  }

  // Generate fallback response with lesson context
  const generateFallbackResponse = (userInput: string, lessonData: any, currentSection?: string): Message => {
    let content = "I'm here to help you with this lesson! "
    
    if (lessonData?.title) {
      content += `We're currently working on "${lessonData.title}". `
    }
    
    if (currentSection) {
      content += `You're in the ${currentSection} section. `
    }
    
    content += "Could you please rephrase your question or ask about a specific concept from this lesson?"
    
    const suggestions = generateLessonSuggestions(lessonData, currentSection)
    
    return {
      id: Date.now().toString(),
      type: 'ai',
      content,
      timestamp: new Date(),
      suggestions: suggestions.length > 0 ? suggestions : ['Explain this concept', 'Give me an example', 'Help me understand']
    }
  }

  // Text-to-speech
  const speakMessage = (text: string) => {
    if ('speechSynthesis' in window) {
      setIsSpeaking(true)
      const utterance = new SpeechSynthesisUtterance(text)
      utterance.onend = () => setIsSpeaking(false)
      speechSynthesis.speak(utterance)
    }
  }

  // Speech-to-text
  const startListening = () => {
    if ('webkitSpeechRecognition' in window) {
      const recognition = new (window as any).webkitSpeechRecognition()
      recognition.continuous = false
      recognition.interimResults = false
      recognition.lang = 'en-US'
      
      recognition.onstart = () => setIsListening(true)
      recognition.onend = () => setIsListening(false)
      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript
        setInputMessage(transcript)
      }
      
      recognition.start()
    }
  }

  // Handle quick action
  const handleQuickAction = (action: string) => {
    setInputMessage(action)
    setTimeout(() => sendMessage(), 100)
  }

  // Handle message feedback
  const handleFeedback = (messageId: string, feedback: 'positive' | 'negative') => {
    setMessages(prev => prev.map(msg => 
      msg.id === messageId ? { ...msg, feedback } : msg
    ))
  }

  // Handle file attachment
  const handleFileAttachment = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files
    if (files) {
      const newAttachments: Attachment[] = Array.from(files).map(file => ({
        id: Date.now().toString() + Math.random(),
        type: file.type.startsWith('image/') ? 'image' : 'file',
        name: file.name,
        url: URL.createObjectURL(file),
        size: file.size
      }))
      setAttachments(prev => [...prev, ...newAttachments])
    }
  }

  // Remove attachment
  const removeAttachment = (attachmentId: string) => {
    setAttachments(prev => prev.filter(att => att.id !== attachmentId))
  }

  // Handle key press
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  if (minimized) {
    return (
      <div className={`fixed bottom-4 right-4 z-50 ${className}`}>
        <button
          onClick={onMinimize}
          className="bg-primary-600 hover:bg-primary-700 text-white p-3 rounded-full shadow-lg transition-colors"
        >
          <MessageSquare className="w-6 h-6" />
        </button>
      </div>
    )
  }

  return (
    <div ref={containerRef} className={`flex flex-col h-full bg-white ${isFullscreen ? 'fixed inset-0 z-50' : ''} ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-secondary-200 bg-gradient-to-r from-primary-50 to-secondary-50">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-primary-600 rounded-full flex items-center justify-center text-white text-lg">
            {tutorPersonality.avatar}
          </div>
          <div>
            <h3 className="font-semibold text-secondary-900">{tutorPersonality.name}</h3>
            <p className="text-sm text-secondary-600">AI Tutor • {tutorPersonality.style}</p>
          </div>
          {isTyping && (
            <div className="flex items-center space-x-1 text-primary-600">
              <div className="w-2 h-2 bg-current rounded-full animate-bounce" />
              <div className="w-2 h-2 bg-current rounded-full animate-bounce" style={{ animationDelay: '0.1s' }} />
              <div className="w-2 h-2 bg-current rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
            </div>
          )}
        </div>
        
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setShowInsights(!showInsights)}
            className={`p-2 rounded-lg transition-colors ${
              showInsights ? 'bg-primary-100 text-primary-600' : 'hover:bg-secondary-100 text-secondary-600'
            }`}
          >
            <Brain className="w-4 h-4" />
          </button>
          
          <button
            onClick={() => setVoiceEnabled(!voiceEnabled)}
            className={`p-2 rounded-lg transition-colors ${
              voiceEnabled ? 'bg-primary-100 text-primary-600' : 'hover:bg-secondary-100 text-secondary-600'
            }`}
          >
            {voiceEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
          </button>
          
          <button
            onClick={() => setIsFullscreen(!isFullscreen)}
            className="p-2 hover:bg-secondary-100 rounded-lg transition-colors text-secondary-600"
          >
            {isFullscreen ? <Minimize className="w-4 h-4" /> : <Maximize className="w-4 h-4" />}
          </button>
          
          {onMinimize && (
            <button
              onClick={onMinimize}
              className="p-2 hover:bg-secondary-100 rounded-lg transition-colors text-secondary-600"
            >
              <Minimize className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Messages area */}
        <div className="flex-1 flex flex-col">
          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map((message) => (
              <div key={message.id} className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[80%] ${message.type === 'user' ? 'order-2' : 'order-1'}`}>
                  <div className={`flex items-start space-x-2 ${message.type === 'user' ? 'flex-row-reverse space-x-reverse' : ''}`}>
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm ${
                      message.type === 'user' 
                        ? 'bg-primary-600 text-white' 
                        : 'bg-secondary-200 text-secondary-700'
                    }`}>
                      {message.type === 'user' ? <User className="w-4 h-4" /> : tutorPersonality.avatar}
                    </div>
                    
                    <div className={`flex-1 ${message.type === 'user' ? 'text-right' : ''}`}>
                      <div className={`inline-block p-3 rounded-lg ${message.type === 'user'
                        ? 'bg-primary-600 text-white'
                        : 'bg-secondary-100 text-secondary-900'
                      }`}>
                        <p className="text-sm">{message.content}</p>
                        
                        {/* Attachments */}
                        {message.attachments && message.attachments.length > 0 && (
                          <div className="mt-2 space-y-1">
                            {message.attachments.map((attachment) => (
                              <div key={attachment.id} className="flex items-center space-x-2 text-xs opacity-80">
                                {attachment.type === 'image' ? <Image className="w-3 h-3" /> : <FileText className="w-3 h-3" />}
                                <span>{attachment.name}</span>
                              </div>
                            ))}
                          </div>
                        )}
                        
                        {/* Code snippet */}
                        {message.codeSnippet && (
                          <div className="mt-2 bg-secondary-900 text-green-400 p-2 rounded text-xs font-mono overflow-x-auto">
                            <pre>{message.codeSnippet}</pre>
                          </div>
                        )}
                      </div>
                      
                      {/* Suggestions */}
                      {message.suggestions && message.suggestions.length > 0 && (
                        <div className="mt-2 flex flex-wrap gap-1">
                          {message.suggestions.map((suggestion, index) => (
                            <button
                              key={index}
                              onClick={() => handleQuickAction(suggestion)}
                              className="text-xs bg-primary-50 text-primary-700 px-2 py-1 rounded-full hover:bg-primary-100 transition-colors"
                            >
                              {suggestion}
                            </button>
                          ))}
                        </div>
                      )}
                      
                      {/* Related topics */}
                      {message.relatedTopics && message.relatedTopics.length > 0 && (
                        <div className="mt-2">
                          <p className="text-xs text-secondary-600 mb-1">Related topics:</p>
                          <div className="flex flex-wrap gap-1">
                            {message.relatedTopics.map((topic, index) => (
                              <span key={index} className="text-xs bg-secondary-100 text-secondary-700 px-2 py-1 rounded">
                                {topic}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                      
                      {/* Feedback buttons for AI messages */}
                      {message.type === 'ai' && (
                        <div className="flex items-center space-x-2 mt-2">
                          <button
                            onClick={() => handleFeedback(message.id, 'positive')}
                            className={`p-1 rounded transition-colors ${
                              message.feedback === 'positive'
                                ? 'bg-success-100 text-success-600'
                                : 'hover:bg-secondary-100 text-secondary-500'
                            }`}
                          >
                            <ThumbsUp className="w-3 h-3" />
                          </button>
                          <button
                            onClick={() => handleFeedback(message.id, 'negative')}
                            className={`p-1 rounded transition-colors ${
                              message.feedback === 'negative'
                                ? 'bg-error-100 text-error-600'
                                : 'hover:bg-secondary-100 text-secondary-500'
                            }`}
                          >
                            <ThumbsDown className="w-3 h-3" />
                          </button>
                          <span className="text-xs text-secondary-500">
                            {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
            
            {isTyping && (
              <div className="flex justify-start">
                <div className="flex items-center space-x-2">
                  <div className="w-8 h-8 bg-secondary-200 rounded-full flex items-center justify-center text-sm">
                    {tutorPersonality.avatar}
                  </div>
                  <div className="bg-secondary-100 p-3 rounded-lg">
                    <LoadingSpinner size="sm" />
                  </div>
                </div>
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </div>
          
          {/* Quick actions */}
          <div className="p-4 border-t border-secondary-200">
            <div className="flex flex-wrap gap-2 mb-3">
              {quickActions.map((action, index) => (
                <button
                  key={index}
                  onClick={() => handleQuickAction(action)}
                  className="text-sm bg-secondary-100 hover:bg-secondary-200 text-secondary-700 px-3 py-1 rounded-full transition-colors"
                >
                  {action}
                </button>
              ))}
            </div>
            
            {/* Attachments preview */}
            {attachments.length > 0 && (
              <div className="mb-3 flex flex-wrap gap-2">
                {attachments.map((attachment) => (
                  <div key={attachment.id} className="flex items-center space-x-2 bg-secondary-100 px-2 py-1 rounded">
                    {attachment.type === 'image' ? <Image className="w-4 h-4" /> : <FileText className="w-4 h-4" />}
                    <span className="text-sm">{attachment.name}</span>
                    <button
                      onClick={() => removeAttachment(attachment.id)}
                      className="text-secondary-500 hover:text-secondary-700"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            )}
            
            {/* Input area */}
            <div className="flex items-end space-x-2">
              <div className="flex-1 relative">
                <textarea
                  ref={inputRef}
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Ask me anything about programming..."
                  className="w-full p-3 border border-secondary-200 rounded-lg resize-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  rows={1}
                  style={{ minHeight: '44px', maxHeight: '120px' }}
                />
              </div>
              
              <input
                ref={fileInputRef}
                type="file"
                multiple
                accept="image/*,.pdf,.txt,.js,.py,.java,.cpp"
                onChange={handleFileAttachment}
                className="hidden"
              />
              
              <button
                onClick={() => fileInputRef.current?.click()}
                className="p-3 text-secondary-600 hover:text-secondary-800 hover:bg-secondary-100 rounded-lg transition-colors"
              >
                <Link className="w-4 h-4" />
              </button>
              
              {voiceEnabled && (
                <button
                  onClick={startListening}
                  disabled={isListening}
                  className={`p-3 rounded-lg transition-colors ${
                    isListening
                      ? 'bg-error-100 text-error-600'
                      : 'text-secondary-600 hover:text-secondary-800 hover:bg-secondary-100'
                  }`}
                >
                  {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
                </button>
              )}
              
              <button
                onClick={sendMessage}
                disabled={!inputMessage.trim() && attachments.length === 0}
                className="p-3 bg-primary-600 hover:bg-primary-700 disabled:bg-secondary-300 text-white rounded-lg transition-colors"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Insights sidebar */}
        {showInsights && (
          <div className="w-80 border-l border-secondary-200 p-4 bg-secondary-50">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-secondary-900 flex items-center gap-2">
                <Brain className="w-4 h-4" />
                Learning Insights
              </h3>
              <button
                onClick={() => setShowInsights(false)}
                className="text-secondary-500 hover:text-secondary-700"
              >
                ×
              </button>
            </div>
            
            <div className="space-y-3">
              {insights.map((insight) => (
                <div key={insight.id} className={`p-3 rounded-lg border ${
                  insight.type === 'strength' ? 'bg-success-50 border-success-200' :
                  insight.type === 'weakness' ? 'bg-warning-50 border-warning-200' :
                  insight.type === 'suggestion' ? 'bg-primary-50 border-primary-200' :
                  'bg-secondary-50 border-secondary-200'
                }`}>
                  <div className="flex items-start justify-between mb-2">
                    <h4 className="font-medium text-sm text-secondary-900">{insight.title}</h4>
                    <div className={`w-2 h-2 rounded-full ${
                      insight.priority === 'high' ? 'bg-error-500' :
                      insight.priority === 'medium' ? 'bg-warning-500' :
                      'bg-success-500'
                    }`} />
                  </div>
                  <p className="text-xs text-secondary-700 mb-2">{insight.description}</p>
                  {insight.actionable && (
                    <button className="text-xs text-primary-600 hover:text-primary-700 font-medium">
                      Take Action →
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default AITutor