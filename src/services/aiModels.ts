import { AITutorRequest, AITutorResponse, AIMessage, AISuggestion, AICodeSnippet, AIResource } from './ai'

// AI Model Configuration
export interface AIModelConfig {
  name: string
  provider: 'huggingface' | 'openai' | 'anthropic' | 'local'
  modelId: string
  maxTokens: number
  temperature: number
  specialties: string[]
  ageGroups: string[]
  languages: string[]
}

// Available AI Models for Education
export const AI_MODELS: Record<string, AIModelConfig> = {
  'phi-3.5-mini': {
    name: 'Microsoft PHI-3.5 Mini',
    provider: 'huggingface',
    modelId: 'microsoft/Phi-3.5-mini-instruct',
    maxTokens: 128000,
    temperature: 0.7,
    specialties: ['coding', 'math', 'logic', 'problem-solving', 'multilingual', 'reasoning'],
    ageGroups: ['elementary', 'middle', 'high', 'college'],
    languages: ['python', 'javascript', 'java', 'c++', 'rust', 'go']
  },
  'gemma-2-2b': {
    name: 'Google Gemma 2 2B',
    provider: 'huggingface',
    modelId: 'google/gemma-2-2b-it',
    maxTokens: 8192,
    temperature: 0.6,
    specialties: ['general-education', 'explanations', 'creative-writing', 'safety-focused'],
    ageGroups: ['elementary', 'middle'],
    languages: ['python', 'scratch', 'blockly']
  },
  'gemma-3-270m': {
    name: 'Google Gemma 3 270M',
    provider: 'huggingface',
    modelId: 'google/gemma-2-270m-it',
    maxTokens: 8192,
    temperature: 0.6,
    specialties: ['lightweight', 'basic-concepts', 'quick-responses', 'resource-efficient'],
    ageGroups: ['elementary'],
    languages: ['python', 'scratch']
  },
  'qwen-2.5-coder': {
    name: 'Qwen 2.5 Coder',
    provider: 'huggingface',
    modelId: 'Qwen/Qwen2.5-Coder-7B-Instruct',
    maxTokens: 131072,
    temperature: 0.8,
    specialties: ['coding', 'code-generation', 'code-reasoning', 'code-fixing', 'multilingual'],
    ageGroups: ['middle', 'high', 'college'],
    languages: ['python', 'javascript', 'java', 'c++', 'go', 'rust', 'typescript']
  },
  'codellama-instruct': {
    name: 'Code Llama Instruct',
    provider: 'huggingface',
    modelId: 'codellama/CodeLlama-7b-Instruct-hf',
    maxTokens: 16384,
    temperature: 0.5,
    specialties: ['coding', 'debugging', 'code-review', 'algorithms'],
    ageGroups: ['high', 'college'],
    languages: ['python', 'javascript', 'java', 'c++', 'rust', 'go']
  }
}

// Educational Prompts for Different Age Groups
export const EDUCATIONAL_PROMPTS = {
  'k-2': {
    system: "You are a friendly AI tutor for kindergarten to 2nd grade students. Use simple words, fun examples, and encourage curiosity. Always be patient and positive. Use emojis and visual descriptions to make learning fun.",
    examples: [
      "Think of coding like giving instructions to a robot friend! 🤖",
      "Let's play a pattern game! Can you see what comes next? 🔴🔵🔴🔵🔴?"
    ]
  },
  'grades-3-5': {
    system: "You are an encouraging AI tutor for elementary students (grades 3-5). Use age-appropriate language, relate concepts to things they know, and make learning interactive. Focus on building confidence and curiosity.",
    examples: [
      "Programming is like writing a recipe for a computer to follow!",
      "Let's solve this step by step, just like solving a puzzle!"
    ]
  },
  'grades-6-8': {
    system: "You are a supportive AI tutor for middle school students (grades 6-8). Help them understand concepts clearly, connect learning to real-world applications, and encourage critical thinking. Be patient with mistakes and celebrate progress.",
    examples: [
      "This concept is used in apps you probably use every day!",
      "Let's break this problem down into smaller, manageable parts."
    ]
  },
  'grades-9-12': {
    system: "You are a knowledgeable AI tutor for high school students (grades 9-12). Provide detailed explanations, encourage independent thinking, and connect concepts to career opportunities. Challenge them appropriately while being supportive.",
    examples: [
      "This algorithm is fundamental to how search engines work.",
      "Understanding this concept will help you in computer science courses and tech careers."
    ]
  }
}

// HuggingFace API Integration
class HuggingFaceService {
  private apiKey: string
  private baseUrl = 'https://api-inference.huggingface.co/models'

  constructor() {
    this.apiKey = import.meta.env.VITE_HUGGINGFACE_API_KEY || ''
  }

  async generateResponse(
    modelId: string,
    prompt: string,
    options: {
      maxTokens?: number
      temperature?: number
      topP?: number
    } = {}
  ): Promise<string> {
    if (!this.apiKey) {
      throw new Error('HuggingFace API key not configured')
    }

    const response = await fetch(`${this.baseUrl}/${modelId}`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        inputs: prompt,
        parameters: {
          max_new_tokens: options.maxTokens || 512,
          temperature: options.temperature || 0.7,
          top_p: options.topP || 0.9,
          do_sample: true,
          return_full_text: false
        }
      })
    })

    if (!response.ok) {
      const error = await response.text()
      throw new Error(`HuggingFace API error: ${error}`)
    }

    const result = await response.json()
    return Array.isArray(result) ? result[0]?.generated_text || '' : result.generated_text || ''
  }
}

// Enhanced AI Service with Real Model Integration
export class EnhancedAIService {
  private huggingFace: HuggingFaceService

  constructor() {
    this.huggingFace = new HuggingFaceService()
  }

  // Select best model for the request
  private selectModel(request: AITutorRequest): AIModelConfig {
    const { context } = request
    const userLevel = context.userProfile?.level || 'beginner'
    const codeLanguage = context.codeContext?.language

    // Age-based model selection
    if (context.lessonId?.includes('k2') || context.lessonId?.includes('grade-1') || context.lessonId?.includes('grade-2')) {
      return AI_MODELS['gemma-3-270m'] // Lightweight for young learners
    }
    
    if (context.lessonId?.includes('grade-3') || context.lessonId?.includes('grade-4') || context.lessonId?.includes('grade-5')) {
      return AI_MODELS['gemma-2-2b'] // Good for elementary
    }

    if (context.lessonId?.includes('grade-6') || context.lessonId?.includes('grade-7') || context.lessonId?.includes('grade-8')) {
      return AI_MODELS['phi-3.5-mini'] // Good for middle school
    }

    // For high school and advanced topics
    if (codeLanguage && ['python', 'javascript', 'java'].includes(codeLanguage)) {
      return AI_MODELS['qwen-2.5-coder'] // Best for coding with latest Qwen
    }

    return AI_MODELS['phi-3.5-mini'] // Default for advanced topics
  }

  // Build educational prompt
  private buildPrompt(request: AITutorRequest, model: AIModelConfig): string {
    const { message, context } = request
    const gradeLevel = this.getGradeLevel(context.lessonId || '')
    const systemPrompt = EDUCATIONAL_PROMPTS[gradeLevel]?.system || EDUCATIONAL_PROMPTS['grades-6-8'].system

    let prompt = `${systemPrompt}\n\n`

    // Add context
    if (context.lessonId) {
      prompt += `Current lesson: ${context.lessonId}\n`
    }

    if (context.codeContext) {
      prompt += `Programming language: ${context.codeContext.language}\n`
      if (context.codeContext.code) {
        prompt += `Student's code:\n\`\`\`${context.codeContext.language}\n${context.codeContext.code}\n\`\`\`\n`
      }
    }

    if (context.userProfile) {
      prompt += `Student level: ${context.userProfile.level}\n`
      if (context.userProfile.learningGoals.length > 0) {
        prompt += `Learning goals: ${context.userProfile.learningGoals.join(', ')}\n`
      }
    }

    prompt += `\nStudent question: ${message}\n\n`
    prompt += `Please provide a helpful, age-appropriate response that encourages learning and understanding.`

    return prompt
  }

  // Get grade level from lesson ID
  private getGradeLevel(lessonId: string): keyof typeof EDUCATIONAL_PROMPTS {
    if (lessonId.includes('k2') || lessonId.includes('grade-1') || lessonId.includes('grade-2')) {
      return 'k-2'
    }
    if (lessonId.includes('grade-3') || lessonId.includes('grade-4') || lessonId.includes('grade-5')) {
      return 'grades-3-5'
    }
    if (lessonId.includes('grade-6') || lessonId.includes('grade-7') || lessonId.includes('grade-8')) {
      return 'grades-6-8'
    }
    return 'grades-9-12'
  }

  // Generate AI tutor response
  async generateTutorResponse(request: AITutorRequest): Promise<AITutorResponse> {
    try {
      const model = this.selectModel(request)
      const prompt = this.buildPrompt(request, model)

      const response = await this.huggingFace.generateResponse(
        model.modelId,
        prompt,
        {
          maxTokens: request.options?.maxTokens || 512,
          temperature: request.options?.temperature || model.temperature
        }
      )

      // Parse response and create structured output
      const aiMessage: AIMessage = {
        id: Date.now().toString(),
        role: 'assistant',
        content: response,
        timestamp: new Date().toISOString(),
        metadata: {
          model: model.name,
          tokens: this.estimateTokens(response),
          confidence: 0.85
        }
      }

      // Generate suggestions based on content
      const suggestions = this.generateSuggestions(response, request)
      const codeSnippets = this.extractCodeSnippets(response)
      const resources = this.generateResources(request)

      return {
        message: aiMessage,
        suggestions,
        codeSnippets,
        resources,
        followUpQuestions: this.generateFollowUpQuestions(request),
        confidence: 0.85,
        tokensUsed: this.estimateTokens(prompt + response)
      }
    } catch (error) {
      console.error('AI service error:', error)
      throw error
    }
  }

  // Generate personalized meta-lessons
  async generateMetaLesson(
    topic: string,
    gradeLevel: string,
    studentProfile: {
      strengths: string[]
      weaknesses: string[]
      interests: string[]
      learningStyle: 'visual' | 'auditory' | 'kinesthetic' | 'mixed'
    }
  ): Promise<{
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
  }> {
    const model = AI_MODELS['qwen-1.5-chat'] // Best for content generation
    
    const prompt = `Create a personalized lesson plan for ${topic} suitable for ${gradeLevel} students.

Student Profile:
- Strengths: ${studentProfile.strengths.join(', ')}
- Areas for improvement: ${studentProfile.weaknesses.join(', ')}
- Interests: ${studentProfile.interests.join(', ')}
- Learning style: ${studentProfile.learningStyle}

Please create a comprehensive lesson plan that:
1. Builds on student strengths
2. Addresses areas for improvement
3. Incorporates student interests
4. Matches their learning style
5. Includes AI concepts appropriate for their grade level

Format the response as a structured lesson plan with clear objectives, activities, and assessment methods.`

    try {
      const response = await this.huggingFace.generateResponse(model.modelId, prompt, {
        maxTokens: 1024,
        temperature: 0.7
      })

      // Parse and structure the response (simplified for demo)
      return {
        title: `Personalized ${topic} Lesson`,
        objectives: [
          `Understand key concepts in ${topic}`,
          'Apply learning to real-world scenarios',
          'Develop critical thinking skills'
        ],
        activities: [
          {
            type: 'introduction',
            description: 'Interactive introduction to topic',
            duration: 10,
            materials: ['presentation', 'examples']
          },
          {
            type: 'hands-on',
            description: 'Practical application activity',
            duration: 20,
            materials: ['computer', 'coding environment']
          }
        ],
        assessment: {
          questions: [
            'What did you learn about this topic?',
            'How can you apply this in real life?'
          ],
          rubric: [
            'Demonstrates understanding of key concepts',
            'Shows ability to apply knowledge'
          ]
        },
        adaptations: [
          'Provide visual aids for visual learners',
          'Include hands-on activities for kinesthetic learners'
        ]
      }
    } catch (error) {
      console.error('Meta-lesson generation error:', error)
      throw error
    }
  }

  // Helper methods
  // Mock response method removed - using only real HuggingFace integration

  private generateSuggestions(response: string, request: AITutorRequest): AISuggestion[] {
    // Generate contextual suggestions based on the response
    return [
      {
        id: '1',
        type: 'explanation',
        title: 'Learn More',
        description: 'Get a deeper explanation of this concept',
        priority: 'medium'
      }
    ]
  }

  private extractCodeSnippets(response: string): AICodeSnippet[] {
    // Extract code blocks from the response
    const codeBlocks: AICodeSnippet[] = []
    const codeRegex = /```(\w+)?\n([\s\S]*?)```/g
    let match

    while ((match = codeRegex.exec(response)) !== null) {
      codeBlocks.push({
        id: Date.now().toString() + Math.random(),
        title: 'Code Example',
        description: 'Generated code example',
        code: match[2].trim(),
        language: match[1] || 'text',
        tags: ['example'],
        difficulty: 'beginner'
      })
    }

    return codeBlocks
  }

  private generateResources(request: AITutorRequest): AIResource[] {
    // Generate relevant learning resources
    return [
      {
        id: '1',
        type: 'tutorial',
        title: 'Related Tutorial',
        description: 'Additional learning material on this topic',
        relevance: 0.8
      }
    ]
  }

  private generateFollowUpQuestions(request: AITutorRequest): string[] {
    return [
      'Would you like to see more examples?',
      'Do you want to try a practice exercise?',
      'Is there anything specific you\'d like me to explain further?'
    ]
  }

  private estimateTokens(text: string): number {
    // Rough token estimation (1 token ≈ 4 characters)
    return Math.ceil(text.length / 4)
  }
}

export const enhancedAIService = new EnhancedAIService()
export default enhancedAIService