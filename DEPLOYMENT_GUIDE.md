# DigitalOcean App Platform Deployment Guide

## Prerequisites
1. DigitalOcean account
2. GitHub repository with your backend code
3. Required API keys and secrets

## Step-by-Step Deployment Instructions

### 1. Prepare Your Repository

#### A. Push your backend code to GitHub
```bash
cd "C:\Users\deped\OneDrive\Desktop\CAC InvestNYou\backend"
git init
git add .
git commit -m "Initial backend commit"
git branch -M main
git remote add origin https://github.com/your-username/your-repo-name.git
git push -u origin main
```

#### B. Ensure your package.json has the correct start script
Your package.json already has: `"start": "node src/server.js"` ✅

### 2. Create DigitalOcean App

#### A. Go to DigitalOcean App Platform
1. Log into your DigitalOcean account
2. Navigate to Apps in the left sidebar
3. Click "Create App"

#### B. Connect GitHub Repository
1. Choose "GitHub" as source
2. Authorize DigitalOcean to access your GitHub
3. Select your repository
4. Choose the main branch

#### C. Configure App Settings
1. **App Name**: `moneysmart-backend`
2. **Source Directory**: `/` (root of repository)
3. **Build Command**: `npm install`
4. **Run Command**: `npm start`
5. **Environment**: `Node.js`

### 3. Configure Environment Variables

In the App Platform dashboard, add these environment variables:

#### Required Environment Variables:
- `NODE_ENV` = `production`
- `PORT` = `5000`
- `DATABASE_URL` = `[Your PostgreSQL connection string]`
- `JWT_SECRET` = `[Your JWT secret key]`
- `OPENAI_API_KEY` = `[Your OpenAI API key]`
- `POLYGON_API_KEY` = `[Your Polygon.io API key]`
- `FRONTEND_URL` = `[Your frontend domain]`
- `EMAIL_USER` = `[Your email username]`
- `EMAIL_PASS` = `[Your email password]`

### 4. Set Up Database

#### Option A: Use DigitalOcean Managed Database
1. In App Platform, go to "Databases" tab
2. Click "Create Database"
3. Choose PostgreSQL
4. Select appropriate size (start with smallest)
4. The DATABASE_URL will be automatically provided

#### Option B: Use External Database
1. Set up PostgreSQL database elsewhere
2. Add DATABASE_URL environment variable manually

### 5. Deploy the App

1. Click "Create Resources" in App Platform
2. Wait for deployment to complete (5-10 minutes)
3. Your app will be available at: `https://your-app-name.ondigitalocean.app`

### 6. Post-Deployment Setup

#### A. Run Database Migrations
1. Go to your app's console/terminal
2. Run: `npx prisma migrate deploy`
3. Run: `npx prisma generate`

#### B. Test Your Deployment
1. Visit: `https://your-app-name.ondigitalocean.app/health`
2. Should return: `{"status":"OK","database":"connected"}`

### 7. Configure Custom Domain (Optional)

1. In App Platform, go to "Settings" → "Domains"
2. Add your custom domain
3. Update DNS records as instructed
4. Update FRONTEND_URL environment variable

### 8. Monitor and Scale

#### A. Monitor Logs
- Go to "Runtime Logs" in App Platform dashboard
- Monitor for errors and performance

#### B. Scale Resources
- Adjust instance count and size based on usage
- Monitor costs in DigitalOcean billing

## Troubleshooting

### Common Issues:

1. **Database Connection Errors**
   - Verify DATABASE_URL is correct
   - Check database is running and accessible
   - Ensure firewall allows connections

2. **Build Failures**
   - Check Node.js version compatibility
   - Verify all dependencies are in package.json
   - Check build logs for specific errors

3. **Environment Variable Issues**
   - Ensure all required variables are set
   - Check variable names match exactly
   - Verify secret variables are marked as SECRET

4. **CORS Issues**
   - Update FRONTEND_URL environment variable
   - Check CORS configuration in server.js

### Useful Commands:

```bash
# Check app status
curl https://your-app-name.ondigitalocean.app/health

# Check database status
curl https://your-app-name.ondigitalocean.app/api/status

# View logs (in DigitalOcean console)
npm run logs
```

## Cost Estimation

- **Basic App**: ~$5/month
- **Managed Database**: ~$15/month
- **Custom Domain**: Free (you pay for domain registration)
- **Total**: ~$20/month for basic setup

## Security Considerations

1. **Environment Variables**: Mark sensitive variables as SECRET
2. **Database**: Use managed database with automatic backups
3. **HTTPS**: Automatically provided by App Platform
4. **Rate Limiting**: Already configured in your server.js
5. **CORS**: Properly configured for your frontend domain

## Next Steps

1. Set up monitoring and alerting
2. Configure automated backups
3. Set up CI/CD pipeline
4. Implement logging and analytics
5. Plan for scaling as your app grows
