#!/usr/bin/env node

/**
 * Optimization script for EduAI Tutor
 * Performs post-build optimizations
 */

const fs = require('fs')
const path = require('path')

const DIST_DIR = path.join(__dirname, '..', 'dist')

console.log('⚡ Running post-build optimizations...')

try {
  // Check if dist directory exists
  if (!fs.existsSync(DIST_DIR)) {
    console.error('❌ Dist directory not found. Run build first.')
    process.exit(1)
  }

  let optimizations = 0

  // Remove source maps in production if needed
  if (process.env.NODE_ENV === 'production' && process.env.REMOVE_SOURCEMAPS === 'true') {
    const files = fs.readdirSync(DIST_DIR, { recursive: true })
    files.forEach(file => {
      if (typeof file === 'string' && file.endsWith('.map')) {
        const mapPath = path.join(DIST_DIR, file)
        if (fs.existsSync(mapPath)) {
          fs.unlinkSync(mapPath)
          optimizations++
          console.log(`🗑️  Removed source map: ${file}`)
        }
      }
    })
  }

  // Generate build info
  const buildInfo = {
    timestamp: new Date().toISOString(),
    version: process.env.npm_package_version || '1.0.0',
    environment: process.env.NODE_ENV || 'development',
    optimizations: optimizations
  }

  fs.writeFileSync(
    path.join(DIST_DIR, 'build-info.json'),
    JSON.stringify(buildInfo, null, 2)
  )

  console.log('📊 Generated build-info.json')
  console.log(`✅ Optimization complete! Applied ${optimizations} optimizations.`)
  
} catch (error) {
  console.error('❌ Error during optimization:', error.message)
  process.exit(1)
}