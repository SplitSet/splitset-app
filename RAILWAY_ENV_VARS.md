# Railway Environment Variables

Copy these variables to your Railway app settings:

## Required Variables
```
NODE_ENV=production
PORT=5000
DATABASE_URL=${{Postgres.DATABASE_URL}}
REDIS_HOST=${{Redis.REDIS_HOST}}
REDIS_PORT=${{Redis.REDIS_PORT}}
REDIS_PASSWORD=${{Redis.REDIS_PASSWORD}}
```

## Security (Copy from .env.production)
```
JWT_SECRET=your-generated-jwt-secret-from-env-production-file
ENCRYPTION_KEY=your-generated-encryption-key-from-env-production-file
BCRYPT_ROUNDS=12
MAX_LOGIN_ATTEMPTS=5
LOCKOUT_MINUTES=30
```

## App Settings
```
ANALYTICS_REFRESH_MINUTES=30
LOG_LEVEL=info
RATE_LIMIT_MAX_REQUESTS=500
FRONTEND_URL=https://your-app-name.up.railway.app
```

## How to Add Variables in Railway:
1. Go to your Railway project
2. Click on your app service (not databases)
3. Go to "Variables" tab
4. Click "Add Variable" for each one above
5. Copy the JWT_SECRET and ENCRYPTION_KEY from your .env.production file
