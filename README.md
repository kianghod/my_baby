# 👶 Baby Tracker Application

A comprehensive baby tracking application built with HTML, CSS, JavaScript, and Node.js. This app helps parents monitor their baby's daily activities including growth, feeding, diaper changes, and sleep patterns.

## 🌐 Live Demo

**🎮 INSTANT ACCESS**: [https://kianghod.github.io/my_baby](https://kianghod.github.io/my_baby)

### 🔥 **Complete Feature Parity with Local Version**

The GitHub Pages version now matches **ALL features** from `http://localhost:3000`:

**✅ Identical Features:**
- 👥 **Multi-User System**: 5 users (Kiang, Aoey, User 3-5) with separate data
- 📊 **Enhanced Statistics Dashboard**: Primary weight card + 4 metric cards  
- 📈 **Growth Charts**: Interactive Chart.js with weight/height/both views
- 🎯 **Collapsible Sections**: All sections collapse/expand with animations
- 📷 **Photo Upload**: Base64 storage with instant preview
- 🎨 **Glassmorphism UI**: Exact same design and interactions
- ⚡ **Real-time Updates**: All statistics update instantly
- 📱 **Mobile-responsive**: Perfect mobile experience

**💾 Storage Difference:**
- **Local**: SQLite database with cross-device sync
- **GitHub Pages**: localStorage with browser-specific data

## 🚀 Quick Start - Open HTML File

### Method 1: Double-click to Open
1. **Download or clone** this repository
2. **Double-click** `index.html` or `index-static.html` 
3. **It opens directly** in your web browser - no server needed!
4. **Start tracking** your baby's activities immediately

### Method 2: Command Line
```bash
# Navigate to the project folder
cd my_baby

# Open the HTML file directly
open index.html          # macOS
xdg-open index.html      # Linux  
start index.html         # Windows

# Or use npm scripts
npm run open             # Opens index.html
npm run open-static      # Opens index-static.html
```

### Method 3: Local Server (Optional)
```bash
# Serve files locally (if you prefer)
npm run serve            # Starts Python server on port 8000

# Then visit: http://localhost:8000
```

## 🌐 Deploy to GitHub Pages

### Automatic Deployment
1. **Fork or clone** this repository to your GitHub account
2. **Go to Settings** → Pages in your GitHub repository  
3. **Select source**: Deploy from a branch
4. **Choose branch**: `main` and folder `/ (root)`
5. **Your app will be live** at: `https://yourusername.github.io/repository-name`

### Manual Build (Optional)
```bash
# Build for GitHub Pages
npm run build            # Creates dist/ folder
npm run pages           # Build + ready message

# The files in dist/ are optimized for GitHub Pages
```

## 🎯 Feature Matching: Database vs Offline

**🎯 Perfect Feature Matching Achieved!**

| Feature | `http://localhost:3000` | `File: index.html` | `GitHub Pages` |
|---------|------------------------|-------------------|----------------|
| **User System** | ✅ 5 users with SQLite | ✅ 5 users with localStorage | ✅ 5 users with localStorage |
| **Growth Charts** | ✅ Chart.js with all views | ✅ Chart.js with all views | ✅ Chart.js with all views |
| **Statistics** | ✅ Enhanced dashboard | ✅ Enhanced dashboard | ✅ Enhanced dashboard |
| **Collapsible UI** | ✅ All sections collapse | ✅ All sections collapse | ✅ All sections collapse |
| **Photo Upload** | ✅ Base64 to database | ✅ Base64 to localStorage | ✅ Base64 to localStorage |
| **Real-time Updates** | ✅ Instant updates | ✅ Instant updates | ✅ Instant updates |
| **Mobile Design** | ✅ Glassmorphism UI | ✅ Glassmorphism UI | ✅ Glassmorphism UI |
| **Offline Usage** | ❌ Requires server | ✅ **100% Offline** | ✅ **Works offline after first load** |
| **Setup Required** | ✅ Node.js + npm install | ❌ **No setup needed** | ❌ **No setup needed** |

## 🔥 Three Ways to Use This App

### 1. 📁 **Direct HTML File** (Easiest)
- **Just double-click** `index.html`
- **Works instantly** - no installation needed
- **Perfect for**: Personal use, quick testing, no internet required

### 2. 🌐 **GitHub Pages** (Best for Sharing)
- **Deploy to GitHub Pages** in 2 minutes
- **Share with anyone** via URL
- **Perfect for**: Sharing with family, online access, mobile use

### 3. 🖥️ **Local Server** (Full Features)
- **Run** `npm start` for database version
- **Multi-device sync** via SQLite database
- **Perfect for**: Multiple devices, family sharing, permanent storage

## 🎯 Multi-User System

The application supports **5 different users**:
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
- **Backend**: Node.js with Express.js (optional - for database version)
- **Database**: SQLite3 with multi-user support (optional)
- **Storage**: localStorage for offline version
- **Styling**: Tailwind CSS with glassmorphism design
- **Icons**: Font Awesome icons
- **Charts**: Chart.js for growth visualization
- **Deployment**: GitHub Pages compatible

## Installation (For Database Version)

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

## 🎮 How to Use

### Getting Started
1. **Open the app** (HTML file, GitHub Pages, or localhost)
2. **Select User**: Choose any of the 5 users from the dropdown
3. **Edit Baby Profile**: Click the edit button (✏️) in the header to set your baby's name and birth date
4. **Add Entries**: Use the "+ Add" buttons in each section to record new data
5. **View Data**: All entries are displayed in chronological order with the most recent first
6. **Delete Entries**: Hover over entries to see the delete button (×)

### Sections

#### 📏 Growth
- Record weight (required) and height (optional)
- Displays latest weight in the statistics card
- Track growth progress over time
- **View Charts**: Click "Chart" button for interactive growth visualization

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

### HTML File & GitHub Pages:
- **Storage**: Browser localStorage for client-side data persistence
- **Multi-User**: 5 separate user profiles (Kiang, Aoey, User 3-5)
- **Data Types**: Growth, feeding, diaper, sleep tracking
- **Photos**: Base64 encoded images stored locally
- **Persistence**: Data saved per browser/device
- **Offline**: Works completely offline after first load

### Local Installation (with Database):
- **Database**: SQLite3 with multi-user support (`baby_tracker.db`)
- **Cross-device sync**: Server-based data synchronization
- **Production ready**: Full backend with API endpoints

## API Endpoints (Database Version Only)

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
- Edit the Tailwind config in the HTML file to add custom colors
- Modify the glassmorphism effects by adjusting backdrop blur and opacity values
- Update the color scheme by changing the CSS classes

### Adding Users
To add more users or modify existing ones:
1. **HTML Version**: Edit the `users` array in `script-static.js`
2. **Database Version**: Modify the database schema and user initialization

### Data Fields
To add new data fields or modify existing ones:
1. Update the HTML forms in the modal sections
2. Modify the JavaScript functions that handle data storage
3. For database version: Update the SQL schema

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

If you encounter any issues or have questions:
1. Check the README for common solutions
2. Open an issue on GitHub
3. Make sure you're using a modern web browser with JavaScript enabled

## 🎉 Changelog

### v1.0.0
- ✅ **HTML File Support**: Direct double-click to open
- ✅ **GitHub Pages Ready**: Deploy with zero configuration
- ✅ **Full Offline Mode**: Works without internet after first load
- ✅ **Perfect Feature Parity**: All features work identically across versions
- ✅ **Multi-User System**: 5 users with separate localStorage data
- ✅ **Enhanced UI**: Glassmorphism design with smooth animations
- ✅ **Growth Charts**: Interactive Chart.js integration
- ✅ **Mobile Optimized**: Perfect responsive design for all devices 