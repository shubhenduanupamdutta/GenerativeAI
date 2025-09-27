const Joi = require('joi');

// User registration validation schema
const registerSchema = Joi.object({
  email: Joi.string().email().required().messages({
    'string.email': 'Please provide a valid email address',
    'any.required': 'Email is required',
  }),
  username: Joi.string().alphanum().min(3).max(30).required().messages({
    'string.alphanum': 'Username can only contain letters and numbers',
    'string.min': 'Username must be at least 3 characters long',
    'string.max': 'Username cannot exceed 30 characters',
    'any.required': 'Username is required',
  }),
  password: Joi.string()
    .min(8)
    .pattern(new RegExp('^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[@$!%*?&])[A-Za-z\\d@$!%*?&]'))
    .required()
    .messages({
      'string.min': 'Password must be at least 8 characters long',
      'string.pattern.base': 'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character',
      'any.required': 'Password is required',
    }),
  firstName: Joi.string().trim().min(1).max(50).required().messages({
    'string.min': 'First name is required',
    'string.max': 'First name cannot exceed 50 characters',
    'any.required': 'First name is required',
  }),
  lastName: Joi.string().trim().min(1).max(50).required().messages({
    'string.min': 'Last name is required',
    'string.max': 'Last name cannot exceed 50 characters',
    'any.required': 'Last name is required',
  }),
});

// User login validation schema
const loginSchema = Joi.object({
  email: Joi.string().required().messages({
    'any.required': 'Email or username is required',
  }),
  password: Joi.string().required().messages({
    'any.required': 'Password is required',
  }),
  rememberMe: Joi.boolean().optional(),
});

// Profile update validation schema
const updateProfileSchema = Joi.object({
  firstName: Joi.string().trim().min(1).max(50).optional(),
  lastName: Joi.string().trim().min(1).max(50).optional(),
  bio: Joi.string().max(500).optional().allow(''),
  phone: Joi.string().pattern(new RegExp('^\\+?[\\d\\s-()]+$')).optional().allow('').messages({
    'string.pattern.base': 'Please enter a valid phone number',
  }),
  location: Joi.object({
    country: Joi.string().max(100).optional().allow(''),
    city: Joi.string().max(100).optional().allow(''),
    timezone: Joi.string().optional().allow(''),
  }).optional(),
});

// Learning profile validation schema
const learningProfileSchema = Joi.object({
  currentLevel: Joi.string().valid('beginner', 'intermediate', 'advanced', 'expert').optional(),
  interests: Joi.array().items(Joi.string().trim()).max(20).optional(),
  preferredLearningStyle: Joi.string().valid('visual', 'auditory', 'kinesthetic', 'reading').optional(),
});

// Skill validation schema
const skillSchema = Joi.object({
  name: Joi.string().trim().min(1).max(50).required().messages({
    'string.min': 'Skill name is required',
    'string.max': 'Skill name cannot exceed 50 characters',
    'any.required': 'Skill name is required',
  }),
  level: Joi.string().valid('beginner', 'intermediate', 'advanced', 'expert').default('beginner'),
});

// Learning goal validation schema
const learningGoalSchema = Joi.object({
  title: Joi.string().trim().min(1).max(200).required().messages({
    'string.min': 'Goal title is required',
    'string.max': 'Goal title cannot exceed 200 characters',
    'any.required': 'Goal title is required',
  }),
  description: Joi.string().max(1000).optional().allow(''),
  targetDate: Joi.date().greater('now').optional().messages({
    'date.greater': 'Target date must be in the future',
  }),
});

// Preferences validation schema
const preferencesSchema = Joi.object({
  notifications: Joi.object({
    email: Joi.boolean().default(true),
    push: Joi.boolean().default(true),
    sms: Joi.boolean().default(false),
  }).optional(),
  privacy: Joi.object({
    profileVisibility: Joi.string().valid('public', 'private', 'friends').default('public'),
    showEmail: Joi.boolean().default(false),
    showPhone: Joi.boolean().default(false),
  }).optional(),
  ui: Joi.object({
    theme: Joi.string().valid('light', 'dark', 'auto').default('light'),
    language: Joi.string().default('en'),
  }).optional(),
});

// Password validation schema
const passwordSchema = Joi.object({
  currentPassword: Joi.string().required().messages({
    'any.required': 'Current password is required',
  }),
  newPassword: Joi.string()
    .min(8)
    .pattern(new RegExp('^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[@$!%*?&])[A-Za-z\\d@$!%*?&]'))
    .required()
    .messages({
      'string.min': 'New password must be at least 8 characters long',
      'string.pattern.base': 'New password must contain at least one uppercase letter, one lowercase letter, one number, and one special character',
      'any.required': 'New password is required',
    }),
});

// Email validation schema
const emailSchema = Joi.object({
  email: Joi.string().email().required().messages({
    'string.email': 'Please provide a valid email address',
    'any.required': 'Email is required',
  }),
});

// Reset password validation schema
const resetPasswordSchema = Joi.object({
  token: Joi.string().required().messages({
    'any.required': 'Reset token is required',
  }),
  password: Joi.string()
    .min(8)
    .pattern(new RegExp('^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[@$!%*?&])[A-Za-z\\d@$!%*?&]'))
    .required()
    .messages({
      'string.min': 'Password must be at least 8 characters long',
      'string.pattern.base': 'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character',
      'any.required': 'Password is required',
    }),
});

// Search validation schema
const searchSchema = Joi.object({
  q: Joi.string().min(1).max(100).optional(),
  skills: Joi.alternatives().try(
    Joi.string(),
    Joi.array().items(Joi.string())
  ).optional(),
  interests: Joi.alternatives().try(
    Joi.string(),
    Joi.array().items(Joi.string())
  ).optional(),
  level: Joi.string().valid('beginner', 'intermediate', 'advanced', 'expert').optional(),
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(10),
});

// Validation middleware factory
const validate = (schema) => {
  return (req, res, next) => {
    const { error, value } = schema.validate(req.body, {
      abortEarly: false,
      stripUnknown: true,
    });

    if (error) {
      const errorMessage = error.details.map(detail => detail.message).join(', ');
      return res.status(400).json({
        success: false,
        error: {
          message: errorMessage,
          details: error.details,
        },
      });
    }

    req.body = value;
    next();
  };
};

// Query validation middleware factory
const validateQuery = (schema) => {
  return (req, res, next) => {
    const { error, value } = schema.validate(req.query, {
      abortEarly: false,
      stripUnknown: true,
    });

    if (error) {
      const errorMessage = error.details.map(detail => detail.message).join(', ');
      return res.status(400).json({
        success: false,
        error: {
          message: errorMessage,
          details: error.details,
        },
      });
    }

    req.query = value;
    next();
  };
};

module.exports = {
  // Schemas
  registerSchema,
  loginSchema,
  updateProfileSchema,
  learningProfileSchema,
  skillSchema,
  learningGoalSchema,
  preferencesSchema,
  passwordSchema,
  emailSchema,
  resetPasswordSchema,
  searchSchema,
  
  // Middleware
  validate,
  validateQuery,
};