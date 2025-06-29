# 👶 Baby Tracker Application

A comprehensive baby tracking application built with HTML, CSS, JavaScript, and Node.js. This app helps parents monitor their baby's daily activities including growth, feeding, diaper changes, and sleep patterns.

## 🌐 Live Demo & Quick Deploy

**🎮 PLAY THE APP NOW**: 
- **GitHub Pages**: [https://kianghod.github.io/my_baby](https://kianghod.github.io/my_baby) 🔥 **INSTANT ACCESS**
- **Vercel Demo**: [https://my-baby-tracker.vercel.app](https://my-baby-tracker.vercel.app) 
- **Railway Deploy**: [https://my-baby-production.up.railway.app](https://my-baby-production.up.railway.app)
- **Render Demo**: [https://my-baby-tracker.onrender.com](https://my-baby-tracker.onrender.com)

**🚀 One-Click Deploy**: 
[![Deploy on Railway](https://railway.app/button.svg)](https://railway.app/new/template/VqUtgx)
[![Deploy to Render](https://render.com/images/deploy-to-render-button.svg)](https://render.com/deploy?repo=https://github.com/kianghod/my_baby)
[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/kianghod/my_baby)

**📦 Alternative Free Deployments**:
- **Railway**: Instant deployment with database support
- **Render**: Free tier with auto-deployment from GitHub  
- **Vercel**: Serverless deployment with global CDN
- **Netlify**: Static + serverless functions

## 🎯 Multi-User System

The application now supports **5 different users**:
- 👤 **Kiang** (Default user)
- 👤 **Aoey** (Second user)  
- 👤 **User 3, 4, 5** (Additional slots)

Each user has completely separate data and can track their own baby independently!

## Features

- **Baby Profile Management**: Store baby's name, birth date, and calculate age automatically
- **Growth Tracking**: Record weight and height measurements over time
- **Feeding Management**: Track milk intake, feeding times, and calculate totals
- **Diaper Tracking**: Log diaper changes with type (pee, poo, both)
- **Sleep Monitoring**: Record sleep sessions with duration calculations
- **Statistics**: Real-time statistics and averages for all activities
- **Mobile-First Design**: Responsive design optimized for mobile devices
- **Modern UI**: Beautiful gradient backgrounds and smooth animations

## 💻 Technology Stack

- **Frontend**: HTML5, Tailwind CSS, JavaScript (ES6+)
- **Backend**: Node.js with Express.js
- **Database**: SQLite3 with multi-user support
- **Styling**: Tailwind CSS with glassmorphism design
- **Icons**: Font Awesome icons
- **Charts**: Chart.js for growth visualization
- **Deployment**: Railway, Render, GitHub Actions

## Installation

1. **Clone or download the project files**

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Start the database server**:
   ```bash
   node server-db.js
   ```

   Or use npm start (configured for database server):
   ```bash
   npm start
   ```

4. **Open your browser** and visit:
   ```
   http://localhost:3000
   ```

5. **Select User**: Choose from 5 available users (Kiang, Aoey, User 3-5) in the dropdown

## 🚀 Deploy to Free Hosting

### Option 1: Railway.app (Recommended - Free)
1. **Click Deploy Button**: [![Deploy on Railway](https://railway.app/button.svg)](https://railway.app/template/VXhiPQ?referralCode=MY_BABY)
2. **Connect GitHub**: Connect your GitHub account
3. **Select Repository**: Choose `kianghod/my_baby`
4. **Deploy**: Railway will automatically deploy your app
5. **Get URL**: Your app will be live at `https://your-app.up.railway.app`

### Option 2: Render.com (Free)
1. **Sign up**: Create account at [render.com](https://render.com)
2. **New Web Service**: Click "New" → "Web Service"
3. **Connect GitHub**: Connect `https://github.com/kianghod/my_baby`
4. **Configure**: 
   - Build Command: `npm install`
   - Start Command: `node server-db.js`
5. **Deploy**: Click "Create Web Service"

### Option 3: Vercel (Free)
1. **Import**: Go to [vercel.com](https://vercel.com) → Import Project
2. **GitHub**: Select `kianghod/my_baby` repository
3. **Configure**: Vercel will auto-detect settings
4. **Deploy**: Click "Deploy"

### Option 4: Heroku (Free Tier Ended - Paid)
1. **Install Heroku CLI**: Download from [heroku.com](https://heroku.com)
2. **Login**: `heroku login`
3. **Create App**: `heroku create your-baby-tracker`
4. **Deploy**: `git push heroku main`

## Usage

### Getting Started
1. **Edit Baby Profile**: Click the edit button (✏️) in the header to set your baby's name and birth date
2. **Add Entries**: Use the "+ Add" buttons in each section to record new data
3. **View Data**: All entries are displayed in chronological order with the most recent first
4. **Delete Entries**: Hover over entries to see the delete button (×)

### Sections

#### 📏 Growth
- Record weight (required) and height (optional)
- Displays latest weight in the statistics card
- Track growth progress over time

#### 🍼 Milk & 🥄 Feeding
- Log feeding times and amounts
- Choose between bottle or breast feeding
- Automatic calculation of daily totals
- Real-time milk consumption statistics

#### 🚼 Pee/Poo
- Quick logging of diaper changes
- Select type: Pee, Poo, or Both
- Statistics show daily averages

#### 😴 Sleep
- Record sleep start and end times
- Automatic duration calculation
- Handles overnight sleep sessions
- Shows sleep patterns and averages

## 🗄️ Data Storage

The application uses **SQLite database** (`baby_tracker.db`) with multi-user support:

### Database Schema:
- **`users`** - User profiles (5 users: Kiang, Aoey, User 3-5)
- **`baby_profiles`** - Baby information per user
- **`growth_entries`** - Weight/height measurements per user
- **`feeding_entries`** - Feeding records per user
- **`diaper_entries`** - Diaper change logs per user
- **`sleep_entries`** - Sleep session data per user

### Data Persistence:
- ✅ **Cross-device synchronization** - Data saved to server database
- ✅ **User separation** - Each user has completely separate data
- ✅ **Photo storage** - Base64 encoded images stored in database
- ✅ **Session persistence** - User selection remembered locally

## API Endpoints

### Baby Profile
- `GET /api/baby` - Get baby profile
- `PUT /api/baby` - Update baby profile

### Growth
- `GET /api/growth` - Get all growth entries
- `POST /api/growth` - Add new growth entry
- `DELETE /api/growth/:id` - Delete growth entry

### Feeding
- `GET /api/feeding` - Get all feeding entries
- `POST /api/feeding` - Add new feeding entry
- `DELETE /api/feeding/:id` - Delete feeding entry

### Diaper
- `GET /api/diaper` - Get all diaper entries
- `POST /api/diaper` - Add new diaper entry
- `DELETE /api/diaper/:id` - Delete diaper entry

### Sleep
- `GET /api/sleep` - Get all sleep entries
- `POST /api/sleep` - Add new sleep entry
- `DELETE /api/sleep/:id` - Delete sleep entry

### Statistics
- `GET /api/stats/feeding` - Get feeding statistics
- `GET /api/stats/diaper` - Get diaper statistics
- `GET /api/stats/sleep` - Get sleep statistics

## Customization

### Styling
The app uses Tailwind CSS for styling. To customize:
- Edit the Tailwind config in `public/index.html` to add custom colors
- Modify HTML classes to change design elements
- Add custom CSS in `public/style.css` if needed for complex styles
- All responsive design is handled by Tailwind's built-in classes

### Functionality
Edit `public/script.js` to modify:
- Form validation
- Data processing
- UI interactions
- API calls

### Server Configuration
Edit `server.js` to change:
- Port number (default: 3000)
- API endpoints
- Data validation
- File storage logic

## Mobile Experience

The app is designed mobile-first with:
- Touch-friendly buttons and forms
- Responsive layout that adapts to screen size
- Easy one-handed operation
- Smooth scrolling and animations
- Optimized for iOS and Android browsers

## Troubleshooting

### Common Issues

1. **Port already in use**:
   - Change the PORT in `server.js` or kill the process using port 3000

2. **Data not loading**:
   - Check that the `data/` directory exists
   - Ensure proper file permissions
   - Check browser console for errors

3. **Mobile display issues**:
   - Ensure proper viewport meta tag
   - Check CSS media queries
   - Test on different devices/browsers

### Development

For development, you can:
- Use `nodemon` for auto-restart: `npm run dev`
- Check browser developer tools for errors
- Monitor server logs in terminal
- Test API endpoints with tools like Postman

## Contributing

Feel free to enhance the application by:
- Adding new tracking categories
- Improving the UI/UX
- Adding data export features
- Implementing data visualization
- Adding push notifications
- Creating a Progressive Web App (PWA)

## License

This project is open source and available under the MIT License. 