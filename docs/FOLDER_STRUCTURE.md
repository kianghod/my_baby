# 📁 Baby Tracker - Folder Structure

## 📂 Project Organization

```
my_baby/
├── 📄 index.html                     # Main static app (GitHub Pages)
├── 📄 index-static.html              # Backup static version
├── 📄 README.md                      # Main documentation
├── 📄 package.json                   # Node.js dependencies
├── 📄 .gitignore                     # Git ignore rules
│
├── 📂 src/                           # Source files
│   ├── 📂 js/                        # JavaScript files
│   │   └── 📄 baby-tracker.js        # Main app logic
│   ├── 📂 css/                       # CSS files  
│   │   └── 📄 styles.css             # App styles
│   └── 📂 assets/                    # Static assets
│       ├── 🖼️ favicon.svg            # App icon
│       ├── 🖼️ favicon-simple.svg     # Simple icon
│       ├── 🖼️ apple-touch-icon.svg   # iOS icon
│       └── 🖼️ logo.svg               # App logo
│
├── 📂 docs/                          # Documentation & server files
│   ├── 📄 FOLDER_STRUCTURE.md        # This file
│   ├── 📄 server-version.html        # Server-based version
│   └── 📄 script-server.js           # Server app logic
│
├── 📂 data/                          # Sample data files
│   ├── 📄 baby.json                  # Baby profile data
│   ├── 📄 growth.json                # Growth tracking data
│   ├── 📄 feeding.json               # Feeding records
│   ├── 📄 diaper.json                # Diaper change logs
│   └── 📄 sleep.json                 # Sleep tracking data
│
├── 📂 dist/                          # Production builds (future)
├── 📄 server.js                      # Express server (Node.js)
├── 📄 server-db.js                   # Database server version
└── 📄 baby_tracker.db                # SQLite database
```

## 🚀 Quick Start

### For Static Version (GitHub Pages)
```bash
# Simply open the file
open index.html

# Or serve locally
python -m http.server 8000
# Visit: http://localhost:8000
```

### For Server Version
```bash
npm install
npm start
# Visit: http://localhost:3000
```

## 📁 File Descriptions

### Core App Files
- **`index.html`** - Main static application optimized for GitHub Pages
- **`src/js/baby-tracker.js`** - Complete offline baby tracking logic with localStorage
- **`src/css/styles.css`** - Application styles and themes

### Assets & Resources  
- **`src/assets/`** - All icons, logos, and static images
- **`data/`** - JSON sample data for testing and development

### Server Components
- **`server.js`** - Express.js server for dynamic version
- **`server-db.js`** - Database-powered server version  
- **`baby_tracker.db`** - SQLite database with sample data

### Documentation
- **`README.md`** - Main project documentation
- **`docs/`** - Additional documentation and server versions

## 🔧 Development Guidelines

### Adding New Features
1. Edit `src/js/baby-tracker.js` for logic
2. Update `src/css/styles.css` for styling  
3. Test in both `index.html` and server versions
4. Update documentation as needed

### File Naming Conventions
- Use kebab-case for files: `baby-tracker.js`
- Use camelCase for JavaScript variables
- Use descriptive folder names: `assets/`, `docs/`

### Path References
- Static files reference: `./src/assets/icon.svg`
- JavaScript reference: `./src/js/baby-tracker.js`
- All paths are relative to project root

## 🌐 Deployment

### GitHub Pages
- Main file: `index.html`  
- Automatically deploys from main branch
- All assets properly referenced with relative paths

### Manual Server
- Use `server.js` for Express.js version
- Use `server-db.js` for database version
- Configure port and database as needed

## 📝 Notes

- **Clean Structure**: Organized by file type and purpose
- **GitHub Pages Ready**: All paths optimized for static hosting  
- **Development Friendly**: Clear separation of concerns
- **Backward Compatible**: Original files preserved in `docs/` 