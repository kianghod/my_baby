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
    // Baby profile table
    db.run(`CREATE TABLE IF NOT EXISTS baby_profile (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        birth_date TEXT NOT NULL,
        photo TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`);

    // Growth tracking table
    db.run(`CREATE TABLE IF NOT EXISTS growth_entries (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        date TEXT NOT NULL,
        weight REAL NOT NULL,
        height REAL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`);

    // Feeding tracking table
    db.run(`CREATE TABLE IF NOT EXISTS feeding_entries (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        date TEXT NOT NULL,
        time TEXT NOT NULL,
        amount REAL NOT NULL,
        type TEXT NOT NULL DEFAULT 'bottle',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`);

    // Diaper tracking table
    db.run(`CREATE TABLE IF NOT EXISTS diaper_entries (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        date TEXT NOT NULL,
        time TEXT NOT NULL,
        type TEXT NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`);

    // Sleep tracking table
    db.run(`CREATE TABLE IF NOT EXISTS sleep_entries (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        date TEXT NOT NULL,
        start_time TEXT NOT NULL,
        end_time TEXT NOT NULL,
        duration INTEGER NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`);

    // Insert default baby profile if none exists
    db.get("SELECT COUNT(*) as count FROM baby_profile", (err, row) => {
        if (err) {
            console.error('Error checking baby profile:', err);
            return;
        }
        if (row.count === 0) {
            db.run(`INSERT INTO baby_profile (name, birth_date, photo) VALUES (?, ?, ?)`, 
                ['Tommy', '2023-08-01', 'https://images.unsplash.com/photo-1515488042361-ee00e0ddd4e4?q=80&w=200&h=200&fit=crop&crop=face'], (err) => {
                if (err) {
                    console.error('Error creating default profile:', err);
                }
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

// Baby profile endpoints
app.get('/api/baby', (req, res) => {
    db.get("SELECT * FROM baby_profile ORDER BY id DESC LIMIT 1", (err, row) => {
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
            name: row.name,
            birthDate: row.birth_date,
            photo: row.photo,
            age
        });
    });
});

app.put('/api/baby', (req, res) => {
    const { name, birthDate, photo } = req.body;
    
    db.get("SELECT id FROM baby_profile ORDER BY id DESC LIMIT 1", (err, row) => {
        if (err) {
            console.error('Database error:', err);
            return res.status(500).json({ error: 'Database error' });
        }
        
        if (row) {
            // Update existing profile
            db.run(`UPDATE baby_profile SET name = ?, birth_date = ?, photo = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?`,
                [name, birthDate, photo, row.id], function(err) {
                if (err) {
                    console.error('Database error:', err);
                    return res.status(500).json({ error: 'Database error' });
                }
                const age = calculateAge(birthDate);
                res.json({ id: row.id, name, birthDate, photo, age });
            });
        } else {
            // Create new profile
            db.run(`INSERT INTO baby_profile (name, birth_date, photo) VALUES (?, ?, ?)`,
                [name, birthDate, photo], function(err) {
                if (err) {
                    console.error('Database error:', err);
                    return res.status(500).json({ error: 'Database error' });
                }
                const age = calculateAge(birthDate);
                res.json({ id: this.lastID, name, birthDate, photo, age });
            });
        }
    });
});

// Growth tracking endpoints
app.get('/api/growth', (req, res) => {
    db.all("SELECT * FROM growth_entries ORDER BY date DESC", (err, rows) => {
        if (err) {
            console.error('Database error:', err);
            return res.status(500).json({ error: 'Database error' });
        }
        res.json(rows || []);
    });
});

app.post('/api/growth', (req, res) => {
    const { date, weight, height } = req.body;
    const entryDate = date || new Date().toISOString().split('T')[0];
    
    db.run(`INSERT INTO growth_entries (date, weight, height) VALUES (?, ?, ?)`,
        [entryDate, weight, height], function(err) {
        if (err) {
            console.error('Database error:', err);
            return res.status(500).json({ error: 'Database error' });
        }
        res.json({ id: this.lastID, date: entryDate, weight, height });
    });
});

app.put('/api/growth/:id', (req, res) => {
    const { date, weight, height } = req.body;
    const id = req.params.id;
    
    db.run(`UPDATE growth_entries SET date = ?, weight = ?, height = ? WHERE id = ?`,
        [date, weight, height, id], function(err) {
        if (err) {
            console.error('Database error:', err);
            return res.status(500).json({ error: 'Database error' });
        }
        if (this.changes === 0) {
            return res.status(404).json({ error: 'Growth entry not found' });
        }
        res.json({ id: parseInt(id), date, weight, height });
    });
});

app.delete('/api/growth/:id', (req, res) => {
    const id = req.params.id;
    
    db.run(`DELETE FROM growth_entries WHERE id = ?`, [id], function(err) {
        if (err) {
            console.error('Database error:', err);
            return res.status(500).json({ error: 'Database error' });
        }
        res.json({ success: true });
    });
});

// Feeding tracking endpoints
app.get('/api/feeding', (req, res) => {
    db.all("SELECT * FROM feeding_entries ORDER BY date DESC, time DESC", (err, rows) => {
        if (err) {
            console.error('Database error:', err);
            return res.status(500).json({ error: 'Database error' });
        }
        res.json(rows || []);
    });
});

app.post('/api/feeding', (req, res) => {
    const { date, time, amount, type } = req.body;
    const entryDate = date || new Date().toISOString().split('T')[0];
    const feedingType = type || 'bottle';
    
    db.run(`INSERT INTO feeding_entries (date, time, amount, type) VALUES (?, ?, ?, ?)`,
        [entryDate, time, amount, feedingType], function(err) {
        if (err) {
            console.error('Database error:', err);
            return res.status(500).json({ error: 'Database error' });
        }
        res.json({ id: this.lastID, date: entryDate, time, amount, type: feedingType });
    });
});

app.put('/api/feeding/:id', (req, res) => {
    const { date, time, amount, type } = req.body;
    const id = req.params.id;
    
    db.run(`UPDATE feeding_entries SET date = ?, time = ?, amount = ?, type = ? WHERE id = ?`,
        [date, time, amount, type, id], function(err) {
        if (err) {
            console.error('Database error:', err);
            return res.status(500).json({ error: 'Database error' });
        }
        if (this.changes === 0) {
            return res.status(404).json({ error: 'Feeding entry not found' });
        }
        res.json({ id: parseInt(id), date, time, amount, type });
    });
});

app.delete('/api/feeding/:id', (req, res) => {
    const id = req.params.id;
    
    db.run(`DELETE FROM feeding_entries WHERE id = ?`, [id], function(err) {
        if (err) {
            console.error('Database error:', err);
            return res.status(500).json({ error: 'Database error' });
        }
        res.json({ success: true });
    });
});

// Diaper tracking endpoints
app.get('/api/diaper', (req, res) => {
    db.all("SELECT * FROM diaper_entries ORDER BY date DESC, time DESC", (err, rows) => {
        if (err) {
            console.error('Database error:', err);
            return res.status(500).json({ error: 'Database error' });
        }
        res.json(rows || []);
    });
});

app.post('/api/diaper', (req, res) => {
    const { date, time, type } = req.body;
    const entryDate = date || new Date().toISOString().split('T')[0];
    
    db.run(`INSERT INTO diaper_entries (date, time, type) VALUES (?, ?, ?)`,
        [entryDate, time, type], function(err) {
        if (err) {
            console.error('Database error:', err);
            return res.status(500).json({ error: 'Database error' });
        }
        res.json({ id: this.lastID, date: entryDate, time, type });
    });
});

app.put('/api/diaper/:id', (req, res) => {
    const { date, time, type } = req.body;
    const id = req.params.id;
    
    db.run(`UPDATE diaper_entries SET date = ?, time = ?, type = ? WHERE id = ?`,
        [date, time, type, id], function(err) {
        if (err) {
            console.error('Database error:', err);
            return res.status(500).json({ error: 'Database error' });
        }
        if (this.changes === 0) {
            return res.status(404).json({ error: 'Diaper entry not found' });
        }
        res.json({ id: parseInt(id), date, time, type });
    });
});

app.delete('/api/diaper/:id', (req, res) => {
    const id = req.params.id;
    
    db.run(`DELETE FROM diaper_entries WHERE id = ?`, [id], function(err) {
        if (err) {
            console.error('Database error:', err);
            return res.status(500).json({ error: 'Database error' });
        }
        res.json({ success: true });
    });
});

// Sleep tracking endpoints
app.get('/api/sleep', (req, res) => {
    db.all("SELECT * FROM sleep_entries ORDER BY date DESC, start_time DESC", (err, rows) => {
        if (err) {
            console.error('Database error:', err);
            return res.status(500).json({ error: 'Database error' });
        }
        // Convert database fields to match frontend expectations
        const sleepData = rows.map(row => ({
            id: row.id,
            date: row.date,
            startTime: row.start_time,
            endTime: row.end_time,
            duration: row.duration
        }));
        res.json(sleepData || []);
    });
});

app.post('/api/sleep', (req, res) => {
    const { date, startTime, endTime, duration } = req.body;
    const entryDate = date || new Date().toISOString().split('T')[0];
    
    db.run(`INSERT INTO sleep_entries (date, start_time, end_time, duration) VALUES (?, ?, ?, ?)`,
        [entryDate, startTime, endTime, duration], function(err) {
        if (err) {
            console.error('Database error:', err);
            return res.status(500).json({ error: 'Database error' });
        }
        res.json({ id: this.lastID, date: entryDate, startTime, endTime, duration });
    });
});

app.put('/api/sleep/:id', (req, res) => {
    const { date, startTime, endTime, duration } = req.body;
    const id = req.params.id;
    
    db.run(`UPDATE sleep_entries SET date = ?, start_time = ?, end_time = ?, duration = ? WHERE id = ?`,
        [date, startTime, endTime, duration, id], function(err) {
        if (err) {
            console.error('Database error:', err);
            return res.status(500).json({ error: 'Database error' });
        }
        if (this.changes === 0) {
            return res.status(404).json({ error: 'Sleep entry not found' });
        }
        res.json({ id: parseInt(id), date, startTime, endTime, duration });
    });
});

app.delete('/api/sleep/:id', (req, res) => {
    const id = req.params.id;
    
    db.run(`DELETE FROM sleep_entries WHERE id = ?`, [id], function(err) {
        if (err) {
            console.error('Database error:', err);
            return res.status(500).json({ error: 'Database error' });
        }
        res.json({ success: true });
    });
});

// Statistics endpoints
app.get('/api/stats/feeding', (req, res) => {
    const today = new Date().toISOString().split('T')[0];
    
    // Get today's feedings
    db.all("SELECT * FROM feeding_entries WHERE date = ?", [today], (err, todayRows) => {
        if (err) {
            console.error('Database error:', err);
            return res.status(500).json({ error: 'Database error' });
        }
        
        // Get all time total
        db.get("SELECT SUM(amount) as total FROM feeding_entries", (err, totalRow) => {
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

app.get('/api/stats/diaper', (req, res) => {
    const today = new Date().toISOString().split('T')[0];
    
    db.all("SELECT * FROM diaper_entries WHERE date = ?", [today], (err, rows) => {
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

app.get('/api/stats/sleep', (req, res) => {
    const today = new Date().toISOString().split('T')[0];
    
    db.all("SELECT * FROM sleep_entries WHERE date = ?", [today], (err, rows) => {
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