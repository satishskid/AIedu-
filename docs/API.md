# API Documentation

This document describes the API endpoints available in the EduAI Tutor platform.

## 🔗 Base URL

- **Development**: `http://localhost:3000`
- **Production**: `https://your-domain.com`

## 🔐 Authentication

Most endpoints require authentication. The platform uses JWT tokens for authentication.

### Authentication Headers

```http
Authorization: Bearer <jwt_token>
Content-Type: application/json
```

## 📊 Health Check

### GET /.netlify/functions/health-check

Returns the current health status of the application.

**Response:**
```json
{
  "status": "healthy",
  "timestamp": "2024-01-15T10:30:00Z",
  "checks": {
    "environment": {
      "status": "healthy",
      "message": "All required environment variables are set",
      "variables": {
        "VITE_LICENSE_SECRET_KEY": "✓ Set",
        "VITE_ADMIN_EMAIL": "✓ Set"
      }
    },
    "network": {
      "status": "healthy",
      "message": "Network connectivity is working",
      "latency": "45ms"
    },
    "system": {
      "status": "healthy",
      "message": "System resources are within normal limits",
      "memory": {
        "used": "256MB",
        "total": "1GB",
        "percentage": 25
      }
    }
  }
}
```

**Status Codes:**
- `200 OK` - System is healthy
- `503 Service Unavailable` - System has issues

## 🔑 Authentication Endpoints

### POST /api/auth/login

Authenticate a user and receive a JWT token.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "password123",
  "role": "student" // optional: "student", "teacher", "admin"
}
```

**Response:**
```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "user123",
    "email": "user@example.com",
    "name": "John Doe",
    "role": "student",
    "school": "Example School",
    "classroom": "Class A"
  },
  "expiresIn": 3600
}
```

**Status Codes:**
- `200 OK` - Login successful
- `401 Unauthorized` - Invalid credentials
- `400 Bad Request` - Missing required fields

### POST /api/auth/logout

Logout the current user and invalidate the token.

**Headers:**
```http
Authorization: Bearer <jwt_token>
```

**Response:**
```json
{
  "success": true,
  "message": "Logged out successfully"
}
```

### POST /api/auth/refresh

Refresh an expired JWT token.

**Request Body:**
```json
{
  "refreshToken": "refresh_token_here"
}
```

**Response:**
```json
{
  "success": true,
  "token": "new_jwt_token_here",
  "expiresIn": 3600
}
```

## 📜 License Management

### GET /api/license/status

Get the current license status.

**Response:**
```json
{
  "success": true,
  "license": {
    "id": "license123",
    "school": "Example School",
    "status": "active",
    "expiresAt": "2024-12-31T23:59:59Z",
    "maxUsers": 500,
    "currentUsers": 245,
    "features": {
      "aiTutor": true,
      "gamification": true,
      "analytics": true,
      "multiClassroom": true
    }
  }
}
```

### POST /api/license/activate

Activate a new license.

**Request Body:**
```json
{
  "licenseKey": "EDUAI-XXXX-XXXX-XXXX-XXXX",
  "school": "Example School",
  "adminEmail": "admin@school.edu"
}
```

**Response:**
```json
{
  "success": true,
  "message": "License activated successfully",
  "license": {
    "id": "license123",
    "status": "active",
    "expiresAt": "2024-12-31T23:59:59Z"
  }
}
```

### POST /api/license/validate

Validate a license key.

**Request Body:**
```json
{
  "licenseKey": "EDUAI-XXXX-XXXX-XXXX-XXXX"
}
```

**Response:**
```json
{
  "success": true,
  "valid": true,
  "license": {
    "school": "Example School",
    "maxUsers": 500,
    "expiresAt": "2024-12-31T23:59:59Z"
  }
}
```

## 👥 User Management

### GET /api/users

Get a list of users (admin/teacher only).

**Query Parameters:**
- `role` - Filter by role (student, teacher, admin)
- `school` - Filter by school
- `classroom` - Filter by classroom
- `page` - Page number (default: 1)
- `limit` - Items per page (default: 20)

**Response:**
```json
{
  "success": true,
  "users": [
    {
      "id": "user123",
      "email": "student@example.com",
      "name": "John Doe",
      "role": "student",
      "school": "Example School",
      "classroom": "Class A",
      "createdAt": "2024-01-01T00:00:00Z",
      "lastActive": "2024-01-15T10:30:00Z",
      "stats": {
        "lessonsCompleted": 15,
        "totalPoints": 1250,
        "streak": 7
      }
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 245,
    "pages": 13
  }
}
```

### POST /api/users

Create a new user (admin/teacher only).

**Request Body:**
```json
{
  "email": "newuser@example.com",
  "name": "Jane Smith",
  "role": "student",
  "school": "Example School",
  "classroom": "Class A",
  "password": "temporaryPassword123"
}
```

**Response:**
```json
{
  "success": true,
  "user": {
    "id": "user456",
    "email": "newuser@example.com",
    "name": "Jane Smith",
    "role": "student",
    "school": "Example School",
    "classroom": "Class A",
    "createdAt": "2024-01-15T10:30:00Z"
  }
}
```

### PUT /api/users/:id

Update a user's information.

**Request Body:**
```json
{
  "name": "Updated Name",
  "classroom": "Class B",
  "email": "updated@example.com"
}
```

**Response:**
```json
{
  "success": true,
  "user": {
    "id": "user123",
    "email": "updated@example.com",
    "name": "Updated Name",
    "classroom": "Class B",
    "updatedAt": "2024-01-15T10:30:00Z"
  }
}
```

### DELETE /api/users/:id

Delete a user (admin only).

**Response:**
```json
{
  "success": true,
  "message": "User deleted successfully"
}
```

## 📚 Lessons & Content

### GET /api/lessons

Get available lessons.

**Query Parameters:**
- `subject` - Filter by subject (javascript, python, html, css)
- `difficulty` - Filter by difficulty (beginner, intermediate, advanced)
- `completed` - Filter by completion status (true/false)

**Response:**
```json
{
  "success": true,
  "lessons": [
    {
      "id": "lesson123",
      "title": "Introduction to JavaScript",
      "description": "Learn the basics of JavaScript programming",
      "subject": "javascript",
      "difficulty": "beginner",
      "estimatedTime": 30,
      "points": 100,
      "prerequisites": [],
      "completed": false,
      "progress": 0
    }
  ]
}
```

### GET /api/lessons/:id

Get a specific lesson with content.

**Response:**
```json
{
  "success": true,
  "lesson": {
    "id": "lesson123",
    "title": "Introduction to JavaScript",
    "content": {
      "sections": [
        {
          "type": "text",
          "content": "JavaScript is a programming language..."
        },
        {
          "type": "code",
          "language": "javascript",
          "content": "console.log('Hello, World!');"
        },
        {
          "type": "exercise",
          "prompt": "Write a function that adds two numbers",
          "startingCode": "function add(a, b) {\n  // Your code here\n}",
          "solution": "function add(a, b) {\n  return a + b;\n}",
          "tests": [
            {
              "input": [2, 3],
              "expected": 5
            }
          ]
        }
      ]
    }
  }
}
```

### POST /api/lessons/:id/complete

Mark a lesson as completed.

**Request Body:**
```json
{
  "timeSpent": 1800, // seconds
  "score": 95,
  "exercises": [
    {
      "id": "exercise1",
      "completed": true,
      "attempts": 2,
      "code": "function add(a, b) { return a + b; }"
    }
  ]
}
```

**Response:**
```json
{
  "success": true,
  "completion": {
    "lessonId": "lesson123",
    "completedAt": "2024-01-15T10:30:00Z",
    "score": 95,
    "pointsEarned": 100,
    "achievements": [
      {
        "id": "first_lesson",
        "name": "First Steps",
        "description": "Complete your first lesson"
      }
    ]
  }
}
```

## 🎮 Gamification

### GET /api/gamification/profile

Get user's gamification profile.

**Response:**
```json
{
  "success": true,
  "profile": {
    "userId": "user123",
    "level": 5,
    "totalPoints": 1250,
    "currentStreak": 7,
    "longestStreak": 15,
    "badges": [
      {
        "id": "first_lesson",
        "name": "First Steps",
        "description": "Complete your first lesson",
        "earnedAt": "2024-01-01T10:00:00Z"
      }
    ],
    "achievements": {
      "lessonsCompleted": 15,
      "exercisesSolved": 45,
      "perfectScores": 8,
      "helpfulPeer": 3
    }
  }
}
```

### GET /api/gamification/leaderboard

Get the leaderboard.

**Query Parameters:**
- `scope` - Leaderboard scope (classroom, school, global)
- `period` - Time period (week, month, all)
- `limit` - Number of entries (default: 10)

**Response:**
```json
{
  "success": true,
  "leaderboard": [
    {
      "rank": 1,
      "userId": "user123",
      "name": "John Doe",
      "points": 1250,
      "level": 5,
      "streak": 7
    }
  ],
  "userRank": {
    "rank": 15,
    "points": 850,
    "level": 4
  }
}
```

## 📊 Analytics

### GET /api/analytics/dashboard

Get dashboard analytics (teacher/admin only).

**Query Parameters:**
- `period` - Time period (day, week, month, year)
- `classroom` - Filter by classroom
- `subject` - Filter by subject

**Response:**
```json
{
  "success": true,
  "analytics": {
    "overview": {
      "totalStudents": 245,
      "activeStudents": 180,
      "lessonsCompleted": 1250,
      "averageScore": 87.5
    },
    "engagement": {
      "dailyActiveUsers": 45,
      "averageSessionTime": 1800,
      "completionRate": 0.85
    },
    "progress": {
      "studentsOnTrack": 200,
      "studentsNeedingHelp": 25,
      "studentsExcelling": 20
    },
    "trends": {
      "weeklyProgress": [
        { "week": "2024-W01", "completions": 45 },
        { "week": "2024-W02", "completions": 52 }
      ]
    }
  }
}
```

### GET /api/analytics/student/:id

Get detailed analytics for a specific student.

**Response:**
```json
{
  "success": true,
  "analytics": {
    "student": {
      "id": "user123",
      "name": "John Doe",
      "classroom": "Class A"
    },
    "progress": {
      "lessonsCompleted": 15,
      "totalLessons": 20,
      "completionRate": 0.75,
      "averageScore": 92.3
    },
    "engagement": {
      "totalTimeSpent": 18000,
      "averageSessionTime": 1200,
      "lastActive": "2024-01-15T10:30:00Z",
      "streak": 7
    },
    "strengths": ["JavaScript", "Problem Solving"],
    "improvements": ["CSS Styling", "Debugging"],
    "recommendations": [
      "Focus on CSS fundamentals",
      "Practice debugging techniques"
    ]
  }
}
```

## 🎯 AI Tutor

### POST /api/ai/help

Get AI assistance for coding problems.

**Request Body:**
```json
{
  "code": "function add(a, b) {\n  return a + b\n}",
  "language": "javascript",
  "question": "How can I improve this function?",
  "context": {
    "lessonId": "lesson123",
    "exerciseId": "exercise1"
  }
}
```

**Response:**
```json
{
  "success": true,
  "response": {
    "explanation": "Your function is correct! Here are some improvements you could consider...",
    "suggestions": [
      "Add input validation",
      "Consider using arrow function syntax",
      "Add JSDoc comments"
    ],
    "improvedCode": "/**\n * Adds two numbers together\n * @param {number} a - First number\n * @param {number} b - Second number\n * @returns {number} Sum of a and b\n */\nconst add = (a, b) => {\n  if (typeof a !== 'number' || typeof b !== 'number') {\n    throw new Error('Both arguments must be numbers');\n  }\n  return a + b;\n};",
    "confidence": 0.95
  }
}
```

### POST /api/ai/review

Get AI code review.

**Request Body:**
```json
{
  "code": "// Student's code here",
  "language": "javascript",
  "assignment": "Create a function to calculate factorial"
}
```

**Response:**
```json
{
  "success": true,
  "review": {
    "score": 85,
    "feedback": {
      "positive": [
        "Good use of recursion",
        "Proper function naming"
      ],
      "improvements": [
        "Add input validation",
        "Handle edge cases"
      ],
      "bugs": [
        {
          "line": 3,
          "issue": "Missing base case for n = 0",
          "severity": "high"
        }
      ]
    },
    "suggestions": [
      "Consider iterative approach for better performance",
      "Add error handling for negative numbers"
    ]
  }
}
```

## 🎪 Assignments

### GET /api/assignments

Get assignments for the current user.

**Response:**
```json
{
  "success": true,
  "assignments": [
    {
      "id": "assignment123",
      "title": "Build a Calculator",
      "description": "Create a simple calculator using JavaScript",
      "dueDate": "2024-01-20T23:59:59Z",
      "status": "pending",
      "points": 200,
      "requirements": [
        "Basic arithmetic operations",
        "Clear button functionality",
        "Error handling"
      ]
    }
  ]
}
```

### POST /api/assignments/:id/submit

Submit an assignment.

**Request Body:**
```json
{
  "code": "// Student's solution code",
  "files": [
    {
      "name": "calculator.js",
      "content": "// JavaScript code"
    },
    {
      "name": "calculator.html",
      "content": "<!-- HTML code -->"
    }
  ],
  "notes": "I implemented all required features and added some extra styling."
}
```

**Response:**
```json
{
  "success": true,
  "submission": {
    "id": "submission123",
    "assignmentId": "assignment123",
    "submittedAt": "2024-01-18T15:30:00Z",
    "status": "submitted",
    "autoGrade": {
      "score": 85,
      "feedback": "Good implementation with minor improvements needed"
    }
  }
}
```

## 🔧 System Administration

### GET /api/admin/stats

Get system-wide statistics (admin only).

**Response:**
```json
{
  "success": true,
  "stats": {
    "users": {
      "total": 1250,
      "active": 980,
      "students": 1100,
      "teachers": 140,
      "admins": 10
    },
    "schools": {
      "total": 25,
      "active": 23
    },
    "usage": {
      "lessonsCompleted": 15000,
      "exercisesSolved": 45000,
      "totalTimeSpent": 180000
    },
    "performance": {
      "averageResponseTime": 120,
      "uptime": 99.9,
      "errorRate": 0.1
    }
  }
}
```

## 📝 Error Responses

All endpoints may return error responses in the following format:

```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid input data",
    "details": {
      "field": "email",
      "issue": "Invalid email format"
    }
  }
}
```

### Common Error Codes

- `VALIDATION_ERROR` - Invalid input data
- `AUTHENTICATION_ERROR` - Invalid or missing authentication
- `AUTHORIZATION_ERROR` - Insufficient permissions
- `NOT_FOUND` - Resource not found
- `RATE_LIMIT_EXCEEDED` - Too many requests
- `INTERNAL_ERROR` - Server error
- `LICENSE_EXPIRED` - License has expired
- `QUOTA_EXCEEDED` - Usage quota exceeded

## 🔄 Rate Limiting

API endpoints are rate-limited to prevent abuse:

- **Authentication**: 5 requests per minute
- **General API**: 100 requests per minute
- **AI Endpoints**: 10 requests per minute
- **File Upload**: 5 requests per minute

Rate limit headers are included in responses:

```http
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1642248000
```

## 📡 WebSocket Events

Real-time features use WebSocket connections:

### Connection

```javascript
const ws = new WebSocket('wss://your-domain.com/ws');
ws.send(JSON.stringify({
  type: 'authenticate',
  token: 'jwt_token_here'
}));
```

### Events

- `lesson_progress` - Real-time lesson progress updates
- `achievement_earned` - New achievement notifications
- `leaderboard_update` - Leaderboard changes
- `assignment_graded` - Assignment grading complete
- `peer_help_request` - Student requesting help

---

## 📞 Support

For API support:

- **Documentation**: Check this API documentation
- **GitHub Issues**: Report bugs and request features
- **Email**: api-support@yourdomain.com
- **Status Page**: https://status.yourdomain.com

---

*API Version: 1.0.0*  
*Last Updated: January 2024*