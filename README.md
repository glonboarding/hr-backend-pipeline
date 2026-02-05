# HR Backend Pipeline

A Node.js Express backend server with multiple routes for HR management.

## Architecture

SMS/MMS requests are proxied through the Express server to an API Gateway and Lambda, which calls Telnyx—keeping the Telnyx API key secure and never exposed to the client.

![Backend proxy flow: Client → Express server → API Gateway → Lambda → Telnyx](backend_proxy.jpg)

## Features

- Express.js RESTful API
- Multiple route modules (Users, Employees, Departments)
- CORS enabled
- Request logging with Morgan
- Environment variable support
- Error handling middleware

## Installation

1. Install dependencies:
```bash
npm install
```

2. Copy `.env.example` to `.env` and configure:
```bash
cp .env.example .env
```

3. Start the server:
```bash
npm start
```

For development with auto-reload:
```bash
npm run dev
```

## API Routes

### Users
- `GET /api/users` - Get all users
- `GET /api/users/:id` - Get user by ID
- `POST /api/users` - Create new user
- `PUT /api/users/:id` - Update user
- `DELETE /api/users/:id` - Delete user

### Employees
- `GET /api/employees` - Get all employees
- `GET /api/employees/:id` - Get employee by ID
- `POST /api/employees` - Create new employee
- `PUT /api/employees/:id` - Update employee
- `DELETE /api/employees/:id` - Delete employee

### Departments
- `GET /api/departments` - Get all departments
- `GET /api/departments/:id` - Get department by ID
- `POST /api/departments` - Create new department
- `PUT /api/departments/:id` - Update department
- `DELETE /api/departments/:id` - Delete department

### Health Check
- `GET /` - Server status and API information

## Project Structure

```
hr-backend-pipeline/
├── server.js              # Main server file
├── routes/                # Route modules
│   ├── users.js
│   ├── employees.js
│   └── departments.js
├── package.json
├── .env.example
└── README.md
```

## Environment Variables

- `PORT` - Server port (default: 3000)
- `NODE_ENV` - Environment mode (development/production)

## License

ISC

