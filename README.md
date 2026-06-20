# Creator Card API

RESTful microservice for creating, retrieving, and deleting shareable creator profile cards with links and service rates.

## Stack

- **Runtime:** Node.js
- **Framework:** Express 4
- **Database:** MongoDB (Mongoose)
- **Validation:** VSL (template validator DSL)

## Deployed Base URL

```
https://creator-cards-api-eb9o.onrender.com
```

## Endpoints

| Method | Path | Description |
|--------|------|-------------|
| POST | `/creator-cards` | Create a Creator Card |
| GET | `/creator-cards/:slug` | Retrieve a card by slug |
| DELETE | `/creator-cards/:slug` | Delete a card by slug |

## Quick Start

```bash
# Clone and install
git clone <repo-url>
cd creator-card-api
npm install

# Set environment variables
cp .env.example .env
# Edit .env with your MongoDB URI

# Start server
npm start
```

### Create a card

```bash
curl -X POST http://localhost:3000/creator-cards \
  -H "Content-Type: application/json" \
  -d '{
    "title": "George Cooks",
    "slug": "george-cooks",
    "creator_reference": "crt_8f2k1m9x4p7w3q5z",
    "status": "published"
  }'
```

### Retrieve a card

```bash
curl http://localhost:3000/creator-cards/george-cooks
```

### Delete a card

```bash
curl -X DELETE http://localhost:3000/creator-cards/george-cooks \
  -H "Content-Type: application/json" \
  -d '{"creator_reference": "crt_8f2k1m9x4p7w3q5z"}'
```

## Documentation

Interactive Swagger UI available at [`/docs/`](https://creator-cards-api-eb9o.onrender.com/docs/).

## Error Codes

| Code | HTTP | Meaning |
|------|------|---------|
| SL02 | 400 | Slug already taken |
| AC01 | 400 | Access code required on private cards |
| AC05 | 400 | Access code not allowed on public cards |
| NF01 | 404 | Card not found |
| NF02 | 404 | Card exists but is a draft |
| AC03 | 403 | Access code required for private card |
| AC04 | 403 | Invalid access code |

## Deployment

This project includes a `Procfile` for Render/Heroku. Set `MONGODB_URI` to your MongoDB Atlas connection string in the environment variables.

## License

MIT
