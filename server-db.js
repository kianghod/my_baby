const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(express.static('public'));

// Initialize SQLite Database
const dbPath = path.join(__dirname, 'baby_tracker.db');
const db = new sqlite3.Database(dbPath);

// Create tables if they don't exist
db.serialize(() => {
    // Users table
    db.run(`CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT UNIQUE NOT NULL,
        display_name TEXT NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`);

    // Baby profile table (updated with user_id)
    db.run(`CREATE TABLE IF NOT EXISTS baby_profile (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        name TEXT NOT NULL,
        birth_date TEXT NOT NULL,
        photo TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users (id)
    )`);

    // Growth tracking table (updated with user_id)
    db.run(`CREATE TABLE IF NOT EXISTS growth_entries (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        date TEXT NOT NULL,
        weight REAL NOT NULL,
        height REAL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users (id)
    )`);

    // Feeding tracking table (updated with user_id)
    db.run(`CREATE TABLE IF NOT EXISTS feeding_entries (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        date TEXT NOT NULL,
        time TEXT NOT NULL,
        amount REAL NOT NULL,
        type TEXT NOT NULL DEFAULT 'bottle',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users (id)
    )`);

    // Diaper tracking table (updated with user_id)
    db.run(`CREATE TABLE IF NOT EXISTS diaper_entries (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        date TEXT NOT NULL,
        time TEXT NOT NULL,
        type TEXT NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users (id)
    )`);

    // Sleep tracking table (updated with user_id)
    db.run(`CREATE TABLE IF NOT EXISTS sleep_entries (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        date TEXT NOT NULL,
        start_time TEXT NOT NULL,
        end_time TEXT NOT NULL,
        duration INTEGER NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users (id)
    )`);

    // Insert default users if none exist
    db.get("SELECT COUNT(*) as count FROM users", (err, row) => {
        if (err) {
            console.error('Error checking users:', err);
            return;
        }
        if (row.count === 0) {
            const defaultUsers = [
                ['kiang', 'Kiang'],
                ['aoey', 'Aoey'],
                ['user3', 'User 3'],
                ['user4', 'User 4'],
                ['user5', 'User 5']
            ];
            
            defaultUsers.forEach(([username, displayName]) => {
                db.run(`INSERT INTO users (username, display_name) VALUES (?, ?)`, 
                    [username, displayName], function(err) {
                    if (err) {
                        console.error('Error creating default user:', err);
                        return;
                    }
                    
                    // Create default baby profile for each user
                    const babyName = username === 'kiang' ? 'Tommy' : username === 'aoey' ? 'Aoey Jr.' : `Baby ${displayName}`;
                    const birthDate = '2023-08-01';
                    const photo = 'https://images.unsplash.com/photo-1515488042361-ee00e0ddd4e4?q=80&w=200&h=200&fit=crop&crop=face';
                    
                    db.run(`INSERT INTO baby_profile (user_id, name, birth_date, photo) VALUES (?, ?, ?, ?)`, 
                        [this.lastID, babyName, birthDate, photo], (err) => {
                        if (err) {
                            console.error('Error creating default baby profile:', err);
                        }
                    });
                });
            });
        }
    });
});

// Helper function to calculate age
const calculateAge = (birthDate) => {
    const birth = new Date(birthDate);
    const now = new Date();
    const diffTime = Math.abs(now - birth);
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    const months = Math.floor(diffDays / 30);
    const days = diffDays % 30;
    return { months, days, totalDays: diffDays };
};

// API Routes

// Users endpoints
app.get('/api/users', (req, res) => {
    db.all("SELECT * FROM users ORDER BY id", (err, rows) => {
        if (err) {
            console.error('Database error:', err);
            return res.status(500).json({ error: 'Database error' });
        }
        res.json(rows || []);
    });
});

// Baby profile endpoints
app.get('/api/baby/:userId', (req, res) => {
    const userId = req.params.userId;
    
    db.get("SELECT * FROM baby_profile WHERE user_id = ?", [userId], (err, row) => {
        if (err) {
            console.error('Database error:', err);
            return res.status(500).json({ error: 'Database error' });
        }
        if (!row) {
            return res.json({ name: 'Baby', birthDate: new Date().toISOString().split('T')[0], photo: null });
        }
        const age = calculateAge(row.birth_date);
        res.json({
            id: row.id,
            userId: row.user_id,
            name: row.name,
            birthDate: row.birth_date,
            photo: row.photo,
            age
        });
    });
});

app.put('/api/baby/:userId', (req, res) => {
    const userId = req.params.userId;
    const { name, birthDate, photo } = req.body;
    
    db.get("SELECT id FROM baby_profile WHERE user_id = ?", [userId], (err, row) => {
        if (err) {
            console.error('Database error:', err);
            return res.status(500).json({ error: 'Database error' });
        }
        
        if (row) {
            // Update existing profile
            db.run(`UPDATE baby_profile SET name = ?, birth_date = ?, photo = ?, updated_at = CURRENT_TIMESTAMP WHERE user_id = ?`,
                [name, birthDate, photo, userId], function(err) {
                if (err) {
                    console.error('Database error:', err);
                    return res.status(500).json({ error: 'Database error' });
                }
                const age = calculateAge(birthDate);
                res.json({ id: row.id, userId: parseInt(userId), name, birthDate, photo, age });
            });
        } else {
            // Create new profile
            db.run(`INSERT INTO baby_profile (user_id, name, birth_date, photo) VALUES (?, ?, ?, ?)`,
                [userId, name, birthDate, photo], function(err) {
                if (err) {
                    console.error('Database error:', err);
                    return res.status(500).json({ error: 'Database error' });
                }
                const age = calculateAge(birthDate);
                res.json({ id: this.lastID, userId: parseInt(userId), name, birthDate, photo, age });
            });
        }
    });
});

// Growth tracking endpoints
app.get('/api/growth/:userId', (req, res) => {
    const userId = req.params.userId;
    
    db.all("SELECT * FROM growth_entries WHERE user_id = ? ORDER BY date DESC", [userId], (err, rows) => {
        if (err) {
            console.error('Database error:', err);
            return res.status(500).json({ error: 'Database error' });
        }
        res.json(rows || []);
    });
});

app.post('/api/growth/:userId', (req, res) => {
    const userId = req.params.userId;
    const { date, weight, height } = req.body;
    const entryDate = date || new Date().toISOString().split('T')[0];
    
    db.run(`INSERT INTO growth_entries (user_id, date, weight, height) VALUES (?, ?, ?, ?)`,
        [userId, entryDate, weight, height], function(err) {
        if (err) {
            console.error('Database error:', err);
            return res.status(500).json({ error: 'Database error' });
        }
        res.json({ id: this.lastID, userId: parseInt(userId), date: entryDate, weight, height });
    });
});

app.put('/api/growth/:userId/:id', (req, res) => {
    const userId = req.params.userId;
    const { date, weight, height } = req.body;
    const id = req.params.id;
    
    db.run(`UPDATE growth_entries SET date = ?, weight = ?, height = ? WHERE id = ? AND user_id = ?`,
        [date, weight, height, id, userId], function(err) {
        if (err) {
            console.error('Database error:', err);
            return res.status(500).json({ error: 'Database error' });
        }
        if (this.changes === 0) {
            return res.status(404).json({ error: 'Growth entry not found' });
        }
        res.json({ id: parseInt(id), userId: parseInt(userId), date, weight, height });
    });
});

app.delete('/api/growth/:userId/:id', (req, res) => {
    const userId = req.params.userId;
    const id = req.params.id;
    
    db.run(`DELETE FROM growth_entries WHERE id = ? AND user_id = ?`, [id, userId], function(err) {
        if (err) {
            console.error('Database error:', err);
            return res.status(500).json({ error: 'Database error' });
        }
        res.json({ success: true });
    });
});

// Feeding tracking endpoints
app.get('/api/feeding/:userId', (req, res) => {
    const userId = req.params.userId;
    
    db.all("SELECT * FROM feeding_entries WHERE user_id = ? ORDER BY date DESC, time DESC", [userId], (err, rows) => {
        if (err) {
            console.error('Database error:', err);
            return res.status(500).json({ error: 'Database error' });
        }
        res.json(rows || []);
    });
});

app.post('/api/feeding/:userId', (req, res) => {
    const userId = req.params.userId;
    const { date, time, amount, type } = req.body;
    const entryDate = date || new Date().toISOString().split('T')[0];
    const feedingType = type || 'bottle';
    
    db.run(`INSERT INTO feeding_entries (user_id, date, time, amount, type) VALUES (?, ?, ?, ?, ?)`,
        [userId, entryDate, time, amount, feedingType], function(err) {
        if (err) {
            console.error('Database error:', err);
            return res.status(500).json({ error: 'Database error' });
        }
        res.json({ id: this.lastID, userId: parseInt(userId), date: entryDate, time, amount, type: feedingType });
    });
});

app.put('/api/feeding/:userId/:id', (req, res) => {
    const userId = req.params.userId;
    const { date, time, amount, type } = req.body;
    const id = req.params.id;
    
    db.run(`UPDATE feeding_entries SET date = ?, time = ?, amount = ?, type = ? WHERE id = ? AND user_id = ?`,
        [date, time, amount, type, id, userId], function(err) {
        if (err) {
            console.error('Database error:', err);
            return res.status(500).json({ error: 'Database error' });
        }
        if (this.changes === 0) {
            return res.status(404).json({ error: 'Feeding entry not found' });
        }
        res.json({ id: parseInt(id), userId: parseInt(userId), date, time, amount, type });
    });
});

app.delete('/api/feeding/:userId/:id', (req, res) => {
    const userId = req.params.userId;
    const id = req.params.id;
    
    db.run(`DELETE FROM feeding_entries WHERE id = ? AND user_id = ?`, [id, userId], function(err) {
        if (err) {
            console.error('Database error:', err);
            return res.status(500).json({ error: 'Database error' });
        }
        res.json({ success: true });
    });
});

// Diaper tracking endpoints
app.get('/api/diaper/:userId', (req, res) => {
    const userId = req.params.userId;
    
    db.all("SELECT * FROM diaper_entries WHERE user_id = ? ORDER BY date DESC, time DESC", [userId], (err, rows) => {
        if (err) {
            console.error('Database error:', err);
            return res.status(500).json({ error: 'Database error' });
        }
        res.json(rows || []);
    });
});

app.post('/api/diaper/:userId', (req, res) => {
    const userId = req.params.userId;
    const { date, time, type } = req.body;
    const entryDate = date || new Date().toISOString().split('T')[0];
    
    db.run(`INSERT INTO diaper_entries (user_id, date, time, type) VALUES (?, ?, ?, ?)`,
        [userId, entryDate, time, type], function(err) {
        if (err) {
            console.error('Database error:', err);
            return res.status(500).json({ error: 'Database error' });
        }
        res.json({ id: this.lastID, userId: parseInt(userId), date: entryDate, time, type });
    });
});

app.put('/api/diaper/:userId/:id', (req, res) => {
    const userId = req.params.userId;
    const { date, time, type } = req.body;
    const id = req.params.id;
    
    db.run(`UPDATE diaper_entries SET date = ?, time = ?, type = ? WHERE id = ? AND user_id = ?`,
        [date, time, type, id, userId], function(err) {
        if (err) {
            console.error('Database error:', err);
            return res.status(500).json({ error: 'Database error' });
        }
        if (this.changes === 0) {
            return res.status(404).json({ error: 'Diaper entry not found' });
        }
        res.json({ id: parseInt(id), userId: parseInt(userId), date, time, type });
    });
});

app.delete('/api/diaper/:userId/:id', (req, res) => {
    const userId = req.params.userId;
    const id = req.params.id;
    
    db.run(`DELETE FROM diaper_entries WHERE id = ? AND user_id = ?`, [id, userId], function(err) {
        if (err) {
            console.error('Database error:', err);
            return res.status(500).json({ error: 'Database error' });
        }
        res.json({ success: true });
    });
});

// Sleep tracking endpoints
app.get('/api/sleep/:userId', (req, res) => {
    const userId = req.params.userId;
    
    db.all("SELECT * FROM sleep_entries WHERE user_id = ? ORDER BY date DESC, start_time DESC", [userId], (err, rows) => {
        if (err) {
            console.error('Database error:', err);
            return res.status(500).json({ error: 'Database error' });
        }
        // Convert database fields to match frontend expectations
        const sleepData = rows.map(row => ({
            id: row.id,
            userId: row.user_id,
            date: row.date,
            startTime: row.start_time,
            endTime: row.end_time,
            duration: row.duration
        }));
        res.json(sleepData || []);
    });
});

app.post('/api/sleep/:userId', (req, res) => {
    const userId = req.params.userId;
    const { date, startTime, endTime, duration } = req.body;
    const entryDate = date || new Date().toISOString().split('T')[0];
    
    db.run(`INSERT INTO sleep_entries (user_id, date, start_time, end_time, duration) VALUES (?, ?, ?, ?, ?)`,
        [userId, entryDate, startTime, endTime, duration], function(err) {
        if (err) {
            console.error('Database error:', err);
            return res.status(500).json({ error: 'Database error' });
        }
        res.json({ id: this.lastID, userId: parseInt(userId), date: entryDate, startTime, endTime, duration });
    });
});

app.put('/api/sleep/:userId/:id', (req, res) => {
    const userId = req.params.userId;
    const { date, startTime, endTime, duration } = req.body;
    const id = req.params.id;
    
    db.run(`UPDATE sleep_entries SET date = ?, start_time = ?, end_time = ?, duration = ? WHERE id = ? AND user_id = ?`,
        [date, startTime, endTime, duration, id, userId], function(err) {
        if (err) {
            console.error('Database error:', err);
            return res.status(500).json({ error: 'Database error' });
        }
        if (this.changes === 0) {
            return res.status(404).json({ error: 'Sleep entry not found' });
        }
        res.json({ id: parseInt(id), userId: parseInt(userId), date, startTime, endTime, duration });
    });
});

app.delete('/api/sleep/:userId/:id', (req, res) => {
    const userId = req.params.userId;
    const id = req.params.id;
    
    db.run(`DELETE FROM sleep_entries WHERE id = ? AND user_id = ?`, [id, userId], function(err) {
        if (err) {
            console.error('Database error:', err);
            return res.status(500).json({ error: 'Database error' });
        }
        res.json({ success: true });
    });
});

// Statistics endpoints
app.get('/api/stats/feeding/:userId', (req, res) => {
    const userId = req.params.userId;
    const today = new Date().toISOString().split('T')[0];
    
    // Get today's feedings
    db.all("SELECT * FROM feeding_entries WHERE user_id = ? AND date = ?", [userId, today], (err, todayRows) => {
        if (err) {
            console.error('Database error:', err);
            return res.status(500).json({ error: 'Database error' });
        }
        
        // Get all time total
        db.get("SELECT SUM(amount) as total FROM feeding_entries WHERE user_id = ?", [userId], (err, totalRow) => {
            if (err) {
                console.error('Database error:', err);
                return res.status(500).json({ error: 'Database error' });
            }
            
            const todayTotal = todayRows.reduce((sum, row) => sum + row.amount, 0);
            const totalAllTime = totalRow.total || 0;
            
            res.json({
                todayTotal,
                allTimeTotal: totalAllTime,
                todayCount: todayRows.length,
                avgPerFeeding: todayRows.length > 0 ? todayTotal / todayRows.length : 0
            });
        });
    });
});

app.get('/api/stats/diaper/:userId', (req, res) => {
    const userId = req.params.userId;
    const today = new Date().toISOString().split('T')[0];
    
    db.all("SELECT * FROM diaper_entries WHERE user_id = ? AND date = ?", [userId, today], (err, rows) => {
        if (err) {
            console.error('Database error:', err);
            return res.status(500).json({ error: 'Database error' });
        }
        
        const peeCount = rows.filter(r => r.type === 'pee' || r.type === 'both').length;
        const pooCount = rows.filter(r => r.type === 'poo' || r.type === 'both').length;
        
        res.json({
            todayTotal: rows.length,
            peeCount,
            pooCount
        });
    });
});

app.get('/api/stats/sleep/:userId', (req, res) => {
    const userId = req.params.userId;
    const today = new Date().toISOString().split('T')[0];
    
    db.all("SELECT * FROM sleep_entries WHERE user_id = ? AND date = ?", [userId, today], (err, rows) => {
        if (err) {
            console.error('Database error:', err);
            return res.status(500).json({ error: 'Database error' });
        }
        
        const totalMinutes = rows.reduce((sum, row) => sum + row.duration, 0);
        const avgSleep = rows.length > 0 ? totalMinutes / rows.length : 0;
        
        res.json({
            todayTotal: totalMinutes,
            sessionCount: rows.length,
            avgSession: avgSleep
        });
    });
});

// Serve the main HTML file
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Export the app for serverless environments
module.exports = app;

// Only start server if not in serverless environment
if (require.main === module) {
    app.listen(PORT, '0.0.0.0', () => {
        console.log(`Baby Tracker server with database is running on port ${PORT}`);
        console.log(`Visit http://localhost:${PORT} to use the app`);
        console.log(`Database: ${dbPath}`);
    });
}

// Graceful shutdown
process.on('SIGINT', () => {
    console.log('\nShutting down gracefully...');
    db.close((err) => {
        if (err) {
            console.error('Error closing database:', err);
        } else {
            console.log('Database connection closed.');
        }
        process.exit(0);
    });
}); 