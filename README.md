# ADA - AI Data Analytics Agent

An intelligent analytics agent that answers business questions about subscription data using natural language.

## Quick Start

### Prerequisites
- Node.js 20+
- PostgreSQL database (or Supabase)
- Gemini API key (free at https://aistudio.google.com/apikey)

### Installation

```bash
# Clone repository
git clone https://github.com/AbhiGandhi02/AI_Agent_Practice.git
cd ada-project

# Install dependencies
npm install

# Configure environment
cp .env.example .env
# Edit .env with your credentials

# Setup database
psql -d your_db -f db/schema.sql
npm run seed

# Start server
npm run dev
```

## API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/health` | GET | Health check |
| `/api/status` | GET | Agent status + available tools |
| `/api/ask` | POST | Ask a business question |

### Example

```bash
curl -X POST http://localhost:3000/api/ask \
  -H "Content-Type: application/json" \
  -d '{"question": "Which plan generates the highest revenue?"}'
```

## Testing

```bash
# Unit tests
npm test

# With coverage
npm run test:coverage

# Integration tests (requires Gemini API key)
npm run test:integration
```

## Docker

```bash
# Build and run
docker build -t ada-agent .
docker run -p 3000:3000 -e GEMINI_API_KEY=your-key -e DATABASE_URL=your-db-url ada-agent

# With docker-compose (includes PostgreSQL)
docker-compose up
```

## Deployment

### Render (Recommended)

1. Fork this repository
2. Connect to Render: https://render.com/deploy
3. Set `GEMINI_API_KEY` in environment variables
4. Deploy!

### Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `NODE_ENV` | Environment | development |
| `PORT` | Server port | 3000 |
| `DATABASE_URL` | PostgreSQL connection string | - |
| `GEMINI_API_KEY` | Google Gemini API key | - |
| `CORS_ORIGINS` | Allowed origins | localhost |
| `RATE_LIMIT_MAX` | Requests per window | 100 |

## License

ISC
