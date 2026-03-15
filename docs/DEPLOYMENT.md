# Deployment Guide

## Production Deployment

### Environment Variables

#### Backend (.env)
```env
NODE_ENV=production
PORT=5000
JWT_SECRET=<generate-strong-secret>
JWT_EXPIRES_IN=7d
DB_PATH=../database/hostel_gatepass.db
FRONTEND_URL=https://your-frontend-domain.com
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

#### Frontend (.env.local)
```env
NEXT_PUBLIC_API_URL=https://your-api-domain.com/api
```

### Docker Deployment

#### 1. Create Dockerfile for Backend

```dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY . .

EXPOSE 5000

CMD ["node", "server.js"]
```

#### 2. Create Dockerfile for Frontend

```dockerfile
FROM node:18-alpine AS builder

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

FROM node:18-alpine

WORKDIR /app

COPY --from=builder /app/next.config.js ./
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json

EXPOSE 3000

CMD ["npm", "start"]
```

#### 3. Docker Compose

```yaml
version: '3.8'

services:
  backend:
    build: ./backend
    ports:
      - "5000:5000"
    environment:
      - NODE_ENV=production
      - JWT_SECRET=${JWT_SECRET}
      - FRONTEND_URL=http://frontend:3000
    volumes:
      - ./database:/app/database
    restart: unless-stopped

  frontend:
    build: ./frontend
    ports:
      - "3000:3000"
    environment:
      - NEXT_PUBLIC_API_URL=http://backend:5000/api
    depends_on:
      - backend
    restart: unless-stopped
```

### Traditional Server Deployment

#### 1. Install Dependencies

```bash
# Backend
cd backend
npm ci --only=production

# Frontend
cd frontend
npm ci --only=production
npm run build
```

#### 2. Use Process Manager (PM2)

```bash
npm install -g pm2

# Start backend
cd backend
pm2 start server.js --name hostel-gatepass-api

# Start frontend
cd frontend
pm2 start npm --name hostel-gatepass-frontend -- start

# Save PM2 configuration
pm2 save
pm2 startup
```

### Nginx Configuration

```nginx
# Backend API
server {
    listen 80;
    server_name api.yourdomain.com;

    location / {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}

# Frontend
server {
    listen 80;
    server_name yourdomain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

### SSL/HTTPS Setup

Use Let's Encrypt with Certbot:

```bash
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d yourdomain.com -d api.yourdomain.com
```

### Database Backup

```bash
# Backup script
#!/bin/bash
DATE=$(date +%Y%m%d_%H%M%S)
cp database/hostel_gatepass.db backups/hostel_gatepass_$DATE.db

# Keep only last 30 days
find backups/ -name "*.db" -mtime +30 -delete
```

Add to crontab for daily backups:
```bash
0 2 * * * /path/to/backup-script.sh
```

### Security Checklist

- [ ] Change default JWT_SECRET
- [ ] Enable HTTPS
- [ ] Configure firewall (allow only 80, 443, 22)
- [ ] Set up rate limiting
- [ ] Regular database backups
- [ ] Monitor logs
- [ ] Keep dependencies updated
- [ ] Use environment variables for secrets
- [ ] Disable directory listing
- [ ] Set proper file permissions

### Monitoring

Use PM2 monitoring:
```bash
pm2 monit
pm2 logs
```

Or integrate with monitoring services:
- New Relic
- Datadog
- Sentry (for error tracking)

### Performance Optimization

1. Enable gzip compression in Nginx
2. Use CDN for static assets
3. Implement caching strategies
4. Optimize database queries
5. Use connection pooling
6. Implement load balancing for high traffic

### Scaling

For high traffic:
1. Use multiple backend instances with load balancer
2. Implement Redis for session management
3. Use PostgreSQL instead of SQLite
4. Separate database server
5. Use CDN for frontend assets
