# 🚀 Render Deployment Guide

## Quick Deploy Steps

### 1. Push to GitHub
```bash
cd /Users/Cameron/Desktop/Feedback/New/insurance-feedback-system

# Initialize git if not already done
git init
git add .
git commit -m "Initial commit - Insurance Feedback System"

# Create GitHub repo and push
# (Create new repo at github.com first)
git remote add origin https://github.com/yourusername/insurance-feedback-system.git
git branch -M main
git push -u origin main
```

### 2. Deploy on Render
1. Go to [render.com](https://render.com)
2. Sign up/login with GitHub
3. Click **"New"** → **"Web Service"**
4. Connect your GitHub repo: `insurance-feedback-system`
5. Configure:
   - **Name**: `insurance-feedback-system`
   - **Environment**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Plan**: `Free`

### 3. Add PostgreSQL Database
1. In Render dashboard, click **"New"** → **"PostgreSQL"**
2. Configure:
   - **Name**: `feedback-db`
   - **Plan**: `Free`
   - **Region**: Same as your web service
3. Click **"Create Database"**

### 4. Environment Variables
In your web service settings, add these environment variables:

**Required:**
- `NODE_ENV` = `production`
- `DATABASE_URL` = (Copy from your PostgreSQL service)
- `FRONTEND_URL` = `https://your-app-name.onrender.com`

**Auto-generated (Render will create these):**
- `JWT_SECRET` = (Generate random 32+ characters)
- `SESSION_SECRET` = (Generate random 32+ characters)

**Optional:**
- `COMPANY_NAME` = `Your Company Name`
- `FROM_EMAIL` = `leads@yourcompany.com`

### 5. Update CORS Origins
After deployment, update the `CORS_ORIGINS` environment variable:
```
CORS_ORIGINS=https://your-app-name.onrender.com
```

## 🎯 Your Live URLs

After deployment you'll have:
- **Main App**: `https://your-app-name.onrender.com`
- **Dashboard**: `https://your-app-name.onrender.com/dashboard`
- **API**: `https://your-app-name.onrender.com/api`

## ⚠️ Important Notes

1. **Free Tier Limitations**:
   - App sleeps after 15 minutes of inactivity
   - First request after sleep takes ~30 seconds to wake up
   - PostgreSQL free for 90 days, then $7/month

2. **Database Setup**:
   - Migrations run automatically on first deploy
   - Sample data is seeded automatically

3. **Custom Domain** (Optional):
   - Upgrade to paid plan ($7/month)
   - Add your custom domain in Render settings

## 🔧 Post-Deployment

1. Test your live URL
2. Share feedback form URLs with brokers
3. Monitor via Render dashboard
4. Check logs if any issues

## 🆘 Troubleshooting

**Build fails?**
- Check Node.js version (should be 18.x)
- Verify package.json dependencies

**Database connection fails?**
- Ensure DATABASE_URL is correctly set
- Check PostgreSQL service is running

**App won't start?**
- Check environment variables
- Review application logs in Render dashboard

---

**Ready to deploy? Follow steps 1-4 above!** 🚀