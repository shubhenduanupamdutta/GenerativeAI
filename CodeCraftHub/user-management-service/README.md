# User Management Service - CodeCraftHub

## Overview

The User Management Service is a core microservice of the CodeCraftHub learning platform, responsible for handling user authentication, authorization, profile management, and learning preferences. Built with Node.js, MongoDB, and Redis, it provides a secure and scalable foundation for user-related operations.

## Features

### 🔐 Authentication & Security
- JWT-based authentication with refresh tokens
- Password hashing with bcrypt (configurable rounds)
- Rate limiting and brute force protection
- Account lockout after failed login attempts
- Email verification and password reset
- Two-factor authentication support (planned)

### 👤 User Management
- User registration and profile management
- Role-based access control (RBAC)
- User search and discovery
- Account status management (active, inactive, suspended)
- Soft delete with data retention policies

### 📚 Learning Profile
- Personalized learning preferences
- Skills tracking with proficiency levels
- Learning goals and milestone management
- Progress tracking and analytics
- Learning style preferences (visual, auditory, kinesthetic, reading)

### 🎯 Personalization
- Customizable user preferences (notifications, privacy, UI)
- Location and timezone management
- Avatar upload and management
- Bio and social profile information

### 📊 Analytics & Monitoring
- User activity tracking
- Learning progress analytics
- System health monitoring
- Comprehensive logging with Winston
- Error tracking and reporting

## Technology Stack

- **Runtime**: Node.js 18+
- **Framework**: Express.js
- **Database**: MongoDB with Mongoose ODM
- **Cache**: Redis
- **Authentication**: JWT (JSON Web Tokens)
- **Validation**: Joi & Express Validator
- **Testing**: Jest with Supertest
- **Logging**: Winston
- **Security**: Helmet, CORS, Rate Limiting
- **Code Quality**: ESLint, Prettier
- **Containerization**: Docker & Docker Compose

## Project Structure

```
src/
├── config/          # Configuration files
├── controllers/     # Request handlers
├── middleware/      # Custom middleware
├── models/          # Database models
├── routes/          # API routes
├── services/        # Business logic
├── utils/           # Utility functions
├── app.js          # Express app setup
└── server.js       # Server entry point
```

## Getting Started

### Prerequisites

- Node.js 18 or higher
- MongoDB 5.0 or higher
- Redis 6.0 or higher
- npm or yarn

### Installation

1. **Clone the repository**
```bash
git clone <repository-url>
cd user-management-service
```

2. **Install dependencies**
```bash
npm install
```

3. **Set up environment variables**
```bash
cp .env.example .env
# Edit .env with your configuration
```

4. **Start with Docker (Recommended)**
```bash
docker-compose up -d
```

5. **Or start manually**
```bash
# Start MongoDB and Redis first
npm run dev
```

### Environment Configuration

Key environment variables to configure:

```env
NODE_ENV=development
PORT=3001
MONGODB_URI=mongodb://localhost:27017/codecrafthub_users
REDIS_URL=redis://localhost:6379
JWT_SECRET=your-super-secret-jwt-key
JWT_REFRESH_SECRET=your-refresh-token-secret
```

## API Documentation

### Authentication Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/v1/auth/register` | User registration |
| POST | `/api/v1/auth/login` | User login |
| POST | `/api/v1/auth/logout` | User logout |
| POST | `/api/v1/auth/refresh-token` | Refresh JWT token |
| POST | `/api/v1/auth/verify-email` | Verify email address |
| POST | `/api/v1/auth/forgot-password` | Request password reset |
| POST | `/api/v1/auth/reset-password` | Reset password |
| POST | `/api/v1/auth/change-password` | Change password |
| GET | `/api/v1/auth/me` | Get current user |

### User Management Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/users/me` | Get current user profile |
| PUT | `/api/v1/users/me` | Update current user |
| DELETE | `/api/v1/users/me` | Delete current user |
| GET | `/api/v1/users/search` | Search users |
| GET | `/api/v1/users/:userId/public` | Get public profile |

### Profile Management Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/profile` | Get user profile |
| PUT | `/api/v1/profile` | Update profile |
| POST | `/api/v1/profile/avatar` | Upload avatar |
| DELETE | `/api/v1/profile/avatar` | Delete avatar |
| GET | `/api/v1/profile/learning` | Get learning profile |
| PUT | `/api/v1/profile/learning` | Update learning profile |
| POST | `/api/v1/profile/skills` | Add skill |
| PUT | `/api/v1/profile/skills/:skillName` | Update skill |
| DELETE | `/api/v1/profile/skills/:skillName` | Remove skill |

## Security Features

### Authentication Security
- JWT tokens with configurable expiration
- Refresh token rotation
- Secure password hashing with bcrypt
- Rate limiting on authentication endpoints

### Input Validation
- Request validation with Joi and Express Validator
- SQL injection prevention with MongoDB sanitization
- XSS protection with input sanitization

### API Security
- CORS configuration
- Helmet.js for security headers
- Rate limiting per IP and endpoint
- Request size limits

## Testing

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage
```

## Development

### Code Quality

```bash
# Lint code
npm run lint

# Format code
npm run format
```

### Database Operations

```bash
# Seed database with sample data
npm run seed

# Run migrations (if applicable)
npm run migrate
```

## Deployment

### Docker Deployment

```bash
# Build and run with Docker Compose
npm run docker:build
npm run docker:run
```

### Production Considerations

1. **Environment Variables**: Set production values for all secrets
2. **Database**: Use MongoDB Atlas or managed MongoDB service
3. **Caching**: Use Redis cluster for high availability
4. **Monitoring**: Implement health checks and monitoring
5. **Logging**: Configure log aggregation and monitoring
6. **Security**: Enable HTTPS and security headers

## Monitoring & Health Checks

- Health check endpoint: `GET /health`
- Metrics endpoint: `GET /api/v1/stats` (admin only)
- Comprehensive logging with Winston
- Error tracking and alerting

## Contributing

1. Follow the existing code style and conventions
2. Write tests for new features
3. Update documentation as needed
4. Use meaningful commit messages
5. Create pull requests for code review

## License

MIT License - see LICENSE file for details

---

## This project is part of CodeCraftHub - AI powered teaching and learning platform for developers

Generated using AI for the course "Generative AI Elevate your Software Development Career" on Coursera by IBM
