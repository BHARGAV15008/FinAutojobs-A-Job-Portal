# Configuration Files

This folder contains configuration examples and documentation for the FinAutoJobs project.

## Environment Configuration

### Main Environment File
- **Location**: `/.env` (root of project)
- **Example**: `/.env.example` (root of project)
- **Description**: Single unified environment file containing ALL configuration variables for both frontend and backend

### Usage
1. Copy `/.env.example` to `/.env` in the project root
2. Fill in your actual values
3. Both frontend and backend will read from this single file

## Examples Folder
- `examples/backend-env-example.txt` - Legacy backend-specific environment example (moved here for reference)

## Environment Variable Categories

### Server Configuration
- `PORT` - Server port (default: 5000)
- `NODE_ENV` - Environment (development/production)
- `BACKEND_PORT` - Backend port

### Frontend Configuration
- `VITE_API_URL` - API URL for frontend
- `VITE_BACKEND_PORT` - Backend port for frontend
- `VITE_PROD_API_URL` - Production API URL

### Database
- `MONGODB_URI` - MongoDB connection string
- `DATABASE_URL` - Database URL

### Authentication
- `JWT_SECRET` - JWT signing secret
- `SESSION_SECRET` - Session secret
- OAuth configurations for Google, Microsoft, Apple, LinkedIn

### Email & Notifications
- Email SMTP configuration
- OTP settings

### Feature Flags
- Various feature toggles

## Security Notes
- Never commit `.env` files to version control
- Use strong, unique secrets for production
- Rotate secrets regularly
- Use environment-specific values for different deployments
