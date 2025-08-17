#!/usr/bin/env node

/**
 * Static page generation script for EduAI Tutor
 * Generates static HTML pages for better SEO and performance
 */

const fs = require('fs')
const path = require('path')

const STATIC_PAGES_DIR = path.join(__dirname, '..', 'static-pages')
const DIST_DIR = path.join(__dirname, '..', 'dist')

console.log('🔨 Building static pages...')

try {
  // Check if static-pages directory exists
  if (!fs.existsSync(STATIC_PAGES_DIR)) {
    console.log('📁 No static-pages directory found, skipping static page generation')
    process.exit(0)
  }

  // Check if dist directory exists
  if (!fs.existsSync(DIST_DIR)) {
    console.error('❌ Dist directory not found. Run build first.')
    process.exit(1)
  }

  // Read static pages directory
  const staticFiles = fs.readdirSync(STATIC_PAGES_DIR)
  
  if (staticFiles.length === 0) {
    console.log('📄 No static pages found, skipping generation')
    process.exit(0)
  }

  // Copy static pages to dist
  let copiedFiles = 0
  staticFiles.forEach(file => {
    const srcPath = path.join(STATIC_PAGES_DIR, file)
    const destPath = path.join(DIST_DIR, file)
    
    if (fs.statSync(srcPath).isFile()) {
      fs.copyFileSync(srcPath, destPath)
      copiedFiles++
      console.log(`📋 Copied: ${file}`)
    }
  })

  console.log(`✅ Static page generation complete! Copied ${copiedFiles} files.`)
  
} catch (error) {
  console.error('❌ Error during static page generation:', error.message)
  process.exit(1)
}