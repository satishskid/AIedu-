// Health check endpoint for system monitoring
exports.handler = async (event, context) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
    'Content-Type': 'application/json'
  }

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' }
  }

  try {
    const checks = await performHealthChecks()
    
    const isHealthy = checks.every(check => check.status === 'healthy')
    const statusCode = isHealthy ? 200 : 503

    return {
      statusCode,
      headers,
      body: JSON.stringify({
        status: isHealthy ? 'healthy' : 'unhealthy',
        timestamp: new Date().toISOString(),
        version: process.env.npm_package_version || '1.0.0',
        checks
      })
    }
  } catch (error) {
    console.error('Health check failed:', error)
    
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        status: 'error',
        error: error.message,
        timestamp: new Date().toISOString()
      })
    }
  }
}

async function performHealthChecks() {
  const checks = []

  // Check environment variables
  checks.push(await checkEnvironment())
  
  // Check external dependencies
  checks.push(await checkNetworkConnectivity())
  
  // Check system resources
  checks.push(await checkSystemResources())

  return checks
}

async function checkEnvironment() {
  const requiredVars = [
    'VITE_LICENSE_SECRET_KEY',
    'VITE_ADMIN_EMAIL'
  ]

  const missing = requiredVars.filter(varName => !process.env[varName])

  return {
    name: 'environment',
    status: missing.length === 0 ? 'healthy' : 'unhealthy',
    details: missing.length === 0
      ? 'All required environment variables are set'
      : `Missing environment variables: ${missing.join(', ')}`
  }
}

async function checkNetworkConnectivity() {
  try {
    const response = await fetch('https://www.google.com', {
      method: 'HEAD',
      timeout: 5000
    })

    return {
      name: 'network',
      status: response.ok ? 'healthy' : 'unhealthy',
      details: `HTTP ${response.status}`
    }
  } catch (error) {
    return {
      name: 'network',
      status: 'unhealthy',
      details: error.message
    }
  }
}

async function checkSystemResources() {
  try {
    const memoryUsage = process.memoryUsage()
    const memoryUsageMB = Math.round(memoryUsage.heapUsed / 1024 / 1024)
    
    return {
      name: 'system',
      status: memoryUsageMB < 100 ? 'healthy' : 'warning',
      details: `Memory usage: ${memoryUsageMB}MB`
    }
  } catch (error) {
    return {
      name: 'system',
      status: 'unhealthy',
      details: error.message
    }
  }
}