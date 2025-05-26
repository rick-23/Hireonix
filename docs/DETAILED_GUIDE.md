# Detailed Guide: From Mongoose to Native MongoDB

## Key Concepts for Mongoose Users

### 1. Connection Handling
**Mongoose Way:**
```javascript
// Mongoose handles connection pooling automatically
mongoose.connect('mongodb://url');
const UserSchema = new mongoose.Schema({ name: String });
const User = mongoose.model('User', UserSchema);
```

**Native MongoDB Way:**
```javascript
// We manage the connection ourselves
let db;
const connectToDatabase = async () => {
  if (db) return db;  // Connection pooling
  const client = new MongoClient(MONGO_URI);
  await client.connect();
  db = client.db(DB_NAME);
  return db;
};
```

### 2. Schema Definition
**Mongoose Way:**
```javascript
const ProfileSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  createdAt: { type: Date, default: Date.now }
});
```

**Native MongoDB Way:**
```javascript
// No schema! We validate in our service layer
const profile = {
  name,
  email,
  createdAt: new Date(),
  // Structure is flexible
  additionalField: someValue
};

// Validation happens in the service
if (!email || !name) {
  throw new Error("Missing required fields");
}
```

### 3. Database Operations
**Mongoose Way:**
```javascript
// Mongoose provides methods like findOne, updateOne
await Profile.findOne({ email });
await Profile.updateOne({ email }, { $set: { name } });
```

**Native MongoDB Way:**
```javascript
const collection = await getProfilesCollection();
await collection.findOne({ email });
await collection.updateOne(
  { email },
  { $set: { name } }
);
```

## Step-by-Step Flow Explanation

### 1. Database Connection (`mongoClient.js`)
```javascript
const connectToDatabase = async () => {
  if (db) return db;  // ← Reuse existing connection
  
  const client = new MongoClient(process.env.MONGO_URI);
  await client.connect();  // ← Actual connection happens here
  
  db = client.db(DB_NAME);  // ← Select database
  return db;
};
```
- Unlike Mongoose, we manually manage the connection
- We cache the connection in the `db` variable
- Each operation needs to get a fresh reference to the collection

### 2. Profile Storage Flow
```javascript
// 1. Client sends data
const input = {
  fileName: 'resume.pdf',
  fileContent: 'John Smith\njohn@example.com'
};

// 2. Extract information (extractIdentifiers.js)
const identifiers = extractIdentifiers(fileContent);
// Uses regex to find name and email
// Returns { name: 'John Smith', email: 'john@example.com' }

// 3. Generate unique ID (profileService.js)
const combinedKey = `${name.toLowerCase()}_${email.toLowerCase()}`;
const profileId = crypto.createHash("md5").update(combinedKey).digest("hex");

// 4. Store in database (profileService.js)
const collection = await getProfilesCollection();
await collection.updateOne(
  { _id: profileId },  // ← Find by ID
  { $set: profile },   // ← Update these fields
  { upsert: true }     // ← Create if doesn't exist
);
```

### 3. Error Handling Flow
```javascript
try {
  // 1. Attempt database operation
  await collection.updateOne(...);
} catch (error) {
  // 2. Error is caught in service
  if (error.code === 11000) {
    // Duplicate key error
    return { status: "exists" };
  }
  
  // 3. Error is passed to error handler
  throw new ErrorHandler(500, error.message);
}

// 4. Global error handler formats response
app.use((err, req, res, next) => {
  handleError(err, res);
});
```

## Common Operations Without Mongoose

### Finding Documents
```javascript
// Get collection reference
const collection = await getProfilesCollection();

// Find one document
const profile = await collection.findOne({ email });

// Find many documents
const profiles = await collection.find({ 
  createdAt: { $gt: new Date('2024-01-01') }
}).toArray();

// Count documents
const count = await collection.countDocuments({ status: 'active' });
```

### Updating Documents
```javascript
// Update one document
await collection.updateOne(
  { email },          // filter
  { $set: { name } }  // update
);

// Update many documents
await collection.updateMany(
  { status: 'pending' },
  { $set: { status: 'active' } }
);

// Upsert (update or insert)
await collection.updateOne(
  { email },
  { $set: profile },
  { upsert: true }
);
```

### Aggregation
```javascript
// Group and count
const result = await collection.aggregate([
  { $group: { 
    _id: '$status',
    count: { $sum: 1 }
  }}
]).toArray();
```

## Testing the Setup

1. First, test database connection:
```bash
node scripts/initDb.js
```
This should:
- Connect to MongoDB
- Create database and collection
- Add test profile
- Show success message

2. Check MongoDB Atlas:
- Log into Atlas
- Find your cluster
- Look for 'hireonix' database
- Check 'Profiles' collection
- Should see test profile

3. Common Issues:
- Connection string format
- Network access (IP whitelist)
- Database user permissions
- Collection/database names case sensitivity
