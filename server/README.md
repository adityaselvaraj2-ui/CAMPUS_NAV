# Campus Navigator Backend

Node.js + Express backend server for Campus Navigator.

## Setup

1. Navigate to the server directory:
   ```bash
   cd server
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env` file from `.env.example`:
   ```bash
   cp .env.example .env
   ```

4. Add your credentials to `.env`:
   - `GROQ_API_KEY`: Your Groq API key
   - `MONGODB_URI`: Your MongoDB Atlas connection URI
   - `PORT`: Server port (default: 8000)

5. Start the development server:
   ```bash
   npm run dev
   ```

## API Endpoints

### Health Check
```bash
curl http://localhost:8000/
```

### Register
```bash
curl -X POST http://localhost:8000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"password123"}'
```

### Login
```bash
curl -X POST http://localhost:8000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"password123"}'
```

### Chat with LLM
```bash
curl -X POST http://localhost:8000/api/llm/chat \
  -H "Content-Type: application/json" \
  -d '{"message":"What is the location of the library?"}'
```

## Notes

- For production deployment on Render, ensure your environment variables are set in the Render dashboard.
- MongoDB integration and real LLM calls are marked with TODO comments in `index.js`.
