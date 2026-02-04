# CareerSwarm Setup Guide

**Last Updated:** January 30, 2026
**Status:** 95% Complete - Core Features Working

---

## 🚀 Quick Start (5 Minutes)

### 1. Install Dependencies

```bash
pnpm install
```

### 2. Configure Environment Variables

Copy the example file and fill in your values:

```bash
cp .env.example .env
```

**Required Variables:**
- `DATABASE_URL` - MySQL/TiDB connection string
- `JWT_SECRET` - Secret for session tokens (min 32 chars)
- `OAUTH_SERVER_URL` - Manus OAuth server URL
- `OPENAI_API_KEY` - OpenAI API key for LLM (primary)
- `STRIPE_SECRET_KEY` - Stripe test mode key
- `STRIPE_WEBHOOK_SECRET` - Stripe webhook secret

### 3. Set Up Database

```bash
# Create database
mysql -u root -p -e "CREATE DATABASE careerswarm_dev;"

# Run migrations (applies all pending migrations from drizzle/)
pnpm db:migrate

# Or: generate new migrations from schema changes, then apply (may prompt)
# pnpm db:push

# Seed reference data (optional)
pnpm seed
```

### 4. Start Development Server

```bash
pnpm dev
```

Server will start on `http://localhost:3000`

---

## 🔧 Configuration Details

### Database Setup

**Supported Databases:**
- MySQL 8.0+
- TiDB 7.0+

**Connection String Format:**
```
mysql://username:password@host:port/database
```

**Example:**
```
DATABASE_URL="mysql://root:password@localhost:3306/careerswarm_dev"
```

### Authentication (Manus OAuth)

Get these from your Manus deployment dashboard:
- `OAUTH_SERVER_URL` - Your Manus OAuth endpoint
- `OWNER_OPEN_ID` - Your user's OpenID

### AI Integration (Manus Forge)

Get your API key from [platform.openai.com](https://platform.openai.com/api-keys):
- `OPENAI_API_KEY` - Your OpenAI API key (sk-...)

### Stripe Integration

Get test mode keys from Stripe Dashboard:
1. Go to https://dashboard.stripe.com/test/apikeys
2. Copy "Secret key" (starts with `sk_test_`)
3. Create webhook endpoint → copy signing secret

---

## 🧪 Testing

### Run Backend Tests
```bash
pnpm test              # All tests
pnpm test --watch      # Watch mode
```

### Run E2E Tests
```bash
npx playwright install chromium  # First time only
npx playwright test              # Run all tests
npx playwright test --ui         # Interactive mode
```

---

## 🏗️ Build for Production

```bash
# Build frontend + backend
pnpm build

# Start production server
pnpm start
```

---

## 📊 Validation

Check if everything is configured correctly:

```bash
pnpm validate
```

**Expected Output:**
```
✅ All environment variables present
✅ Database connection successful
✅ Stripe API connection successful
✅ tRPC routers loaded (47 procedures)
```

---

## 🐛 Troubleshooting

### Database Connection Fails
- Check MySQL is running: `mysql -u root -p`
- Verify connection string format
- Ensure database exists: `SHOW DATABASES;`

### TypeScript Errors
- Run type check: `pnpm check`
- Clear node_modules: `rm -rf node_modules && pnpm install`

### Build Warnings
- Analytics warnings are expected if `VITE_ANALYTICS_ENDPOINT` not set
- Large chunk warnings can be ignored for now

---

## 📁 Project Structure

```
careerswarm-honeycomb/
├── client/              # React frontend
│   ├── src/
│   │   ├── components/  # UI components
│   │   ├── pages/       # Route pages
│   │   └── lib/         # Utilities
├── server/              # Express + tRPC backend
│   ├── _core/           # Core infrastructure
│   ├── agents/          # 7 AI agents
│   ├── services/        # File generation
│   └── routers.ts       # tRPC API
├── drizzle/             # Database schema
├── scripts/             # Utilities
└── tests/               # E2E tests
```

---

## 🔐 Security Notes

- Never commit `.env` file (already in .gitignore)
- Use test mode keys for Stripe during development
- Rotate secrets before production deployment
- Run `git secrets --scan` before commits (automatic)

---

## 🚢 Deployment

See [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md) for production deployment instructions.

---

## 📚 Additional Documentation

- [README.md](./README.md) - Project overview
- [CONTEXT_FOR_NEW_CHAT.md](./CONTEXT_FOR_NEW_CHAT.md) - Technical context
- [todo.md](./todo.md) - Feature tracking
- [CHANGELOG.md](./CHANGELOG.md) - Version history
