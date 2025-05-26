<h1 align="center">Hireonix - Applicant Tracking System</h1>

<p align="center">
  <sub>A simplified ATS (Applicant Tracking System) that processes and stores resumes with NLP capabilities.</sub>
</p>

<br>

## Project Structure

```
hireonix/
├── src/                    # Source code
│   ├── db/                # Database related code
│   │   └── mongoClient.js # MongoDB connection handling
│   ├── helpers/           # Helper functions
│   │   └── error.js      # Error handling utilities
│   ├── middlewares/       # Express middlewares
│   │   └── httpLogger.js  # HTTP request logging
│   ├── routes/           # API routes
│   │   └── index.js      # Main router
│   ├── services/         # Business logic
│   │   └── profileService.js # Profile management
│   ├── utils/            # Utility functions
│   │   ├── extractIdentifiers.js # Resume parsing
│   │   ├── healthCheck.js       # Server health check
│   │   └── logger.js            # Logging utility
│   └── index.js          # Application entry point
├── scripts/              # Utility scripts
│   └── initDb.js        # Database initialization
├── .env                 # Environment variables
└── package.json         # Project dependencies
```

## Detailed Component Breakdown

### 1. Database Connection (`src/db/mongoClient.js`)
```javascript
const { MongoClient } = require("mongodb");

let db;
const DB_NAME = 'hireonix';

// Maintains a single database connection throughout the application
const connectToDatabase = async () => {
  if (db) return db;  // Reuse existing connection if available

  const client = new MongoClient(process.env.MONGO_URI);
  await client.connect();
  db = client.db(DB_NAME);
  console.log("MongoDB connected to database:", DB_NAME);
  return db;
};

// Gets the Profiles collection for storing resumes
const getProfilesCollection = async () => {
  const database = await connectToDatabase();
  return database.collection("Profiles");
};
```

### 2. Error Handling (`src/helpers/error.js`)
```javascript
class ErrorHandler extends Error {
  constructor(statusCode, message) {
    super();
    this.statusCode = statusCode;
    this.message = message;
  }
}

// Formats error responses consistently
const handleError = (err, res) => {
  const { statusCode, message } = err;
  res.status(statusCode).json({
    status: 'error',
    statusCode,
    message,
  });
};
```

### 3. HTTP Logging (`src/middlewares/httpLogger.js`)
```javascript
const morgan = require('morgan');
const logger = require('../utils/logger');

// Creates a stream for morgan to write logs
const stream = {
  write: (message) => logger.info(message),
};

// Logs HTTP requests in combined format
const morganMiddleware = morgan('combined', { stream });
```

### 4. Logging Utility (`src/utils/logger.js`)
```javascript
const winston = require('winston');

// Define log levels and colors
const levels = {
  error: 0,
  warn: 1,
  info: 2,
  http: 3,
  debug: 4,
};

// Configure winston logger with timestamp and colors
const Logger = winston.createLogger({
  levels,
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.colorize(),
    winston.format.printf()
  ),
  transports: [new winston.transports.Console()],
});
```

### 5. Resume Processing (`src/services/profileService.js`)
```javascript
const crypto = require("crypto");

const storeProfile = async (input) => {
  const { fileName, fileContent } = input;

  // Extract name and email from resume
  const identifiers = extractIdentifiers(fileContent);
  const { name, email } = identifiers;

  // Create unique ID for the profile
  const combinedKey = `${name.toLowerCase().trim()}_${email.toLowerCase().trim()}`;
  const profileId = crypto.createHash("md5").update(combinedKey).digest("hex");

  // Prepare profile document
  const profile = {
    _id: profileId,
    name,
    email,
    fileName,
    fileContent,
    createdAt: new Date(),
    updatedAt: new Date()
  };

  // Store in database with upsert (update if exists, insert if not)
  const collection = await getProfilesCollection();
  await collection.updateOne(
    { _id: profileId },
    { $set: profile },
    { upsert: true }
  );

  return { profileId };
};
```

### 6. Resume Parsing (`src/utils/extractIdentifiers.js`)
```javascript
const extractIdentifiers = (text) => {
  // Extract email using regex
  const emailMatch = text.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-z]{2,}/);
  
  // Extract name (assumes format: First Last)
  const nameMatch = text.match(/([A-Z][a-z]+\s[A-Z][a-z]+)/);

  return {
    name: nameMatch ? nameMatch[0] : "Unknown",
    email: emailMatch ? emailMatch[0] : "",
  };
};
```

### 7. Main Application (`src/index.js`)
```javascript
const express = require('express');
const app = express();

// Apply middlewares
app.use(httpLogger);
app.use(express.json());
app.use(cookieParser());

// Set up routes
app.use('/', router);

// Error handling
app.use((_req, _res, next) => {
  next(createError(404));
});
app.use(errorHandler);

// Start server
const port = process.env.PORT || '8000';
app.listen(port, () => {
  console.info(`Server is listening on port ${port}`);
});
```

## Application Flow

1. **Initial Setup**
   - Environment variables are loaded from `.env`
   - MongoDB connection is established
   - Express server is configured with middlewares
   - Routes are registered

2. **Database Initialization** (`scripts/initDb.js`)
   - Connects to MongoDB Atlas
   - Creates 'hireonix' database
   - Creates 'Profiles' collection
   - Sets up email index for faster queries
   - Inserts test profile using actual application logic

3. **Resume Upload Flow**
   - Client sends POST request with resume file
   - Express parses the request
   - `httpLogger` logs the request
   - Request reaches profile service
   - `extractIdentifiers` parses name and email
   - Unique ID is generated from name and email
   - Profile is stored in MongoDB
   - Response is sent back to client

4. **Error Handling**
   - All errors are caught and formatted consistently
   - HTTP errors (404, etc.) are handled gracefully
   - Database errors are caught and reported
   - Logging happens at appropriate levels

## Key Differences from Mongoose
Unlike Mongoose:
1. We use the native MongoDB driver
2. No schema definitions (more flexible)
3. Manual validation in services
4. Direct collection operations
5. No built-in middleware system

## Environment Variables
```env
NODE_ENV=dev
PORT=8000
MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/
MONGO_DB_NAME=hireonix
```

## Getting Started
1. Clone the repository
2. Copy `.env.example` to `.env` and fill in MongoDB credentials
3. Install dependencies: `npm install`
4. Initialize database: `npm run init-db`
5. Start the server: `npm run dev`

## API Endpoints
- `GET /` - Health check
- `POST /profile` - Upload resume (implementation pending)
- Additional endpoints to be added
