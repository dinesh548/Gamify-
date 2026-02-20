# Deployment Guide

This guide covers deploying the Gamify Learning platform to free hosting services.

## Prerequisites

- GitHub account
- Vercel account (free)
- Render account (free)
- MongoDB Atlas account (optional, free tier available)

## Architecture

- **Frontend**: Deploy to Vercel
- **Backend**: Deploy to Render
- **Database**: MongoDB Atlas (optional, JSON fallback available)

## Step 1: Prepare Repository

1. Initialize git repository:
```bash
git init
git add .
git commit -m "Initial commit"
```

2. Create GitHub repository and push:
```bash
git remote add origin https://github.com/yourusername/gamify-learning.git
git push -u origin main
```

## Step 2: Deploy Backend to Render

1. Go to [Render Dashboard](https://dashboard.render.com)
2. Click "New +" → "Web Service"
3. Connect your GitHub repository
4. Configure service:
   - **Name**: `gamify-learning-backend`
   - **Root Directory**: `backend`
   - **Environment**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Instance Type**: Free

5. Add Environment Variables:
   ```
   PORT=10000
   MONGODB_URI=your-mongodb-uri (optional)
   JWT_SECRET=your-super-secret-jwt-key-change-in-production
   NODE_ENV=production
   ```

6. Click "Create Web Service"
7. Note the service URL (e.g., `https://gamify-learning-backend.onrender.com`)

## Step 3: Deploy Frontend to Vercel

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Click "Add New Project"
3. Import your GitHub repository
4. Configure project:
   - **Framework Preset**: Next.js
   - **Root Directory**: `frontend`
   - **Build Command**: `npm run build` (or leave default)
   - **Output Directory**: `.next` (or leave default)

5. Add Environment Variables:
   ```
   NEXT_PUBLIC_API_URL=https://gamify-learning-backend.onrender.com/api
   ```

6. Click "Deploy"
7. Note the deployment URL (e.g., `https://gamify-learning.vercel.app`)

## Step 4: MongoDB Atlas Setup (Optional)

1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create free cluster
3. Create database user
4. Whitelist IP addresses (or use 0.0.0.0/0 for development)
5. Get connection string
6. Update backend environment variable `MONGODB_URI`

**Note**: If MongoDB is not configured, the backend will automatically use JSON fallback storage.

## Step 5: Update Frontend API URL

If your backend URL changes, update the frontend environment variable:
1. Go to Vercel project settings
2. Environment Variables
3. Update `NEXT_PUBLIC_API_URL`

## Step 6: Verify Deployment

1. Visit your Vercel frontend URL
2. Register a new account
3. Test game functionality
4. Check backend logs in Render dashboard

## Local Development Setup

### Backend
```bash
cd backend
npm install
cp .env.example .env
# Edit .env with your settings
npm run dev
```

### Frontend
```bash
cd frontend
npm install
# Create .env.local with NEXT_PUBLIC_API_URL=http://localhost:5000/api
npm run dev
```

### Run Both
From root directory:
```bash
npm run install:all
npm run dev
```

## Environment Variables

### Backend (.env)
```
PORT=5000
MONGODB_URI=mongodb://localhost:27017/gamify-learning (optional)
JWT_SECRET=your-super-secret-jwt-key
NODE_ENV=development
```

### Frontend (.env.local)
```
NEXT_PUBLIC_API_URL=http://localhost:5000/api
```

## Troubleshooting

### Backend Issues

**Problem**: Backend fails to start
- Check Render logs
- Verify environment variables
- Ensure `package.json` has correct start script

**Problem**: MongoDB connection fails
- Backend will use JSON fallback automatically
- Check MongoDB URI format
- Verify IP whitelist in MongoDB Atlas

### Frontend Issues

**Problem**: API calls fail
- Check `NEXT_PUBLIC_API_URL` environment variable
- Verify backend is running and accessible
- Check CORS settings in backend

**Problem**: Build fails
- Check Node.js version (should be 18+)
- Verify all dependencies are installed
- Check for TypeScript errors

### CORS Issues

If you see CORS errors, ensure backend has:
```javascript
app.use(cors());
```

For production, configure allowed origins:
```javascript
app.use(cors({
  origin: ['https://your-frontend.vercel.app']
}));
```

## Production Checklist

- [ ] Change JWT_SECRET to strong random string
- [ ] Configure CORS with specific origins
- [ ] Set up MongoDB Atlas (optional but recommended)
- [ ] Enable HTTPS (automatic on Vercel/Render)
- [ ] Set up error monitoring (e.g., Sentry)
- [ ] Configure rate limiting
- [ ] Set up backup for JSON data (if not using MongoDB)
- [ ] Test all features in production
- [ ] Update README with production URLs

## Scaling Considerations

### Free Tier Limits

**Vercel**:
- 100GB bandwidth/month
- Unlimited deployments
- Automatic HTTPS

**Render**:
- 750 hours/month free
- Sleeps after 15 minutes of inactivity (free tier)
- Automatic HTTPS

**MongoDB Atlas**:
- 512MB storage
- Shared cluster

### Upgrade Path

1. **Backend**: Upgrade Render to paid plan for always-on service
2. **Database**: Upgrade MongoDB Atlas for more storage
3. **CDN**: Vercel Pro for better performance
4. **Monitoring**: Add error tracking and analytics

## Backup Strategy

### JSON Fallback Data
If using JSON fallback, regularly backup:
- `backend/data/users.json`
- `backend/data/games.json`

### MongoDB
MongoDB Atlas provides automatic backups on paid plans.

## Custom Domain

### Vercel
1. Go to project settings → Domains
2. Add your domain
3. Configure DNS records as instructed

### Render
1. Go to service settings → Custom Domain
2. Add your domain
3. Configure DNS records

## Monitoring

### Render Logs
- View logs in Render dashboard
- Set up log alerts

### Vercel Analytics
- Enable Vercel Analytics in project settings
- View performance metrics

## Security

1. **Never commit** `.env` files
2. Use strong JWT secrets
3. Enable HTTPS (automatic)
4. Validate all inputs
5. Use rate limiting
6. Keep dependencies updated

## Support

For issues:
1. Check logs in Render/Vercel dashboards
2. Review error messages
3. Test locally first
4. Check GitHub issues

## Cost Estimate

**Free Tier**:
- Vercel: $0/month
- Render: $0/month (with limitations)
- MongoDB Atlas: $0/month (free tier)

**Total**: $0/month (perfect for hackathon!)

For production with always-on backend: ~$7/month (Render paid plan)
