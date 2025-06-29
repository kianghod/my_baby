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

## 🎯 Feature Matching: Database vs Offline

**🎯 Perfect Feature Matching Achieved!**

| Feature | `http://localhost:3000` | `https://kianghod.github.io/my_baby` |
|---------|------------------------|-------------------------------------|
| **User System** | ✅ 5 users with SQLite | ✅ 5 users with localStorage |
| **Growth Charts** | ✅ Chart.js with all views | ✅ Chart.js with all views |
| **Statistics** | ✅ Enhanced dashboard | ✅ Enhanced dashboard |
| **Collapsible UI** | ✅ All sections collapse | ✅ All sections collapse |
| **Photo Upload** | ✅ Base64 to database | ✅ Base64 to localStorage |
| **Real-time Updates** | ✅ Instant updates | ✅ Instant updates |
| **Mobile Design** | ✅ Glassmorphism UI | ✅ Glassmorphism UI |
| **Offline Usage** | ❌ Requires server | ✅ **100% Offline** |

## 🔥 Offline-First Capabilities

**GitHub Pages Version Benefits:**
- 🌐 **Works everywhere**: No server setup needed
- ⚡ **Instant loading**: Static files load instantly  
- 📱 **Offline-first**: Use without internet connection
- 💾 **Data persistence**: localStorage keeps data safe
- 🔄 **Multi-device**: Each device maintains its own data
- 🎯 **User switching**: Change users instantly

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
- **Backend**: Node.js with Express.js
- **Database**: SQLite3 with multi-user support
- **Styling**: Tailwind CSS with glassmorphism design
- **Icons**: Font Awesome icons
- **Charts**: Chart.js for growth visualization
- **Deployment**: GitHub Pages (auto-deploy)

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

## 🎮 How to Use the Live Demo

1. **Visit**: [https://kianghod.github.io/my_baby](https://kianghod.github.io/my_baby)
2. **Select User**: Choose any of the 5 users from the dropdown
3. **Track Baby Data**: Add feeding, growth, diaper, sleep entries  
4. **View Charts**: Check growth progress over time
5. **Upload Photos**: Change baby profile picture
6. **Multi-Device**: Data saved in browser localStorage

**💡 Note**: The live demo uses browser localStorage for data persistence. For production use with database backend, you can run the local installation above.

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

### Live Demo (GitHub Pages):
- **Storage**: Browser localStorage for client-side data persistence
- **Multi-User**: 5 separate user profiles (Kiang, Aoey, User 3-5)
- **Data Types**: Growth, feeding, diaper, sleep tracking
- **Photos**: Base64 encoded images stored locally
- **Persistence**: Data saved per browser/device

### Local Installation (with Database):
- **Database**: SQLite3 with multi-user support (`baby_tracker.db`)
- **Cross-device sync**: Server-based data synchronization
- **Production ready**: Full backend with API endpoints

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