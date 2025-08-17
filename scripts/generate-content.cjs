#!/usr/bin/env node

/**
 * Content generation script for EduAI Tutor
 * Generates sample lessons, exercises, and curriculum content
 */

const fs = require('fs')
const path = require('path')

const CONTENT_DIR = path.join(__dirname, '..', 'content')
const DATA_DIR = path.join(__dirname, '..', 'src', 'data')

console.log('📚 Generating content...')

try {
  // Ensure directories exist
  if (!fs.existsSync(CONTENT_DIR)) {
    fs.mkdirSync(CONTENT_DIR, { recursive: true })
  }
  
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true })
  }

  const curriculumDir = path.join(CONTENT_DIR, 'curriculum')
  if (!fs.existsSync(curriculumDir)) {
    fs.mkdirSync(curriculumDir, { recursive: true })
  }

  // Generate sample curriculum structure
  const curriculumStructure = {
    name: 'Programming Fundamentals',
    description: 'Complete programming course for beginners',
    version: '1.0.0',
    modules: [
      {
        id: 'basics',
        name: 'Programming Basics',
        description: 'Introduction to programming concepts',
        lessons: [
          'intro-to-programming',
          'variables-and-data-types',
          'control-structures'
        ]
      },
      {
        id: 'intermediate',
        name: 'Intermediate Concepts',
        description: 'Functions, objects, and more',
        lessons: [
          'functions',
          'objects-and-classes',
          'error-handling'
        ]
      }
    ],
    metadata: {
      difficulty: 'beginner',
      estimatedHours: 40,
      prerequisites: [],
      tags: ['programming', 'fundamentals', 'beginner']
    }
  }

  fs.writeFileSync(
    path.join(curriculumDir, 'programming-fundamentals.json'),
    JSON.stringify(curriculumStructure, null, 2)
  )

  // Generate additional sample lessons if they don't exist
  const lessonsDir = path.join(DATA_DIR, 'lessons')
  if (!fs.existsSync(lessonsDir)) {
    fs.mkdirSync(lessonsDir, { recursive: true })
  }

  const sampleLessons = [
    {
      filename: 'variables-and-data-types.json',
      content: {
        id: 'variables-and-data-types',
        title: 'Variables and Data Types',
        description: 'Learn about different data types and how to store data in variables',
        difficulty: 'beginner',
        category: 'fundamentals',
        estimatedTime: 30,
        content: {
          introduction: 'Variables are containers for storing data values. In programming, we use different data types to represent different kinds of information.',
          example: 'let name = "Alice";\nlet age = 25;\nlet isStudent = true;'
        }
      }
    },
    {
      filename: 'control-structures.json',
      content: {
        id: 'control-structures',
        title: 'Control Structures',
        description: 'Understanding if statements, loops, and decision making in code',
        difficulty: 'beginner',
        category: 'fundamentals',
        estimatedTime: 45,
        content: {
          introduction: 'Control structures allow you to control the flow of your program execution.',
          example: 'if (age >= 18) {\n  console.log("You are an adult");\n} else {\n  console.log("You are a minor");\n}'
        }
      }
    }
  ]

  let generatedCount = 0
  sampleLessons.forEach(lesson => {
    const lessonPath = path.join(lessonsDir, lesson.filename)
    if (!fs.existsSync(lessonPath)) {
      fs.writeFileSync(lessonPath, JSON.stringify(lesson.content, null, 2))
      generatedCount++
      console.log(`📝 Generated: ${lesson.filename}`)
    }
  })

  console.log('📋 Generated curriculum structure')
  console.log(`✅ Content generation complete! Generated ${generatedCount} new files.`)
  
} catch (error) {
  console.error('❌ Error during content generation:', error.message)
  process.exit(1)
}