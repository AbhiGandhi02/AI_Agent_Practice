# ADA - AI Data Analytics Agent

An intelligent analytics agent that answers business questions about subscription data using natural language.

## Quick Start

### Prerequisites
- Node.js 20+
- PostgreSQL database
- OpenAI API key

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
node scripts/seed.js

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

# Integration tests (requires OpenAI API)
npm run test:integration
```

## Docker

```bash
# Build and run
docker build -t ada-agent .
docker run -p 3000:3000 -e OPENAI_API_KEY=your-key ada-agent

# With docker-compose (includes PostgreSQL)
docker-compose up
```

## Deployment

### Render (Recommended)

1. Fork this repository
2. Connect to Render: https://render.com/deploy
3. Set `OPENAI_API_KEY` in environment variables
4. Deploy!

### Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `NODE_ENV` | Environment | development |
| `PORT` | Server port | 3000 |
| `DATABASE_URL` | PostgreSQL connection string | - |
| `OPENAI_API_KEY` | OpenAI API key | - |
| `CORS_ORIGINS` | Allowed origins | localhost |
| `RATE_LIMIT_MAX` | Requests per window | 100 |

## License

ISC
