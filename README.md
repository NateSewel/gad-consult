# GAD Legal Consult - Landing Page

A modern, professional landing page for GAD Legal Consult law firm. Built with React, TypeScript, Express, and Framer Motion animations.

## ✨ Features

- Single-page application with smooth scrolling
- Professional scroll-triggered animations
- Active navigation section highlighting
- Dark mode toggle with theme persistence
- 8 core legal services showcase
- Contact form with validation
- Newsletter subscription
- Responsive design with Tailwind CSS
- SEO optimized
- Custom GAD favicon

## 🚀 Quick Start

### Local Development

```bash
# Install dependencies
npm install

# Start dev server
npm run dev

# Visit http://localhost:5000
```

### Deploy to Render.com

```bash
# Push to GitHub
git add .
git commit -m "Ready for deployment"
git push

# Then on Render.com:
# 1. New + → Blueprint
# 2. Connect your GitHub repo
# 3. Click Apply
# 4. Done! (2-5 minutes)
```

See [DEPLOY_NOW.md](DEPLOY_NOW.md) for detailed deployment instructions.

## 📚 Documentation

- **[DEPLOY_NOW.md](DEPLOY_NOW.md)** - Quick deployment guide
- **[RENDER_DEPLOYMENT_GUIDE.md](RENDER_DEPLOYMENT_GUIDE.md)** - Detailed Render setup
- **[DEPLOYMENT_CHECKLIST.md](DEPLOYMENT_CHECKLIST.md)** - Pre/post deployment checklist
- **[SCROLL_ANIMATIONS_GUIDE.md](SCROLL_ANIMATIONS_GUIDE.md)** - Animation documentation
- **[FRAMER_MOTION_ANIMATIONS.md](FRAMER_MOTION_ANIMATIONS.md)** - Framer Motion details
- **[FAVICON_UPDATE.md](FAVICON_UPDATE.md)** - Favicon customization guide

## 🎨 Tech Stack

### Frontend
- React 18 with TypeScript
- Vite for build tooling
- Framer Motion for animations
- Wouter for routing
- TanStack Query for data fetching
- shadcn/ui component library
- Tailwind CSS for styling
- React Hook Form + Zod for validation

### Backend
- Express 5
- TypeScript
- In-memory storage (no database required)
- RESTful API

## 📦 Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm start` - Run production build
- `npm run check` - Type check with TypeScript

## 🎯 Project Structure

```
├── client/              # Frontend React application
│   ├── src/
│   │   ├── components/  # React components
│   │   ├── hooks/       # Custom hooks (animations, active section)
│   │   ├── lib/         # Utilities
│   │   ├── pages/       # Page components
│   │   └── main.tsx     # Entry point
│   └── public/          # Static assets (images, favicon)
├── server/              # Backend Express application
│   ├── index.ts        # Server entry point
│   ├── routes.ts       # API routes
│   └── storage.ts      # In-memory storage
├── shared/             # Shared types and schemas
└── render.yaml         # Render.com deployment config
```

## 🎨 Brand Colors

- Primary: #B22222 (Firebrick Red)
- Secondary: #000053 (Navy Blue)
- Tertiary: #111111 (Near Black)

## 🌐 Deployment

### Render.com (Recommended)
- Free tier available
- Automatic deployments
- Free SSL
- See [DEPLOY_NOW.md](DEPLOY_NOW.md)

### Other Options
- Vercel
- Netlify
- Railway
- Fly.io

## 📱 Features Showcase

### Animations
- Scroll-triggered entrance animations
- Staggered reveals for grids
- Hover effects (lift, scale, rotate)
- Infinite subtle animations
- Smooth transitions

### Navigation
- Active section highlighting
- Smooth scroll behavior
- Mobile-responsive menu
- Sticky header with blur effect

### Dark Mode
- System preference detection
- Manual toggle
- Persistent preference
- Smooth theme transitions

## 📱 Features Showcase

### Animations
- Scroll-triggered entrance animations
- Staggered reveals for grids
- Hover effects (lift, scale, rotate)
- Infinite subtle animations
- Smooth transitions

### Navigation
- Active section highlighting
- Smooth scroll behavior
- Mobile-responsive menu
- Sticky header with blur effect

### Dark Mode
- System preference detection
- Manual toggle
- Persistent preference
- Smooth theme transitions

## 🚀 Deploy to Render.com

### ✅ Build Fix Applied
Moved build tools (`tsx`, `esbuild`, `vite`) to dependencies so Render can build your app successfully.

### Quick Deploy (5 minutes)

1. **Push to GitHub:**
```bash
git init
git add .
git commit -m "Ready for deployment"
git remote add origin https://github.com/YOUR_USERNAME/gad-legal-consult.git
git push -u origin main
```

2. **Deploy on Render:**
   - Go to https://dashboard.render.com
   - Click "New +" → "Blueprint"
   - Connect your GitHub repository
   - Click "Apply"
   - Wait 2-5 minutes

3. **Done!** Your site is live at: `https://gad-legal-consult.onrender.com`

**Detailed guides:**
- [DEPLOY_NOW.md](DEPLOY_NOW.md) - Quick start
- [RENDER_DEPLOYMENT_GUIDE.md](RENDER_DEPLOYMENT_GUIDE.md) - Complete guide
- [DEPLOYMENT_CHECKLIST.md](DEPLOYMENT_CHECKLIST.md) - Step-by-step checklist

### Render Configuration

The `render.yaml` file is already configured with:
- Build command: `npm install && npm run build`
- Start command: `npm start`
- Environment: Production
- Port: 10000 (Render default)

### Free Tier
- 750 hours/month
- App sleeps after 15 min inactivity
- ~30 second cold start
- Perfect for portfolio sites

### Upgrade ($7/month)
- No sleep/downtime
- Faster performance
- Custom domain with SSL

## 🔧 Customization

### Update Services
Edit `client/src/pages/Landing.tsx` - Update the `SERVICES` array

### Update Contact Info
Edit `server/storage.ts` - Update the mock site configuration

### Update Colors
Edit `client/src/index.css` - Update CSS custom properties

## 📄 License

MIT

## 💬 Support

For questions or issues, check the documentation files or contact: info@gadlegalconsult.com

