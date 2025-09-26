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

### Image Handling (Encrypted short IDs)

Images are stored separately in MongoDB as encrypted blobs and referenced by a short ID. At response time, the API expands the reference and returns base64 data for compatibility with existing clients.

- Storage model: `models/ImageBlob.js` with fields `{ _id: string, contentType: string, blob: Buffer }` where `blob` = `iv(12) | tag(16) | ciphertext` using AES-256-GCM.
- Reference field on records: e.g., `models/Breeding.js` now includes `imageRef: string` (short ID). The legacy inline `image` field is kept only for response compatibility.
- Request options for endpoints that accept images (e.g., `POST /api/pets`, `PUT /api/profile`, `POST /api/admin/*`):
  - Multipart form upload: field name `image` (binary file)
  - JSON base64 fields:
    - `imageData`: base64 string of the image
    - `imageContentType`: MIME type (e.g., `image/png`)

Server body size limit is set to ~15MB. Multer enforces max 5MB per file.

#### Example: Create admin breeding item

Multipart form-data:

```
POST /api/admin/breeding
Authorization: Bearer <token>
Content-Type: multipart/form-data

Fields:
- name: "Golden Retriever"
- description: "Friendly dogs"
- image: <binary file>
```

JSON base64:

```
POST /api/admin/breeding
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "Golden Retriever",
  "description": "Friendly dogs",
  "imageData": "<base64 string>",
  "imageContentType": "image/png"
}
```

Response contains expanded image for compatibility:

```
{
  "_id": "...",
  "name": "Golden Retriever",
  "description": "Friendly dogs",
  "imageRef": "Ab12Cd34Ef56",
  "image": {
    "contentType": "image/png",
    "data": "<base64>"
  }
}
```

#### Public breeding list

`GET /api/breeding` returns a combined payload of user pets marked for breeding and admin listings. Images are expanded from `imageRef` to base64.

```
{
  "pets": [...],
  "listings": [...]
}
```

## 🔧 Configuration

The application uses environment variables for configuration. Copy `.env.example` to `.env` and update the values as needed.

### Environment Variables

- `PORT` - Server port (default: 3000)
- `NODE_ENV` - Environment mode (development/production)
- `ENCRYPTION_KEY` - AES-256 key for image encryption. Recommended 32-byte key as hex (64 hex chars) or base64 (32 bytes when decoded). If not provided, a derived development key is used automatically.

Example:

```
# 32-byte key in hex
ENCRYPTION_KEY=5d8f2e8d6cfab1b3d4f63c1e2a7b9c0d5e6f718293a4b5c6d7e8f9a0b1c2d3e4
```

## 🚦 Middleware

The application includes the following middleware:

- **CORS** - Cross-origin resource sharing
- **Express JSON** - Parse JSON request bodies (limit 15MB)
- **Express URL Encoded** - Parse URL-encoded request bodies (limit 15MB)
- **Custom Auth** - Example authentication middleware (in middleware/auth.js)

## 📝 Development

This is a basic Express.js setup ready for development. You can:

1. Add new routes in the `routes/` directory
2. Create controllers in the `controllers/` directory
3. Add middleware in the `middleware/` directory
4. Configure environment variables in `.env`

### Internals

- Encryption utils: `utils/crypto.js` provides AES-256-GCM `encrypt(buffer)` and `decrypt(buffer)`.
- Image store: `utils/imageStore.js` exposes `saveImage(buffer, contentType) -> id`, `getImageBase64(id) -> { contentType, data }`, and `deleteImage(id)`.
- Short IDs generated via `nanoid`.

### Migration Notes

- Existing documents with inline `image` fields will still serialize to base64 via each model's `toJSON` transform.
- New writes in admin breeding now store via `imageRef`. If you need to backfill older inline images into `ImageBlob`, write a one-time migration that saves the buffer via `saveImage` and sets `imageRef`, optionally clearing the inline `image` field afterward.

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License.
