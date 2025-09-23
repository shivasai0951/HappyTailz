<<<<<<< HEAD
# HappyTailz
=======
# HappyTailz

A Node.js Express application ready for development.

## 🚀 Getting Started

### Prerequisites

- Node.js (v14 or higher)
- npm or yarn

### Installation

1. Clone or navigate to the project directory
2. Install dependencies:
   ```bash
   npm install
   ```

3. Copy the environment file:
   ```bash
   cp .env.example .env
   ```

4. Update the `.env` file with your configuration

### Running the Application

#### Development Mode (with auto-restart)
```bash
npm run dev
```

#### Production Mode
```bash
npm start
```

The server will start on `http://localhost:3000` (or the port specified in your `.env` file).

## 📁 Project Structure

```
HappyTailz/
├── controllers/          # Route controllers
│   └── exampleController.js
├── middleware/           # Custom middleware
│   └── auth.js
├── routes/              # Route definitions
│   └── index.js
├── .env                 # Environment variables (not in git)
├── .env.example         # Environment variables template
├── .gitignore          # Git ignore file
├── package.json        # Project dependencies and scripts
├── README.md           # This file
└── server.js           # Main application file
```

## 🛠️ Available Scripts

- `npm start` - Start the server in production mode
- `npm run dev` - Start the server in development mode with nodemon
- `npm test` - Run tests (placeholder)

## 📡 API Endpoints

### Default Routes

- `GET /` - Welcome message and server status
- `GET /health` - Health check endpoint

### Example Routes (in routes/index.js)

- `GET /api/` - API information

## 🔧 Configuration

The application uses environment variables for configuration. Copy `.env.example` to `.env` and update the values as needed.

### Environment Variables

- `PORT` - Server port (default: 3000)
- `NODE_ENV` - Environment mode (development/production)

## 🚦 Middleware

The application includes the following middleware:

- **CORS** - Cross-origin resource sharing
- **Express JSON** - Parse JSON request bodies
- **Express URL Encoded** - Parse URL-encoded request bodies
- **Custom Auth** - Example authentication middleware (in middleware/auth.js)

## 📝 Development

This is a basic Express.js setup ready for development. You can:

1. Add new routes in the `routes/` directory
2. Create controllers in the `controllers/` directory
3. Add middleware in the `middleware/` directory
4. Configure environment variables in `.env`

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License.
>>>>>>> 32d1c90 (Initial commit)
