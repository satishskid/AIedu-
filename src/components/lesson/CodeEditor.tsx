import React, { useState, useEffect, useRef, useCallback } from 'react'
import {
  Play,
  Square,
  RotateCcw,
  Save,
  Download,
  Upload,
  Copy,
  Check,
  AlertCircle,
  CheckCircle,
  Settings,
  Maximize,
  Minimize,
  Eye,
  EyeOff,
  Zap,
  Bug,
  Terminal,
  FileText,
  Lightbulb,
  Target,
  Award,
  Clock,
  Code2
} from 'lucide-react'
import { useAuthStore } from '../../store/authStore'
import { useThemeStore } from '../../store/themeStore'
import { LoadingSpinner } from '../common/LoadingSpinner'

interface CodeEditorProps {
  initialCode?: string
  language?: 'javascript' | 'python' | 'java' | 'cpp' | 'html' | 'css'
  theme?: 'light' | 'dark'
  readOnly?: boolean
  showLineNumbers?: boolean
  showMinimap?: boolean
  fontSize?: number
  tabSize?: number
  wordWrap?: boolean
  autoSave?: boolean
  onCodeChange?: (code: string) => void
  onRun?: (code: string) => Promise<ExecutionResult>
  onSave?: (code: string) => void
  exerciseId?: string
  hints?: string[]
  solution?: string
  testCases?: TestCase[]
}

interface ExecutionResult {
  success: boolean
  output: string
  error?: string
  executionTime: number
  memoryUsage?: number
}

interface TestCase {
  id: string
  input: string
  expectedOutput: string
  description: string
  passed?: boolean
}

interface CodeSuggestion {
  text: string
  detail: string
  kind: 'function' | 'variable' | 'keyword' | 'snippet'
}

export const CodeEditor: React.FC<CodeEditorProps> = ({
  initialCode = '',
  language = 'javascript',
  theme = 'light',
  readOnly = false,
  showLineNumbers = true,
  showMinimap = false,
  fontSize = 14,
  tabSize = 2,
  wordWrap = true,
  autoSave = true,
  onCodeChange,
  onRun,
  onSave,
  exerciseId,
  hints = [],
  solution,
  testCases = []
}) => {
  const { user } = useAuthStore()
  const { theme: globalTheme } = useThemeStore()
  
  const [code, setCode] = useState(initialCode)
  const [isRunning, setIsRunning] = useState(false)
  const [executionResult, setExecutionResult] = useState<ExecutionResult | null>(null)
  const [showOutput, setShowOutput] = useState(true)
  const [showHints, setShowHints] = useState(false)
  const [showSolution, setShowSolution] = useState(false)
  const [currentHintIndex, setCurrentHintIndex] = useState(0)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [copied, setCopied] = useState(false)
  const [suggestions, setSuggestions] = useState<CodeSuggestion[]>([])
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [cursorPosition, setCursorPosition] = useState({ line: 1, column: 1 })
  const [editorSettings, setEditorSettings] = useState({
    fontSize,
    tabSize,
    wordWrap,
    showLineNumbers,
    showMinimap
  })
  
  const editorRef = useRef<HTMLTextAreaElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const outputRef = useRef<HTMLDivElement>(null)

  // Auto-save functionality
  useEffect(() => {
    if (autoSave && code !== initialCode) {
      const timer = setTimeout(() => {
        onSave?.(code)
      }, 2000)
      return () => clearTimeout(timer)
    }
    return undefined
  }, [code, autoSave, onSave, initialCode])

  // Handle code changes
  const handleCodeChange = useCallback((newCode: string) => {
    setCode(newCode)
    onCodeChange?.(newCode)
    
    // Update cursor position
    if (editorRef.current) {
      const textarea = editorRef.current
      const lines = newCode.substring(0, textarea.selectionStart).split('\n')
      setCursorPosition({
        line: lines.length,
        column: lines[lines.length - 1].length + 1
      })
    }
  }, [onCodeChange])

  // Run code
  const handleRun = async () => {
    if (!onRun || isRunning) return
    
    setIsRunning(true)
    setShowOutput(true)
    
    try {
      const result = await onRun(code)
      setExecutionResult(result)
      
      // Run test cases if available
      if (testCases.length > 0) {
        await runTestCases()
      }
    } catch (error) {
      setExecutionResult({
        success: false,
        output: '',
        error: error instanceof Error ? error.message : 'Unknown error occurred',
        executionTime: 0
      })
    } finally {
      setIsRunning(false)
    }
  }

  // Run test cases
  const runTestCases = async () => {
    // Mock test case execution
    const updatedTestCases = testCases.map(testCase => ({
      ...testCase,
      passed: Math.random() > 0.3 // Mock random pass/fail
    }))
    
    // In real implementation, this would execute the code with test inputs
    console.log('Running test cases:', updatedTestCases)
  }

  // Copy code to clipboard
  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(code)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (error) {
      console.error('Failed to copy code:', error)
    }
  }

  // Reset code
  const handleReset = () => {
    setCode(initialCode)
    setExecutionResult(null)
    onCodeChange?.(initialCode)
  }

  // Toggle fullscreen
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

  // Get next hint
  const getNextHint = () => {
    if (currentHintIndex < hints.length - 1) {
      setCurrentHintIndex(currentHintIndex + 1)
    }
  }

  // Mock code suggestions
  const getCodeSuggestions = (input: string): CodeSuggestion[] => {
    const suggestions: CodeSuggestion[] = []
    
    if (language === 'javascript') {
      if (input.includes('console')) {
        suggestions.push({
          text: 'console.log()',
          detail: 'Log output to console',
          kind: 'function'
        })
      }
      if (input.includes('function')) {
        suggestions.push({
          text: 'function name() {}',
          detail: 'Function declaration',
          kind: 'snippet'
        })
      }
    }
    
    return suggestions
  }

  // Handle key press
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.ctrlKey || e.metaKey) {
      switch (e.key) {
        case 's':
          e.preventDefault()
          onSave?.(code)
          break
        case 'Enter':
          e.preventDefault()
          handleRun()
          break
        case '/':
          e.preventDefault()
          // Toggle comment
          break
      }
    }
    
    if (e.key === 'Tab') {
      e.preventDefault()
      const textarea = e.target as HTMLTextAreaElement
      const start = textarea.selectionStart
      const end = textarea.selectionEnd
      const newCode = code.substring(0, start) + '  '.repeat(tabSize / 2) + code.substring(end)
      handleCodeChange(newCode)
      
      // Restore cursor position
      setTimeout(() => {
        textarea.selectionStart = textarea.selectionEnd = start + tabSize
      }, 0)
    }
  }

  const editorTheme = theme === 'dark' || globalTheme === 'dark' ? 'dark' : 'light'

  return (
    <div ref={containerRef} className={`flex flex-col h-full bg-white ${isFullscreen ? 'fixed inset-0 z-50' : ''}`}>
      {/* Toolbar */}
      <div className="flex items-center justify-between p-4 border-b border-secondary-200 bg-secondary-50">
        <div className="flex items-center space-x-2">
          <button
            onClick={handleRun}
            disabled={isRunning || readOnly}
            className="btn btn-primary btn-sm flex items-center gap-2 disabled:opacity-50"
          >
            {isRunning ? (
              <LoadingSpinner size="sm" color="white" />
            ) : (
              <Play className="w-4 h-4" />
            )}
            {isRunning ? 'Running...' : 'Run'}
          </button>
          
          <button
            onClick={handleReset}
            disabled={readOnly}
            className="btn btn-secondary btn-sm flex items-center gap-2"
          >
            <RotateCcw className="w-4 h-4" />
            Reset
          </button>
          
          <button
            onClick={() => onSave?.(code)}
            disabled={readOnly}
            className="btn btn-secondary btn-sm flex items-center gap-2"
          >
            <Save className="w-4 h-4" />
            Save
          </button>
          
          <button
            onClick={handleCopy}
            className="btn btn-secondary btn-sm flex items-center gap-2"
          >
            {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
            {copied ? 'Copied!' : 'Copy'}
          </button>
        </div>
        
        <div className="flex items-center space-x-2">
          <div className="flex items-center space-x-2 text-sm text-secondary-600">
            <Code2 className="w-4 h-4" />
            <span className="capitalize">{language}</span>
            <span>•</span>
            <span>Line {cursorPosition.line}, Col {cursorPosition.column}</span>
          </div>
          
          {hints.length > 0 && (
            <button
              onClick={() => setShowHints(!showHints)}
              className="btn btn-secondary btn-sm flex items-center gap-2"
            >
              <Lightbulb className="w-4 h-4" />
              Hints ({hints.length})
            </button>
          )}
          
          {solution && (
            <button
              onClick={() => setShowSolution(!showSolution)}
              className="btn btn-secondary btn-sm flex items-center gap-2"
            >
              <Target className="w-4 h-4" />
              Solution
            </button>
          )}
          
          <button
            onClick={toggleFullscreen}
            className="btn btn-secondary btn-sm"
          >
            {isFullscreen ? <Minimize className="w-4 h-4" /> : <Maximize className="w-4 h-4" />}
          </button>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Editor */}
        <div className="flex-1 flex flex-col">
          <div className="flex-1 relative">
            <textarea
              ref={editorRef}
              value={code}
              onChange={(e) => handleCodeChange(e.target.value)}
              onKeyDown={handleKeyPress}
              readOnly={readOnly}
              className={`w-full h-full p-4 font-mono resize-none border-none outline-none ${
                editorTheme === 'dark'
                  ? 'bg-secondary-900 text-green-400'
                  : 'bg-white text-secondary-900'
              }`}
              style={{
                fontSize: `${editorSettings.fontSize}px`,
                tabSize: editorSettings.tabSize,
                whiteSpace: editorSettings.wordWrap ? 'pre-wrap' : 'pre'
              }}
              placeholder="Start coding here..."
              spellCheck={false}
            />
            
            {/* Line numbers */}
            {editorSettings.showLineNumbers && (
              <div className={`absolute left-0 top-0 p-4 pointer-events-none select-none ${
                editorTheme === 'dark' ? 'text-secondary-500' : 'text-secondary-400'
              }`}>
                {code.split('\n').map((_, index) => (
                  <div key={index} className="font-mono" style={{ fontSize: `${editorSettings.fontSize}px` }}>
                    {index + 1}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Side panels */}
        <div className="w-80 border-l border-secondary-200 flex flex-col">
          {/* Hints panel */}
          {showHints && hints.length > 0 && (
            <div className="p-4 border-b border-secondary-200 bg-yellow-50">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold text-yellow-800 flex items-center gap-2">
                  <Lightbulb className="w-4 h-4" />
                  Hint {currentHintIndex + 1} of {hints.length}
                </h3>
                <button
                  onClick={() => setShowHints(false)}
                  className="text-yellow-600 hover:text-yellow-800"
                >
                  <EyeOff className="w-4 h-4" />
                </button>
              </div>
              <p className="text-sm text-yellow-700 mb-3">{hints[currentHintIndex]}</p>
              {currentHintIndex < hints.length - 1 && (
                <button
                  onClick={getNextHint}
                  className="text-sm text-yellow-600 hover:text-yellow-800 font-medium"
                >
                  Next Hint →
                </button>
              )}
            </div>
          )}

          {/* Solution panel */}
          {showSolution && solution && (
            <div className="p-4 border-b border-secondary-200 bg-green-50">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold text-green-800 flex items-center gap-2">
                  <Target className="w-4 h-4" />
                  Solution
                </h3>
                <button
                  onClick={() => setShowSolution(false)}
                  className="text-green-600 hover:text-green-800"
                >
                  <EyeOff className="w-4 h-4" />
                </button>
              </div>
              <pre className="text-sm text-green-700 bg-green-100 p-3 rounded overflow-x-auto">
                <code>{solution}</code>
              </pre>
              <button
                onClick={() => handleCodeChange(solution)}
                className="mt-3 text-sm text-green-600 hover:text-green-800 font-medium"
              >
                Use This Solution
              </button>
            </div>
          )}

          {/* Test cases */}
          {testCases.length > 0 && (
            <div className="p-4 border-b border-secondary-200">
              <h3 className="font-semibold text-secondary-900 mb-3 flex items-center gap-2">
                <Bug className="w-4 h-4" />
                Test Cases
              </h3>
              <div className="space-y-2">
                {testCases.map((testCase, index) => (
                  <div key={testCase.id} className="p-3 border border-secondary-200 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-secondary-900">
                        Test {index + 1}
                      </span>
                      {testCase.passed !== undefined && (
                        <span className={`text-sm flex items-center gap-1 ${
                          testCase.passed ? 'text-success-600' : 'text-error-600'
                        }`}>
                          {testCase.passed ? (
                            <CheckCircle className="w-4 h-4" />
                          ) : (
                            <AlertCircle className="w-4 h-4" />
                          )}
                          {testCase.passed ? 'Passed' : 'Failed'}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-secondary-600 mb-2">{testCase.description}</p>
                    <div className="text-xs">
                      <div className="mb-1">
                        <span className="font-medium text-secondary-700">Input:</span>
                        <code className="ml-1 bg-secondary-100 px-1 rounded">{testCase.input}</code>
                      </div>
                      <div>
                        <span className="font-medium text-secondary-700">Expected:</span>
                        <code className="ml-1 bg-secondary-100 px-1 rounded">{testCase.expectedOutput}</code>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Output panel */}
      {showOutput && (
        <div className="border-t border-secondary-200 bg-secondary-50">
          <div className="flex items-center justify-between p-3 border-b border-secondary-200">
            <h3 className="font-semibold text-secondary-900 flex items-center gap-2">
              <Terminal className="w-4 h-4" />
              Output
            </h3>
            <button
              onClick={() => setShowOutput(false)}
              className="text-secondary-600 hover:text-secondary-800"
            >
              <EyeOff className="w-4 h-4" />
            </button>
          </div>
          
          <div ref={outputRef} className="p-4 max-h-48 overflow-y-auto">
            {isRunning ? (
              <div className="flex items-center gap-2 text-secondary-600">
                <LoadingSpinner size="sm" />
                <span>Executing code...</span>
              </div>
            ) : executionResult ? (
              <div>
                {executionResult.success ? (
                  <div className="text-success-700">
                    <div className="flex items-center gap-2 mb-2">
                      <CheckCircle className="w-4 h-4" />
                      <span className="font-medium">Execution successful</span>
                      <span className="text-sm text-secondary-600">
                        ({executionResult.executionTime}ms)
                      </span>
                    </div>
                    {executionResult.output && (
                      <pre className="bg-white p-3 rounded border text-sm text-secondary-900 overflow-x-auto">
                        {executionResult.output}
                      </pre>
                    )}
                  </div>
                ) : (
                  <div className="text-error-700">
                    <div className="flex items-center gap-2 mb-2">
                      <AlertCircle className="w-4 h-4" />
                      <span className="font-medium">Execution failed</span>
                    </div>
                    {executionResult.error && (
                      <pre className="bg-error-50 border border-error-200 p-3 rounded text-sm text-error-800 overflow-x-auto">
                        {executionResult.error}
                      </pre>
                    )}
                  </div>
                )}
              </div>
            ) : (
              <div className="text-secondary-500 text-sm">
                Click "Run" to execute your code
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

export default CodeEditor