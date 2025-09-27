# User Management Service API Documentation

## Base URL
```
http://localhost:3001/api/v1
```

## Authentication
Most endpoints require JWT authentication. Include the token in the Authorization header:
```
Authorization: Bearer <your-jwt-token>
```

## Response Format
All responses follow this format:
```json
{
  "success": boolean,
  "message": "string",
  "data": object,
  "error": {
    "message": "string",
    "details": []
  }
}
```

## Authentication Endpoints

### Register User
**POST** `/auth/register`

Register a new user account.

**Request Body:**
```json
{
  "email": "user@example.com",
  "username": "username",
  "password": "SecurePass123!",
  "firstName": "John",
  "lastName": "Doe"
}
```

**Response (201):**
```json
{
  "success": true,
  "message": "User registered successfully. Please verify your email.",
  "data": {
    "user": {
      "id": "user-id",
      "userId": "user_uuid",
      "email": "user@example.com",
      "username": "username",
      "firstName": "John",
      "lastName": "Doe",
      "status": "pending",
      "emailVerified": false
    },
    "tokens": {
      "accessToken": "jwt-token",
      "refreshToken": "refresh-token",
      "expiresIn": "7d"
    }
  }
}
```

### Login User
**POST** `/auth/login`

Authenticate user and receive tokens.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "SecurePass123!",
  "rememberMe": false
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "user": {
      "id": "user-id",
      "userId": "user_uuid",
      "email": "user@example.com",
      "username": "username",
      "firstName": "John",
      "lastName": "Doe",
      "avatar": "/uploads/avatars/avatar.jpg",
      "status": "active",
      "emailVerified": true,
      "lastLoginAt": "2024-01-01T12:00:00.000Z"
    },
    "tokens": {
      "accessToken": "jwt-token",
      "refreshToken": "refresh-token",
      "expiresIn": "7d"
    }
  }
}
```

### Logout User
**POST** `/auth/logout`

Logout current user (requires authentication).

**Response (200):**
```json
{
  "success": true,
  "message": "Logout successful"
}
```

### Refresh Token
**POST** `/auth/refresh-token`

Refresh access token using refresh token.

**Request Body:**
```json
{
  "refreshToken": "refresh-token"
}
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "accessToken": "new-jwt-token",
    "expiresIn": "7d"
  }
}
```

### Verify Email
**POST** `/auth/verify-email`

Verify user email address.

**Request Body:**
```json
{
  "token": "email-verification-token"
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Email verified successfully"
}
```

### Resend Verification
**POST** `/auth/resend-verification`

Resend email verification token.

**Request Body:**
```json
{
  "email": "user@example.com"
}
```

### Forgot Password
**POST** `/auth/forgot-password`

Request password reset token.

**Request Body:**
```json
{
  "email": "user@example.com"
}
```

### Reset Password
**POST** `/auth/reset-password`

Reset password using reset token.

**Request Body:**
```json
{
  "token": "reset-token",
  "password": "NewSecurePass123!"
}
```

### Change Password
**POST** `/auth/change-password`

Change password (requires authentication).

**Request Body:**
```json
{
  "currentPassword": "CurrentPass123!",
  "newPassword": "NewSecurePass123!"
}
```

### Get Current User
**GET** `/auth/me`

Get current user information (requires authentication).

**Response (200):**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "user-id",
      "userId": "user_uuid",
      "email": "user@example.com",
      "username": "username",
      "firstName": "John",
      "lastName": "Doe",
      "fullName": "John Doe",
      "avatar": "/uploads/avatars/avatar.jpg",
      "bio": "User bio",
      "phone": "+1-555-0123",
      "location": {
        "country": "United States",
        "city": "San Francisco",
        "timezone": "America/Los_Angeles"
      },
      "learningProfile": {
        "currentLevel": "intermediate",
        "interests": ["JavaScript", "React"],
        "skills": [
          {
            "name": "JavaScript",
            "level": "advanced",
            "endorsements": 15
          }
        ],
        "learningGoals": [],
        "preferredLearningStyle": "visual"
      },
      "preferences": {
        "notifications": {
          "email": true,
          "push": true,
          "sms": false
        },
        "privacy": {
          "profileVisibility": "public",
          "showEmail": false,
          "showPhone": false
        },
        "ui": {
          "theme": "light",
          "language": "en"
        }
      },
      "subscription": {
        "plan": "premium",
        "status": "active",
        "expiresAt": "2024-12-31T23:59:59.999Z"
      },
      "status": "active",
      "emailVerified": true,
      "createdAt": "2024-01-01T12:00:00.000Z",
      "lastActiveAt": "2024-01-01T12:00:00.000Z"
    }
  }
}
```

## User Management Endpoints

### Get All Users (Admin Only)
**GET** `/users`

Get paginated list of all users.

**Query Parameters:**
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 10)
- `status` (optional): Filter by status
- `search` (optional): Search in name, email, username
- `sortBy` (optional): Sort field (default: createdAt)
- `sortOrder` (optional): Sort order - asc/desc (default: desc)

### Get Current User
**GET** `/users/me`

Get current user profile (requires authentication).

### Update Current User
**PUT** `/users/me`

Update current user profile (requires authentication).

**Request Body:**
```json
{
  "firstName": "John",
  "lastName": "Doe",
  "bio": "Updated bio",
  "phone": "+1-555-0123",
  "location": {
    "country": "United States",
    "city": "San Francisco",
    "timezone": "America/Los_Angeles"
  },
  "preferences": {
    "notifications": {
      "email": true,
      "push": false
    }
  }
}
```

### Delete Current User
**DELETE** `/users/me`

Soft delete current user account (requires authentication).

### Search Users
**GET** `/users/search`

Search for public users.

**Query Parameters:**
- `q` (optional): Search query
- `skills` (optional): Filter by skills
- `interests` (optional): Filter by interests
- `level` (optional): Filter by learning level
- `page` (optional): Page number
- `limit` (optional): Items per page

### Get Public Profile
**GET** `/users/{userId}/public`

Get public profile of a user.

### Get User Preferences
**GET** `/users/me/preferences`

Get current user preferences (requires authentication).

### Update User Preferences
**PUT** `/users/me/preferences`

Update current user preferences (requires authentication).

### Get Learning Profile
**GET** `/users/me/learning-profile`

Get current user learning profile (requires authentication).

### Update Learning Profile
**PUT** `/users/me/learning-profile`

Update current user learning profile (requires authentication).

### Add Skill
**POST** `/users/me/skills`

Add a skill to user profile (requires authentication).

**Request Body:**
```json
{
  "name": "JavaScript",
  "level": "intermediate"
}
```

### Update Skill
**PUT** `/users/me/skills/{skillId}`

Update a user skill (requires authentication).

### Remove Skill
**DELETE** `/users/me/skills/{skillId}`

Remove a skill from user profile (requires authentication).

### Add Learning Goal
**POST** `/users/me/goals`

Add a learning goal (requires authentication).

**Request Body:**
```json
{
  "title": "Learn React Hooks",
  "description": "Master advanced React hooks patterns",
  "targetDate": "2024-06-01T00:00:00.000Z"
}
```

### Update Learning Goal
**PUT** `/users/me/goals/{goalId}`

Update a learning goal (requires authentication).

### Remove Learning Goal
**DELETE** `/users/me/goals/{goalId}`

Remove a learning goal (requires authentication).

### Get User Statistics
**GET** `/users/me/stats`

Get current user statistics (requires authentication).

**Response (200):**
```json
{
  "success": true,
  "data": {
    "stats": {
      "accountAge": 30,
      "skillsCount": 5,
      "goalsCount": 3,
      "completedGoals": 1,
      "lastActive": "2024-01-01T12:00:00.000Z",
      "emailVerified": true,
      "subscriptionPlan": "premium"
    }
  }
}
```

### Get System Statistics (Admin Only)
**GET** `/users/stats`

Get system-wide user statistics.

## Profile Management Endpoints

### Get Profile
**GET** `/profile`

Get current user profile (requires authentication).

### Update Profile
**PUT** `/profile`

Update current user profile (requires authentication).

### Upload Avatar
**POST** `/profile/avatar`

Upload user avatar image (requires authentication).

**Request:** Multipart form data with 'avatar' file field.

**Response (200):**
```json
{
  "success": true,
  "message": "Avatar uploaded successfully",
  "data": {
    "avatar": "/uploads/avatars/avatar-123456789.jpg"
  }
}
```

### Delete Avatar
**DELETE** `/profile/avatar`

Delete user avatar (requires authentication).

### Get Learning Profile
**GET** `/profile/learning`

Get learning profile (requires authentication).

### Update Learning Profile
**PUT** `/profile/learning`

Update learning profile (requires authentication).

### Skills Management
- **POST** `/profile/skills` - Add skill
- **PUT** `/profile/skills/{skillName}` - Update skill
- **DELETE** `/profile/skills/{skillName}` - Remove skill

### Goals Management
- **POST** `/profile/goals` - Add learning goal
- **PUT** `/profile/goals/{goalId}` - Update learning goal
- **DELETE** `/profile/goals/{goalId}` - Remove learning goal
- **PATCH** `/profile/goals/{goalId}/complete` - Mark goal as completed

### Preferences Management
- **GET** `/profile/preferences` - Get preferences
- **PUT** `/profile/preferences` - Update preferences

### Privacy Settings
- **GET** `/profile/privacy` - Get privacy settings
- **PUT** `/profile/privacy` - Update privacy settings

## Error Responses

### 400 Bad Request
```json
{
  "success": false,
  "error": {
    "message": "Validation error message",
    "details": []
  }
}
```

### 401 Unauthorized
```json
{
  "success": false,
  "error": {
    "message": "Access denied. No token provided."
  }
}
```

### 403 Forbidden
```json
{
  "success": false,
  "error": {
    "message": "Access denied. Insufficient permissions."
  }
}
```

### 404 Not Found
```json
{
  "success": false,
  "error": {
    "message": "User not found"
  }
}
```

### 409 Conflict
```json
{
  "success": false,
  "error": {
    "message": "User with this email already exists"
  }
}
```

### 429 Too Many Requests
```json
{
  "success": false,
  "error": {
    "message": "Too many requests, please try again later"
  }
}
```

### 500 Internal Server Error
```json
{
  "success": false,
  "error": {
    "message": "Internal Server Error"
  }
}
```

## Rate Limiting

- Authentication endpoints: 5 requests per 15 minutes
- General endpoints: 10 requests per 15 minutes
- File upload endpoints: 3 requests per 5 minutes

## File Upload Constraints

- Avatar uploads: Maximum 5MB
- Supported formats: JPEG, PNG, GIF
- Files are stored in `/uploads/avatars/` directory