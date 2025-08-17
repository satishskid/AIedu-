# Deployment Guide

This guide covers deploying EduAI Tutor to various platforms.

## 🚀 Netlify Deployment (Recommended)

### Prerequisites

- GitHub repository with your code
- Netlify account
- Environment variables configured

### Automatic Deployment

1. **Connect Repository**
   - Go to [Netlify Dashboard](https://app.netlify.com)
   - Click "New site from Git"
   - Choose GitHub and select your repository
   - Configure build settings:
     - **Build command**: `npm run build`
     - **Publish directory**: `dist`
     - **Node version**: `18`

2. **Environment Variables**
   ```bash
   # Required Variables
   VITE_LICENSE_SECRET_KEY=your-generated-secret-key
   VITE_ADMIN_PASSWORD=your-generated-admin-password
   VITE_SENDGRID_API_KEY=your-sendgrid-api-key
   VITE_FROM_EMAIL=noreply@yourdomain.com
   VITE_ADMIN_EMAIL=admin@yourdomain.com
   
   # Optional Variables
   VITE_GA_MEASUREMENT_ID=G-XXXXXXXXXX
   VITE_SENTRY_DSN=https://your-sentry-dsn@sentry.io/project-id
   VITE_HUGGINGFACE_API_KEY=hf_your-huggingface-key
   VITE_AI_MODEL_CDN=https://your-cdn.com/models
   ```

3. **Deploy**
   - Click "Deploy site"
   - Netlify will automatically build and deploy your site
   - Your site will be available at `https://your-site-name.netlify.app`

### Manual Deployment

```bash
# Install Netlify CLI
npm install -g netlify-cli

# Login to Netlify
netlify login

# Build the project
npm run build

# Deploy to production
netlify deploy --prod --dir=dist

# Or deploy preview
netlify deploy --dir=dist
```

### Custom Domain

1. **Add Domain**
   - Go to Site settings > Domain management
   - Click "Add custom domain"
   - Enter your domain name

2. **Configure DNS**
   - Add CNAME record pointing to your Netlify subdomain
   - Or use Netlify DNS for automatic configuration

3. **SSL Certificate**
   - Netlify automatically provisions SSL certificates
   - Force HTTPS in Site settings > HTTPS

## 🔧 Vercel Deployment

### Prerequisites

- GitHub repository
- Vercel account

### Deployment Steps

1. **Import Project**
   - Go to [Vercel Dashboard](https://vercel.com/dashboard)
   - Click "New Project"
   - Import from GitHub

2. **Configure Build**
   ```json
   {
     "buildCommand": "npm run build",
     "outputDirectory": "dist",
     "installCommand": "npm install",
     "devCommand": "npm run dev"
   }
   ```

3. **Environment Variables**
   - Add the same environment variables as Netlify
   - Go to Project Settings > Environment Variables

4. **Deploy**
   - Click "Deploy"
   - Your site will be available at `https://your-project.vercel.app`

## 🐳 Docker Deployment

### Dockerfile

```dockerfile
# Build stage
FROM node:18-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./
COPY setup.cjs ./

# Install dependencies
RUN npm ci --only=production

# Copy source code
COPY . .

# Build application
RUN npm run build

# Production stage
FROM nginx:alpine

# Copy built application
COPY --from=builder /app/dist /usr/share/nginx/html

# Copy nginx configuration
COPY nginx.conf /etc/nginx/nginx.conf

# Expose port
EXPOSE 80

# Start nginx
CMD ["nginx", "-g", "daemon off;"]
```

### nginx.conf

```nginx
events {
    worker_connections 1024;
}

http {
    include       /etc/nginx/mime.types;
    default_type  application/octet-stream;
    
    sendfile        on;
    keepalive_timeout  65;
    
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml application/xml+rss text/javascript;
    
    server {
        listen       80;
        server_name  localhost;
        
        root   /usr/share/nginx/html;
        index  index.html index.htm;
        
        # Handle client-side routing
        location / {
            try_files $uri $uri/ /index.html;
        }
        
        # Cache static assets
        location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
            expires 1y;
            add_header Cache-Control "public, immutable";
        }
        
        # Security headers
        add_header X-Frame-Options "SAMEORIGIN" always;
        add_header X-Content-Type-Options "nosniff" always;
        add_header X-XSS-Protection "1; mode=block" always;
        add_header Referrer-Policy "no-referrer-when-downgrade" always;
        add_header Content-Security-Policy "default-src 'self' http: https: data: blob: 'unsafe-inline'" always;
    }
}
```

### Build and Run

```bash
# Build Docker image
docker build -t eduai-tutor .

# Run container
docker run -p 80:80 eduai-tutor

# Or with environment variables
docker run -p 80:80 \
  -e VITE_LICENSE_SECRET_KEY=your-key \
  -e VITE_ADMIN_PASSWORD=your-password \
  eduai-tutor
```

## ☁️ AWS S3 + CloudFront

### S3 Setup

```bash
# Create S3 bucket
aws s3 mb s3://your-eduai-bucket

# Enable static website hosting
aws s3 website s3://your-eduai-bucket \
  --index-document index.html \
  --error-document index.html

# Upload files
aws s3 sync dist/ s3://your-eduai-bucket --delete

# Set public read policy
aws s3api put-bucket-policy \
  --bucket your-eduai-bucket \
  --policy file://bucket-policy.json
```

### bucket-policy.json

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "PublicReadGetObject",
      "Effect": "Allow",
      "Principal": "*",
      "Action": "s3:GetObject",
      "Resource": "arn:aws:s3:::your-eduai-bucket/*"
    }
  ]
}
```

### CloudFront Distribution

```bash
# Create CloudFront distribution
aws cloudfront create-distribution \
  --distribution-config file://distribution-config.json
```

## 🔍 Health Checks

### Netlify Functions

The health check endpoint is automatically deployed with Netlify:

```
GET https://your-site.netlify.app/.netlify/functions/health-check
```

### Custom Health Check

```bash
# Check application health
curl -f https://your-domain.com/.netlify/functions/health-check || exit 1

# Check specific endpoints
curl -f https://your-domain.com/api/status || exit 1
```

## 📊 Monitoring

### Uptime Monitoring

- **Pingdom**: Set up HTTP checks
- **UptimeRobot**: Free uptime monitoring
- **StatusCake**: Comprehensive monitoring

### Performance Monitoring

- **Google PageSpeed Insights**: Performance analysis
- **GTmetrix**: Detailed performance reports
- **WebPageTest**: Advanced performance testing

### Error Tracking

- **Sentry**: Real-time error tracking
- **LogRocket**: Session replay and monitoring
- **Bugsnag**: Error monitoring and reporting

## 🔐 Security

### HTTPS Configuration

- **Netlify**: Automatic SSL certificates
- **Vercel**: Automatic SSL certificates
- **Custom**: Use Let's Encrypt or commercial certificates

### Security Headers

```nginx
# Add to nginx configuration
add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
add_header X-Frame-Options "SAMEORIGIN" always;
add_header X-Content-Type-Options "nosniff" always;
add_header X-XSS-Protection "1; mode=block" always;
add_header Referrer-Policy "strict-origin-when-cross-origin" always;
```

### Environment Security

- Never commit `.env` files
- Use platform-specific environment variable management
- Rotate secrets regularly
- Use least-privilege access principles

## 🚨 Troubleshooting

### Common Issues

1. **Build Failures**
   ```bash
   # Check Node.js version
   node --version  # Should be 18+
   
   # Clear cache and reinstall
   rm -rf node_modules package-lock.json
   npm install
   ```

2. **Environment Variables**
   ```bash
   # Verify environment variables are set
   echo $VITE_LICENSE_SECRET_KEY
   
   # Check .env file exists
   ls -la .env
   ```

3. **Routing Issues**
   - Ensure `_redirects` file is in `public/` directory
   - Configure server for SPA routing

4. **Performance Issues**
   ```bash
   # Analyze bundle size
   npm run analyze
   
   # Check for large dependencies
   npx webpack-bundle-analyzer dist/stats.html
   ```

### Debug Mode

```bash
# Enable debug logging
DEBUG=* npm run dev

# Check build output
npm run build -- --debug

# Verbose logging
npm run build -- --verbose
```

## 📈 Performance Optimization

### Build Optimization

```bash
# Optimize build
npm run build -- --mode production

# Analyze bundle
npm run analyze

# Check bundle size
ls -lh dist/assets/
```

### CDN Configuration

- Use CDN for static assets
- Enable compression (gzip/brotli)
- Set appropriate cache headers
- Use HTTP/2 push for critical resources

### Caching Strategy

```nginx
# Cache static assets
location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2)$ {
    expires 1y;
    add_header Cache-Control "public, immutable";
}

# Cache HTML with short expiry
location ~* \.html$ {
    expires 1h;
    add_header Cache-Control "public, must-revalidate";
}
```

## 🔄 CI/CD Pipeline

### GitHub Actions

```yaml
name: Deploy to Netlify

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    
    steps:
    - uses: actions/checkout@v3
    
    - name: Setup Node.js
      uses: actions/setup-node@v3
      with:
        node-version: '18'
        cache: 'npm'
    
    - name: Install dependencies
      run: npm ci
    
    - name: Run tests
      run: npm test
    
    - name: Build
      run: npm run build
      env:
        VITE_LICENSE_SECRET_KEY: ${{ secrets.VITE_LICENSE_SECRET_KEY }}
        VITE_ADMIN_PASSWORD: ${{ secrets.VITE_ADMIN_PASSWORD }}
    
    - name: Deploy to Netlify
      uses: nwtgck/actions-netlify@v2.0
      with:
        publish-dir: './dist'
        production-branch: main
        github-token: ${{ secrets.GITHUB_TOKEN }}
        deploy-message: "Deploy from GitHub Actions"
      env:
        NETLIFY_AUTH_TOKEN: ${{ secrets.NETLIFY_AUTH_TOKEN }}
        NETLIFY_SITE_ID: ${{ secrets.NETLIFY_SITE_ID }}
```

---

## 📞 Support

For deployment issues:

- Check the [troubleshooting section](#-troubleshooting)
- Review platform-specific documentation
- Contact support at support@yourdomain.com
- Open an issue on GitHub

---

*Last updated: January 2024*