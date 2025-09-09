# 🔴 Setting up Redis on Render for SplitSet

## Step-by-Step Redis Setup on Render

### 1. Create Redis Instance on Render

1. **Go to your Render Dashboard**: https://dashboard.render.com
2. **Click "New"** and select **"Redis"** from the dropdown
3. **Configure your Redis instance**:
   - **Name**: `splitset-redis-production`
   - **Plan**: Choose based on your needs:
     - **Free Plan**: 25MB RAM (good for testing)
     - **Starter Plan**: $7/month, 256MB RAM (recommended for production)
     - **Standard Plan**: $25/month, 1GB RAM (for high traffic)
   - **Region**: Choose the same region as your backend service
   - **Max Memory Policy**: `allkeys-lru` (recommended)

4. **Click "Create Redis"** to deploy

### 2. Get Connection Details

After deployment, in your Redis dashboard:

1. **Copy the Internal Redis URL** (looks like):
   ```
   redis://red-xxxxxxxxxxxxx:6379
   ```

2. **For external access** (if needed for development):
   - Go to "Access Control" section
   - Add your IP address to allowlist
   - Copy the External Redis URL

### 3. Configure SplitSet Environment

Add to your `backend/.env`:

```env
# Redis Configuration (Render)
REDIS_URL=redis://red-xxxxxxxxxxxxx:6379
# OR if using password-protected Redis:
# REDIS_URL=redis://:password@red-xxxxxxxxxxxxx:6379

# Alternative format (if your app uses individual variables):
REDIS_HOST=red-xxxxxxxxxxxxx-a.oregon-redis.render.com
REDIS_PORT=6379
REDIS_PASSWORD=your_redis_password_if_any
```

### 4. Test Redis Connection

```bash
# Test from your local machine (if external access enabled)
redis-cli -u redis://red-xxxxxxxxxxxxx:6379 ping

# Should return: PONG
```

### 5. Update Your Application Code

Your SplitSet app should already support Redis. Verify in `backend/services/queueService.js`:

```javascript
// This should already be configured
const redis = new Redis({
  host: process.env.REDIS_HOST || 'localhost',
  port: process.env.REDIS_PORT || 6379,
  password: process.env.REDIS_PASSWORD,
  // Or use REDIS_URL directly:
  // url: process.env.REDIS_URL
});
```

## Cost Considerations

- **Free Plan**: $0/month, 25MB RAM, good for development/testing
- **Starter Plan**: $7/month, 256MB RAM, recommended for production
- **Standard Plan**: $25/month, 1GB RAM, for high-traffic applications

## Security Best Practices

1. **Use Internal URLs** for production (within Render network)
2. **Enable password protection** for additional security
3. **Restrict external access** to specific IP addresses only
4. **Monitor usage** through Render dashboard

## Troubleshooting

### Connection Issues
- Ensure your backend service is in the same region as Redis
- Check if you're using the correct URL format
- Verify firewall/access control settings

### Performance Issues
- Monitor memory usage in Render dashboard
- Consider upgrading plan if hitting memory limits
- Implement proper cache expiration policies

---

**Next**: After setting up Redis, update your environment variables and deploy your application!
