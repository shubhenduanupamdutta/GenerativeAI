const mongoose = require('mongoose');
const User = require('../src/models/User');
const config = require('../src/config');
const logger = require('../src/utils/logger');

// Sample users data
const sampleUsers = [
  {
    email: 'admin@codecrafthub.com',
    username: 'admin',
    password: 'Admin123!@#',
    firstName: 'Admin',
    lastName: 'User',
    status: 'active',
    emailVerified: true,
    bio: 'System administrator of CodeCraftHub platform',
    learningProfile: {
      currentLevel: 'expert',
      interests: ['System Administration', 'DevOps', 'Security'],
      skills: [
        { name: 'System Administration', level: 'expert', endorsements: 50 },
        { name: 'Docker', level: 'advanced', endorsements: 30 },
        { name: 'Kubernetes', level: 'advanced', endorsements: 25 },
      ],
      preferredLearningStyle: 'reading',
    },
    subscription: {
      plan: 'enterprise',
      status: 'active',
    },
  },
  {
    email: 'john.doe@example.com',
    username: 'johndoe',
    password: 'User123!@#',
    firstName: 'John',
    lastName: 'Doe',
    status: 'active',
    emailVerified: true,
    bio: 'Full-stack developer passionate about web technologies',
    phone: '+1-555-0123',
    location: {
      country: 'United States',
      city: 'San Francisco',
      timezone: 'America/Los_Angeles',
    },
    learningProfile: {
      currentLevel: 'intermediate',
      interests: ['JavaScript', 'React', 'Node.js', 'Python'],
      skills: [
        { name: 'JavaScript', level: 'advanced', endorsements: 15 },
        { name: 'React', level: 'intermediate', endorsements: 10 },
        { name: 'Node.js', level: 'intermediate', endorsements: 8 },
        { name: 'Python', level: 'beginner', endorsements: 3 },
      ],
      learningGoals: [
        {
          title: 'Master React Hooks',
          description: 'Learn advanced React hooks patterns and best practices',
          targetDate: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000), // 60 days from now
          completed: false,
        },
        {
          title: 'Learn TypeScript',
          description: 'Become proficient in TypeScript for better code quality',
          targetDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000), // 90 days from now
          completed: false,
        },
      ],
      preferredLearningStyle: 'visual',
    },
    subscription: {
      plan: 'premium',
      status: 'active',
      expiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 year from now
    },
  },
  {
    email: 'jane.smith@example.com',
    username: 'janesmith',
    password: 'User123!@#',
    firstName: 'Jane',
    lastName: 'Smith',
    status: 'active',
    emailVerified: true,
    bio: 'Data scientist exploring machine learning and AI',
    location: {
      country: 'Canada',
      city: 'Toronto',
      timezone: 'America/Toronto',
    },
    learningProfile: {
      currentLevel: 'advanced',
      interests: ['Python', 'Machine Learning', 'Data Science', 'AI'],
      skills: [
        { name: 'Python', level: 'expert', endorsements: 25 },
        { name: 'Machine Learning', level: 'advanced', endorsements: 20 },
        { name: 'TensorFlow', level: 'intermediate', endorsements: 12 },
        { name: 'Pandas', level: 'advanced', endorsements: 18 },
        { name: 'Numpy', level: 'advanced', endorsements: 16 },
      ],
      learningGoals: [
        {
          title: 'Deep Learning Specialization',
          description: 'Complete advanced deep learning courses and projects',
          targetDate: new Date(Date.now() + 120 * 24 * 60 * 60 * 1000), // 120 days from now
          completed: false,
        },
      ],
      preferredLearningStyle: 'kinesthetic',
    },
    subscription: {
      plan: 'premium',
      status: 'active',
      expiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 year from now
    },
  },
  {
    email: 'mike.wilson@example.com',
    username: 'mikewilson',
    password: 'User123!@#',
    firstName: 'Mike',
    lastName: 'Wilson',
    status: 'active',
    emailVerified: true,
    bio: 'DevOps engineer focused on cloud infrastructure and automation',
    location: {
      country: 'United Kingdom',
      city: 'London',
      timezone: 'Europe/London',
    },
    learningProfile: {
      currentLevel: 'intermediate',
      interests: ['DevOps', 'AWS', 'Docker', 'Kubernetes', 'Terraform'],
      skills: [
        { name: 'AWS', level: 'intermediate', endorsements: 12 },
        { name: 'Docker', level: 'advanced', endorsements: 15 },
        { name: 'Kubernetes', level: 'intermediate', endorsements: 8 },
        { name: 'Terraform', level: 'beginner', endorsements: 4 },
      ],
      learningGoals: [
        {
          title: 'AWS Solutions Architect Certification',
          description: 'Prepare for and pass the AWS Solutions Architect exam',
          targetDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000), // 90 days from now
          completed: false,
        },
        {
          title: 'Kubernetes Administration',
          description: 'Become proficient in Kubernetes cluster administration',
          targetDate: new Date(Date.now() + 75 * 24 * 60 * 60 * 1000), // 75 days from now
          completed: false,
        },
      ],
      preferredLearningStyle: 'auditory',
    },
    subscription: {
      plan: 'basic',
      status: 'active',
      expiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 year from now
    },
  },
  {
    email: 'sarah.johnson@example.com',
    username: 'sarahjohnson',
    password: 'User123!@#',
    firstName: 'Sarah',
    lastName: 'Johnson',
    status: 'active',
    emailVerified: true,
    bio: 'Frontend developer specializing in modern web frameworks',
    learningProfile: {
      currentLevel: 'beginner',
      interests: ['HTML', 'CSS', 'JavaScript', 'Vue.js'],
      skills: [
        { name: 'HTML', level: 'intermediate', endorsements: 7 },
        { name: 'CSS', level: 'intermediate', endorsements: 6 },
        { name: 'JavaScript', level: 'beginner', endorsements: 2 },
      ],
      learningGoals: [
        {
          title: 'Learn Vue.js',
          description: 'Build proficiency in Vue.js framework',
          targetDate: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000), // 45 days from now
          completed: false,
        },
        {
          title: 'Responsive Web Design',
          description: 'Master responsive design principles and techniques',
          targetDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
          completed: false,
        },
      ],
      preferredLearningStyle: 'visual',
    },
    subscription: {
      plan: 'free',
      status: 'active',
    },
  },
];

async function seedDatabase() {
  try {
    // Connect to database
    await mongoose.connect(config.mongodb.uri, config.mongodb.options);
    logger.info('Connected to MongoDB for seeding');

    // Clear existing users
    await User.deleteMany({});
    logger.info('Cleared existing users');

    // Create sample users
    const createdUsers = await User.create(sampleUsers);
    logger.info(`Created ${createdUsers.length} sample users`);

    // Log created users (without passwords)
    createdUsers.forEach(user => {
      logger.info(`Created user: ${user.email} (${user.username})`);
    });

    logger.info('Database seeding completed successfully');
  } catch (error) {
    logger.error('Error seeding database:', error);
    process.exit(1);
  } finally {
    await mongoose.connection.close();
    logger.info('Database connection closed');
    process.exit(0);
  }
}

// Run the seed function if this file is executed directly
if (require.main === module) {
  seedDatabase();
}

module.exports = { seedDatabase, sampleUsers };