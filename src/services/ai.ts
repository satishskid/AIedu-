import { v4 as uuidv4 } from 'uuid'
import { apiClient, API_ENDPOINTS, ApiError } from './api'
import { licenseService } from './license'
import { AI_MODELS } from './aiModels'

// Constants
const HUGGINGFACE_API_URL = 'https://api-inference.huggingface.co/models'
const HUGGINGFACE_API_KEY = import.meta.env.VITE_HUGGINGFACE_API_KEY

// Available AI Models (re-exported for backward compatibility)
export const AI_MODELS_COMPAT = {
  PHI: 'microsoft/Phi-3.5-mini-instruct',
  GEMMA: 'google/gemma-2-2b-it',
  GEMMA_LITE: 'google/gemma-2-270m-it',
  QWEN: 'Qwen/Qwen2.5-Coder-7B-Instruct',
  CODELLAMA: 'codellama/CodeLlama-7b-Instruct-hf',
  MISTRAL: 'mistralai/Mistral-7B-Instruct-v0.1'
} as const

export type AIModelType = keyof typeof AI_MODELS

// AI Service Types
export interface AIMessage {
  id: string
  role: 'user' | 'assistant' | 'system'
  content: string
  timestamp: string
  metadata?: {
    type?: 'text' | 'code' | 'image' | 'file'
    language?: string
    confidence?: number
    tokens?: number
    model?: string
    context?: string
  }
}

export interface AIConversation {
  id: string
  title: string
  messages: AIMessage[]
  context: AIContext
  createdAt: string
  updatedAt: string
  metadata?: {
    totalTokens: number
    model: string
    language: string
    tags: string[]
  }
}

export interface AIContext {
  userId: string
  sessionId: string
  lessonId?: string
  courseId?: string
  codeContext?: {
    language: string
    code: string
    fileName?: string
    lineNumber?: number
  }
  userProfile?: {
    level: 'beginner' | 'intermediate' | 'advanced'
    preferences: string[]
    learningGoals: string[]
  }
}

export interface AITutorRequest {
  message: string
  context: AIContext
  options?: {
    model?: string
    temperature?: number
    maxTokens?: number
    includeCodeSuggestions?: boolean
    includeExplanations?: boolean
    includeExamples?: boolean
  }
}

export interface AITutorResponse {
  message: AIMessage
  suggestions?: AISuggestion[]
  codeSnippets?: AICodeSnippet[]
  resources?: AIResource[]
  followUpQuestions?: string[]
  confidence: number
  tokensUsed: number
}

export interface AISuggestion {
  id: string
  type: 'hint' | 'improvement' | 'alternative' | 'explanation'
  title: string
  description: string
  code?: string
  language?: string
  priority: 'low' | 'medium' | 'high'
}

export interface AICodeSnippet {
  id: string
  title: string
  description: string
  code: string
  language: string
  tags: string[]
  difficulty: 'beginner' | 'intermediate' | 'advanced'
  explanation?: string
}

export interface AIResource {
  id: string
  type: 'documentation' | 'tutorial' | 'example' | 'reference'
  title: string
  description: string
  url?: string
  content?: string
  relevance: number
}

export interface AICodeReviewRequest {
  code: string
  language: string
  context?: {
    fileName?: string
    projectType?: string
    framework?: string
    description?: string
  }
  options?: {
    checkSyntax?: boolean
    checkStyle?: boolean
    checkPerformance?: boolean
    checkSecurity?: boolean
    checkBestPractices?: boolean
    suggestImprovements?: boolean
  }
}

export interface AICodeReviewResponse {
  overall: {
    score: number // 0-100
    summary: string
    recommendations: string[]
  }
  issues: AICodeIssue[]
  suggestions: AISuggestion[]
  improvements: AICodeImprovement[]
  tokensUsed: number
}

export interface AICodeIssue {
  id: string
  type: 'syntax' | 'style' | 'performance' | 'security' | 'logic' | 'best-practice'
  severity: 'low' | 'medium' | 'high' | 'critical'
  title: string
  description: string
  line?: number
  column?: number
  suggestion?: string
  fixCode?: string
}

export interface AICodeImprovement {
  id: string
  title: string
  description: string
  originalCode: string
  improvedCode: string
  explanation: string
  impact: 'low' | 'medium' | 'high'
  category: 'performance' | 'readability' | 'maintainability' | 'security'
}

export interface AIHintRequest {
  question: string
  context: {
    lessonId?: string
    topic: string
    difficulty: 'beginner' | 'intermediate' | 'advanced'
    userCode?: string
    language?: string
  }
  hintLevel: 1 | 2 | 3 // Progressive hint levels
}

export interface AIHintResponse {
  hint: string
  explanation?: string
  codeExample?: string
  nextSteps?: string[]
  relatedConcepts?: string[]
  confidence: number
}

export interface AIExplanationRequest {
  concept: string
  context?: {
    level: 'beginner' | 'intermediate' | 'advanced'
    language?: string
    relatedCode?: string
    specificQuestion?: string
  }
  format?: 'simple' | 'detailed' | 'interactive'
}

export interface AIExplanationResponse {
  explanation: string
  examples: AICodeSnippet[]
  analogies?: string[]
  keyPoints: string[]
  commonMistakes?: string[]
  practiceExercises?: string[]
  relatedTopics: string[]
}

export interface AIFeedbackRequest {
  userCode: string
  expectedOutput?: string
  actualOutput?: string
  language: string
  context: {
    lessonId?: string
    exerciseId?: string
    attempt: number
  }
}

export interface AIFeedbackResponse {
  feedback: string
  score: number // 0-100
  strengths: string[]
  improvements: string[]
  hints: string[]
  nextSteps: string[]
  encouragement: string
}

// AI Service Class
class AIService {
  private conversations: Map<string, AIConversation> = new Map()
  private requestQueue: Array<() => Promise<any>> = []
  private isProcessingQueue = false
  private rateLimitDelay = 1000 // 1 second between requests
  
  // Chat with AI Tutor
  async chatWithTutor(request: AITutorRequest): Promise<AITutorResponse> {
    // Check license permissions
    if (!licenseService.hasFeature('ai_tutor')) {
      throw new Error('AI Tutor feature not available in your license')
    }
    
    return this.queueRequest(async () => {
      try {
        // Use real AI if API key is available
        if (HUGGINGFACE_API_KEY) {
          return await this.getRealTutorResponse(request)
        } else {
          throw new Error('HuggingFace API key not configured. Please set VITE_HUGGINGFACE_API_KEY in your environment.')
        }
        
      } catch (error) {
        console.error('AI Tutor error:', error)
        throw error
      }
    })
  }

  async reviewCode(request: AICodeReviewRequest): Promise<AICodeReviewResponse> {
    return this.queueRequest(async () => {
      try {
        if (HUGGINGFACE_API_KEY) {
          return await this.getRealCodeReviewResponse(request)
        } else {
          throw new Error('HuggingFace API key not configured. Please set VITE_HUGGINGFACE_API_KEY in your environment.')
        }
      } catch (error) {
        console.error('AI Code Review error:', error)
        throw error
      }
    })
  }

  async getHint(request: AIHintRequest): Promise<AIHintResponse> {
    return this.queueRequest(async () => {
      try {
        if (HUGGINGFACE_API_KEY) {
          return await this.getRealHintResponse(request)
        } else {
          throw new Error('HuggingFace API key not configured. Please set VITE_HUGGINGFACE_API_KEY in your environment.')
        }
      } catch (error) {
        console.error('AI Hint error:', error)
        throw error
      }
    })
  }

  async getExplanation(request: AIExplanationRequest): Promise<AIExplanationResponse> {
    return this.queueRequest(async () => {
      try {
        if (HUGGINGFACE_API_KEY) {
          return await this.getRealExplanationResponse(request)
        } else {
          throw new Error('HuggingFace API key not configured. Please set VITE_HUGGINGFACE_API_KEY in your environment.')
        }
      } catch (error) {
        console.error('AI Explanation error:', error)
        throw error
      }
    })
  }

  async getFeedback(request: AIFeedbackRequest): Promise<AIFeedbackResponse> {
    return this.queueRequest(async () => {
      try {
        if (HUGGINGFACE_API_KEY) {
          return await this.getRealFeedbackResponse(request)
        } else {
          throw new Error('HuggingFace API key not configured. Please set VITE_HUGGINGFACE_API_KEY in your environment.')
        }
      } catch (error) {
        console.error('AI Feedback error:', error)
        throw error
      }
    })
  }
  
  // Generate content with AI
  async generateContent(prompt: string, options?: {
    type?: 'lesson' | 'exercise' | 'quiz' | 'explanation'
    language?: string
    difficulty?: 'beginner' | 'intermediate' | 'advanced'
    length?: 'short' | 'medium' | 'long'
  }): Promise<{ content: string; metadata: any }> {
    if (!licenseService.hasFeature('ai_content_generation')) {
      throw new Error('AI Content Generation feature not available in your license')
    }
    
    return this.queueRequest(async () => {
      try {
        const response = await apiClient.post<{ content: string; metadata: any }>(API_ENDPOINTS.AI.GENERATE_CONTENT, {
          prompt,
          options: {
            type: 'lesson',
            difficulty: 'intermediate',
            length: 'medium',
            ...options
          },
          timestamp: new Date().toISOString()
        })
        
        if (response.success && response.data) {
          return response.data
        } else {
          throw new Error(response.message || 'Content generation failed')
        }
        
      } catch (error) {
        console.error('AI Content Generation error:', error)
        throw error
      }
    })
  }
  
  // Conversation management
  getConversation(sessionId: string): AIConversation | null {
    return this.conversations.get(sessionId) || null
  }
  
  createConversation(context: AIContext, title?: string): AIConversation {
    const conversation: AIConversation = {
      id: context.sessionId,
      title: title || 'AI Tutor Session',
      messages: [],
      context,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      metadata: {
        totalTokens: 0,
        model: 'gpt-4',
        language: 'en',
        tags: []
      }
    }
    
    this.conversations.set(context.sessionId, conversation)
    return conversation
  }
  
  private updateConversation(sessionId: string, message: AIMessage): void {
    const conversation = this.conversations.get(sessionId)
    if (conversation) {
      conversation.messages.push(message)
      conversation.updatedAt = new Date().toISOString()
      if (message.metadata?.tokens) {
        conversation.metadata!.totalTokens += message.metadata.tokens
      }
    }
  }
  
  // Real AI API integration
  private async getRealTutorResponse(request: AITutorRequest): Promise<AITutorResponse> {
    const model = request.options?.model || 'PHI'
    const modelName = AI_MODELS[model as keyof typeof AI_MODELS]?.modelId || AI_MODELS['phi-3-mini'].modelId
    
    const prompt = this.buildTutorPrompt(request)
    
    const response = await fetch(`${HUGGINGFACE_API_URL}/${modelName}`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${HUGGINGFACE_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        inputs: prompt,
        parameters: {
          max_new_tokens: request.options?.maxTokens || 500,
          temperature: request.options?.temperature || 0.7,
          return_full_text: false
        }
      })
    })
    
    if (!response.ok) {
      throw new Error(`AI API error: ${response.statusText}`)
    }
    
    const data = await response.json()
    const aiResponse = Array.isArray(data) ? data[0]?.generated_text : data.generated_text
    
    if (!aiResponse) {
      throw new Error('No response from AI model')
    }
    
    const message: AIMessage = {
      id: 'ai-' + Date.now(),
      role: 'assistant',
      content: aiResponse.trim(),
      timestamp: new Date().toISOString(),
      metadata: {
        type: 'text',
        model: modelName,
        confidence: 0.8,
        tokens: calculateTokensUtil(aiResponse)
      }
    }
    
    // Store conversation
    this.updateConversation(request.context.sessionId, {
      id: 'user-' + Date.now(),
      role: 'user',
      content: request.message,
      timestamp: new Date().toISOString()
    })
    
    this.updateConversation(request.context.sessionId, message)
    
    return {
      message,
      suggestions: [],
      codeSnippets: [],
      resources: [],
      followUpQuestions: [],
      confidence: 0.8,
      tokensUsed: calculateTokensUtil(aiResponse)
    }
  }
  
  private buildTutorPrompt(request: AITutorRequest): string {
    const { message, context } = request
    const { userProfile, codeContext } = context
    
    let prompt = `You are an AI programming tutor. Help the student with their question.\n\n`
    
    if (userProfile) {
      prompt += `Student Level: ${userProfile.level}\n`
      if (userProfile.learningGoals.length > 0) {
        prompt += `Learning Goals: ${userProfile.learningGoals.join(', ')}\n`
      }
    }
    
    if (codeContext) {
      prompt += `Programming Language: ${codeContext.language}\n`
      if (codeContext.code) {
        prompt += `Current Code:\n\`\`\`${codeContext.language}\n${codeContext.code}\n\`\`\`\n\n`
      }
    }
    
    prompt += `Student Question: ${message}\n\n`
    prompt += `Please provide a helpful, educational response that matches the student's level. Include examples when appropriate.`
    
    return prompt
   }
   
   private async getRealCodeReviewResponse(request: AICodeReviewRequest): Promise<AICodeReviewResponse> {
     const modelName = AI_MODELS['codellama-instruct'].modelId // Use CodeLlama for code review
     
     const prompt = `You are a code review expert. Analyze the following ${request.language} code and provide detailed feedback.

Code to review:
\`\`\`${request.language}
${request.code}
\`\`\`

Please provide:
1. Overall assessment (score 0-100)
2. Issues found (syntax, style, performance, security)
3. Specific improvements
4. Best practices recommendations

Format your response as structured feedback.`
     
     const response = await fetch(`${HUGGINGFACE_API_URL}/${modelName}`, {
       method: 'POST',
       headers: {
         'Authorization': `Bearer ${HUGGINGFACE_API_KEY}`,
         'Content-Type': 'application/json'
       },
       body: JSON.stringify({
         inputs: prompt,
         parameters: {
           max_new_tokens: 800,
           temperature: 0.3,
           return_full_text: false
         }
       })
     })
     
     if (!response.ok) {
       throw new Error(`AI API error: ${response.statusText}`)
     }
     
     const data = await response.json()
     const aiResponse = Array.isArray(data) ? data[0]?.generated_text : data.generated_text
     
     // Parse AI response into structured format
     return {
       overall: {
         score: 85, // Default score, could be parsed from AI response
         summary: aiResponse || 'Code review completed',
         recommendations: ['Follow best practices', 'Consider performance optimizations']
       },
       issues: [],
       suggestions: [],
       improvements: [],
       tokensUsed: calculateTokensUtil(aiResponse || '')
     }
   }
   
   private async getRealHintResponse(request: AIHintRequest): Promise<AIHintResponse> {
     const modelName = AI_MODELS['phi-3-mini'].modelId
     
     const hintLevelText = ['gentle nudge', 'more specific guidance', 'detailed explanation'][request.hintLevel - 1]
     
     const prompt = `You are a helpful programming tutor. A ${request.context.difficulty} level student is asking about "${request.context.topic}" and needs a ${hintLevelText}.

Student's question: ${request.question}

${request.context.userCode ? `Their current code:
\`\`\`${request.context.language}
${request.context.userCode}
\`\`\`

` : ''}Please provide a helpful hint that guides them toward the solution without giving it away completely.`
     
     const response = await fetch(`${HUGGINGFACE_API_URL}/${modelName}`, {
       method: 'POST',
       headers: {
         'Authorization': `Bearer ${HUGGINGFACE_API_KEY}`,
         'Content-Type': 'application/json'
       },
       body: JSON.stringify({
         inputs: prompt,
         parameters: {
           max_new_tokens: 300,
           temperature: 0.7,
           return_full_text: false
         }
       })
     })
     
     if (!response.ok) {
       throw new Error(`AI API error: ${response.statusText}`)
     }
     
     const data = await response.json()
     const aiResponse = Array.isArray(data) ? data[0]?.generated_text : data.generated_text
     
     return {
       hint: aiResponse || 'Try breaking the problem into smaller steps.',
       explanation: 'This hint should help guide you toward the solution.',
       nextSteps: ['Think about the problem step by step', 'Try implementing a small part first'],
       relatedConcepts: [request.context.topic],
       confidence: 0.8
     }
   }
   
   private async getRealExplanationResponse(request: AIExplanationRequest): Promise<AIExplanationResponse> {
     const modelName = AI_MODELS['phi-3-mini'].modelId
     
     const prompt = `You are an expert programming educator. Explain the concept "${request.concept}" to a ${request.context?.level || 'beginner'} level student.

${request.context?.relatedCode ? `Related code example:
\`\`\`${request.context.language}
${request.context.relatedCode}
\`\`\`

` : ''}${request.context?.specificQuestion ? `Specific question: ${request.context.specificQuestion}

` : ''}Please provide a clear, educational explanation with examples.`
     
     const response = await fetch(`${HUGGINGFACE_API_URL}/${modelName}`, {
       method: 'POST',
       headers: {
         'Authorization': `Bearer ${HUGGINGFACE_API_KEY}`,
         'Content-Type': 'application/json'
       },
       body: JSON.stringify({
         inputs: prompt,
         parameters: {
           max_new_tokens: 600,
           temperature: 0.6,
           return_full_text: false
         }
       })
     })
     
     if (!response.ok) {
       throw new Error(`AI API error: ${response.statusText}`)
     }
     
     const data = await response.json()
     const aiResponse = Array.isArray(data) ? data[0]?.generated_text : data.generated_text
     
     return {
       explanation: aiResponse || `${request.concept} is an important programming concept.`,
       examples: [],
       keyPoints: [request.concept],
       relatedTopics: [request.concept]
     }
   }
   
   private async getRealFeedbackResponse(request: AIFeedbackRequest): Promise<AIFeedbackResponse> {
     const modelName = AI_MODELS['phi-3-mini'].modelId
     
     const prompt = `You are a supportive programming instructor. Review this student's code and provide constructive feedback.

Student's ${request.language} code:
\`\`\`${request.language}
${request.userCode}
\`\`\`

${request.expectedOutput ? `Expected output: ${request.expectedOutput}
` : ''}${request.actualOutput ? `Actual output: ${request.actualOutput}
` : ''}This is attempt #${request.context.attempt}.

Provide encouraging feedback with specific suggestions for improvement.`
     
     const response = await fetch(`${HUGGINGFACE_API_URL}/${modelName}`, {
       method: 'POST',
       headers: {
         'Authorization': `Bearer ${HUGGINGFACE_API_KEY}`,
         'Content-Type': 'application/json'
       },
       body: JSON.stringify({
         inputs: prompt,
         parameters: {
           max_new_tokens: 400,
           temperature: 0.7,
           return_full_text: false
         }
       })
     })
     
     if (!response.ok) {
       throw new Error(`AI API error: ${response.statusText}`)
     }
     
     const data = await response.json()
     const aiResponse = Array.isArray(data) ? data[0]?.generated_text : data.generated_text
     
     return {
       feedback: aiResponse || 'Good effort! Keep practicing.',
       score: 75, // Default score
       strengths: ['Good attempt at solving the problem'],
       improvements: ['Consider edge cases', 'Add error handling'],
       hints: ['Try breaking the problem into smaller steps'],
       nextSteps: ['Practice similar problems', 'Review the concepts'],
       encouragement: 'You\'re making great progress! Keep it up!'
     }
   }
   
   // Request queue management
  private async queueRequest<T>(request: () => Promise<T>): Promise<T> {
    return new Promise((resolve, reject) => {
      this.requestQueue.push(async () => {
        try {
          const result = await request()
          resolve(result)
        } catch (error) {
          reject(error)
        }
      })
      
      this.processQueue()
    })
  }
  
  private async processQueue(): Promise<void> {
    if (this.isProcessingQueue || this.requestQueue.length === 0) {
      return
    }
    
    this.isProcessingQueue = true
    
    while (this.requestQueue.length > 0) {
      const request = this.requestQueue.shift()
      if (request) {
        await request()
        await new Promise(resolve => setTimeout(resolve, this.rateLimitDelay))
      }
    }
    
    this.isProcessingQueue = false
  }
  
  // All AI responses now use real HuggingFace integration
  // Mock responses have been removed to ensure production-ready AI functionality
}

// Create and export AI service instance
export const aiService = new AIService()

// Utility functions
export const formatAIResponse = (content: string): string => {
  // Basic formatting for AI responses
  return content
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') // Bold
    .replace(/\*(.*?)\*/g, '<em>$1</em>') // Italic
    .replace(/`(.*?)`/g, '<code>$1</code>') // Inline code
    .replace(/\n/g, '<br>') // Line breaks
}

export const extractCodeFromResponse = (content: string): { code: string; language: string }[] => {
  const codeBlocks: { code: string; language: string }[] = []
  const regex = /```(\w+)?\n([\s\S]*?)```/g
  let match
  
  while ((match = regex.exec(content)) !== null) {
    codeBlocks.push({
      language: match[1] || 'text',
      code: match[2].trim()
    })
  }
  
  return codeBlocks
}

export const calculateTokensUtil = (text: string): number => {
  // Rough estimation: 1 token ≈ 4 characters
  return Math.ceil(text.length / 4)
}

export default aiService