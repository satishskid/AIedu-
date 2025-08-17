#!/usr/bin/env node

/**
 * Health check script for EduAI Tutor
 * Verifies system requirements and dependencies
 */

const fs = require('fs')
const path = require('path')
const { execSync } = require('child_process')

console.log('🏥 Running health check...')

let issues = 0

try {
  // Check Node.js version
  const nodeVersion = process.version
  const majorVersion = parseInt(nodeVersion.slice(1).split('.')[0])
  
  if (majorVersion < 18) {
    console.error(`❌ Node.js version ${nodeVersion} is too old. Minimum required: 18.x`)
    issues++
  } else {
    console.log(`✅ Node.js version: ${nodeVersion}`)
  }

  // Check package.json exists
  const packagePath = path.join(__dirname, '..', 'package.json')
  if (!fs.existsSync(packagePath)) {
    console.error('❌ package.json not found')
    issues++
  } else {
    console.log('✅ package.json found')
  }

  // Check node_modules exists
  const nodeModulesPath = path.join(__dirname, '..', 'node_modules')
  if (!fs.existsSync(nodeModulesPath)) {
    console.error('❌ node_modules not found. Run: npm install')
    issues++
  } else {
    console.log('✅ node_modules found')
  }

  // Check environment file
  const envPath = path.join(__dirname, '..', '.env.local')
  if (!fs.existsSync(envPath)) {
    console.warn('⚠️  .env.local not found. Run: npm run setup-env')
  } else {
    console.log('✅ .env.local found')
  }

  // Check TypeScript config
  const tsconfigPath = path.join(__dirname, '..', 'tsconfig.json')
  if (!fs.existsSync(tsconfigPath)) {
    console.error('❌ tsconfig.json not found')
    issues++
  } else {
    console.log('✅ tsconfig.json found')
  }

  // Check if TypeScript can compile
  try {
    execSync('npx tsc --noEmit', { cwd: path.join(__dirname, '..'), stdio: 'pipe' })
    console.log('✅ TypeScript compilation check passed')
  } catch (error) {
    console.warn('⚠️  TypeScript compilation has issues')
  }

  // Summary
  if (issues === 0) {
    console.log('\n🎉 Health check passed! System is ready.')
    process.exit(0)
  } else {
    console.log(`\n❌ Health check failed with ${issues} issue(s). Please fix the issues above.`)
    process.exit(1)
  }
  
} catch (error) {
  console.error('❌ Error during health check:', error.message)
  process.exit(1)
}