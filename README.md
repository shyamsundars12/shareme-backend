# Share Me Backend

Backend API for the Share Me notes sharing platform built with Node.js, Express, and MongoDB.

## Features

- **User Authentication**: JWT-based authentication with bcrypt password hashing
- **File Upload**: PDF file upload with validation and storage
- **Link Sharing**: External link sharing functionality
- **Database**: MongoDB Atlas integration with Mongoose ODM
- **Security**: Input validation, file type validation, and route protection

## API Endpoints

### Authentication Routes (`/api/auth`)

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/register` | Register new user | No |
| POST | `/login` | User login | No |
| GET | `/profile` | Get user profile | Yes |

### Notes Routes (`/api/notes`)

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/upload-pdf` | Upload PDF file | Yes |
| POST | `/share-link` | Share external link | Yes |
| GET | `/` | Get all notes | Yes |
| GET | `/type/:type` | Get notes by type | Yes |
| GET | `/my-notes` | Get user's notes | Yes |
| DELETE | `/:noteId` | Delete note | Yes |

## Setup

### Prerequisites

- Node.js (v16 or higher)
- MongoDB Atlas account
- npm or yarn

### Installation

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Environment Configuration:**
   Create a `config.env` file in the root directory:
   ```env
   PORT=5000
   MONGODB_URI=mongodb+srv://your_username:your_password@cluster0.mongodb.net/shareme?retryWrites=true&w=majority
   JWT_SECRET=your_jwt_secret_key_here_make_it_long_and_random
   FILE_UPLOAD_PATH=./uploads
   ```

3. **Start development server:**
   ```bash
   npm run dev
   ```

4. **Start production server:**
   ```bash
   npm start
   ```

## Database Models

### User Model
```javascript
{
  name: String (required),
  phone: String (required),
  email: String (required, unique),
  age: Number (required, 1-120),
  gender: String (required, enum: ['male', 'female', 'other']),
  password: String (required, min 6 chars),
  timestamps: true
}
```

### Note Model
```javascript
{
  uploaderId: ObjectId (ref: User, required),
  title: String (required, max 100 chars),
  description: String (max 500 chars),
  type: String (required, enum: ['pdf', 'link']),
  fileUrl: String (required for PDF),
  linkUrl: String (required for link),
  fileName: String (required for PDF),
  fileSize: Number (required for PDF),
  timestamps: true
}
```

## File Upload

- **Supported formats**: PDF only
- **Maximum file size**: 10MB
- **Storage**: Local file system (configurable path)
- **Security**: File type validation and size limits

## Security Features

- **Password Hashing**: bcrypt with 12 salt rounds
- **JWT Authentication**: 7-day token expiration
- **Input Validation**: Express-validator for all inputs
- **File Validation**: MIME type and size checking
- **Route Protection**: Middleware for protected routes
- **Error Handling**: Comprehensive error responses

## Error Handling

The API returns consistent error responses:

```javascript
{
  success: false,
  message: "Error description",
  errors: [] // Validation errors if applicable
}
```

## Development

### Scripts

- `npm run dev`: Start development server with nodemon
- `npm start`: Start production server
- `npm test`: Run tests (if configured)

### File Structure

```
backend/
├── models/          # Database models
├── routes/          # API route handlers
├── middleware/      # Custom middleware
├── uploads/         # File upload directory
├── config.env       # Environment variables
├── package.json     # Dependencies and scripts
└── server.js        # Main server file
```

## Deployment

1. **Environment Variables**: Set production environment variables
2. **File Storage**: Configure production file storage path
3. **Database**: Ensure MongoDB Atlas connection
4. **Process Manager**: Use PM2 or similar for production
5. **Reverse Proxy**: Configure Nginx or Apache

## Health Check

The API includes a health check endpoint:

```
GET /api/health
```

Returns:
```javascript
{
  success: true,
  message: "Share Me API is running",
  timestamp: "2023-01-01T00:00:00.000Z"
}
```
