const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(express.static('public'));

// Data directory
const dataDir = path.join(__dirname, 'data');
if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir);
}

// Initialize data files
const initDataFile = (filename, defaultData) => {
    const filePath = path.join(dataDir, filename);
    if (!fs.existsSync(filePath)) {
        fs.writeFileSync(filePath, JSON.stringify(defaultData, null, 2));
    }
};

// Initialize all data files
initDataFile('baby.json', {
    name: 'Tommy',
    birthDate: '2023-08-01',
    photo: null
});

initDataFile('growth.json', []);
initDataFile('feeding.json', []);
initDataFile('diaper.json', []);
initDataFile('sleep.json', []);

// Helper functions
const readData = (filename) => {
    const filePath = path.join(dataDir, filename);
    return JSON.parse(fs.readFileSync(filePath, 'utf8'));
};

const writeData = (filename, data) => {
    const filePath = path.join(dataDir, filename);
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
};

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

// Baby profile
app.get('/api/baby', (req, res) => {
    const baby = readData('baby.json');
    const age = calculateAge(baby.birthDate);
    res.json({ ...baby, age });
});

app.put('/api/baby', (req, res) => {
    const { name, birthDate, photo } = req.body;
    const baby = { name, birthDate, photo };
    writeData('baby.json', baby);
    const age = calculateAge(baby.birthDate);
    res.json({ ...baby, age });
});

// Growth tracking
app.get('/api/growth', (req, res) => {
    const growth = readData('growth.json');
    res.json(growth);
});

app.post('/api/growth', (req, res) => {
    const growth = readData('growth.json');
    const newEntry = {
        id: Date.now(),
        date: req.body.date || new Date().toISOString(),
        weight: req.body.weight,
        height: req.body.height
    };
    growth.push(newEntry);
    writeData('growth.json', growth);
    res.json(newEntry);
});

app.put('/api/growth/:id', (req, res) => {
    const growth = readData('growth.json');
    const index = growth.findIndex(item => item.id === parseInt(req.params.id));
    if (index !== -1) {
        growth[index] = {
            ...growth[index],
            date: req.body.date,
            weight: req.body.weight,
            height: req.body.height
        };
        writeData('growth.json', growth);
        res.json(growth[index]);
    } else {
        res.status(404).json({ error: 'Growth entry not found' });
    }
});

app.delete('/api/growth/:id', (req, res) => {
    const growth = readData('growth.json');
    const filtered = growth.filter(item => item.id !== parseInt(req.params.id));
    writeData('growth.json', filtered);
    res.json({ success: true });
});

// Feeding tracking
app.get('/api/feeding', (req, res) => {
    const feeding = readData('feeding.json');
    res.json(feeding);
});

app.post('/api/feeding', (req, res) => {
    const feeding = readData('feeding.json');
    const newEntry = {
        id: Date.now(),
        date: req.body.date || new Date().toISOString(),
        time: req.body.time,
        amount: req.body.amount,
        type: req.body.type || 'bottle'
    };
    feeding.push(newEntry);
    writeData('feeding.json', feeding);
    res.json(newEntry);
});

app.put('/api/feeding/:id', (req, res) => {
    const feeding = readData('feeding.json');
    const index = feeding.findIndex(item => item.id === parseInt(req.params.id));
    if (index !== -1) {
        feeding[index] = {
            ...feeding[index],
            date: req.body.date,
            time: req.body.time,
            amount: req.body.amount,
            type: req.body.type
        };
        writeData('feeding.json', feeding);
        res.json(feeding[index]);
    } else {
        res.status(404).json({ error: 'Feeding entry not found' });
    }
});

app.delete('/api/feeding/:id', (req, res) => {
    const feeding = readData('feeding.json');
    const filtered = feeding.filter(item => item.id !== parseInt(req.params.id));
    writeData('feeding.json', filtered);
    res.json({ success: true });
});

// Diaper tracking
app.get('/api/diaper', (req, res) => {
    const diaper = readData('diaper.json');
    res.json(diaper);
});

app.post('/api/diaper', (req, res) => {
    const diaper = readData('diaper.json');
    const newEntry = {
        id: Date.now(),
        date: req.body.date || new Date().toISOString(),
        time: req.body.time,
        type: req.body.type // 'pee', 'poo', or 'both'
    };
    diaper.push(newEntry);
    writeData('diaper.json', diaper);
    res.json(newEntry);
});

app.put('/api/diaper/:id', (req, res) => {
    const diaper = readData('diaper.json');
    const index = diaper.findIndex(item => item.id === parseInt(req.params.id));
    if (index !== -1) {
        diaper[index] = {
            ...diaper[index],
            date: req.body.date,
            time: req.body.time,
            type: req.body.type
        };
        writeData('diaper.json', diaper);
        res.json(diaper[index]);
    } else {
        res.status(404).json({ error: 'Diaper entry not found' });
    }
});

app.delete('/api/diaper/:id', (req, res) => {
    const diaper = readData('diaper.json');
    const filtered = diaper.filter(item => item.id !== parseInt(req.params.id));
    writeData('diaper.json', filtered);
    res.json({ success: true });
});

// Sleep tracking
app.get('/api/sleep', (req, res) => {
    const sleep = readData('sleep.json');
    res.json(sleep);
});

app.post('/api/sleep', (req, res) => {
    const sleep = readData('sleep.json');
    const newEntry = {
        id: Date.now(),
        date: req.body.date || new Date().toISOString(),
        startTime: req.body.startTime,
        endTime: req.body.endTime,
        duration: req.body.duration
    };
    sleep.push(newEntry);
    writeData('sleep.json', sleep);
    res.json(newEntry);
});

app.put('/api/sleep/:id', (req, res) => {
    const sleep = readData('sleep.json');
    const index = sleep.findIndex(item => item.id === parseInt(req.params.id));
    if (index !== -1) {
        sleep[index] = {
            ...sleep[index],
            date: req.body.date,
            startTime: req.body.startTime,
            endTime: req.body.endTime,
            duration: req.body.duration
        };
        writeData('sleep.json', sleep);
        res.json(sleep[index]);
    } else {
        res.status(404).json({ error: 'Sleep entry not found' });
    }
});

app.delete('/api/sleep/:id', (req, res) => {
    const sleep = readData('sleep.json');
    const filtered = sleep.filter(item => item.id !== parseInt(req.params.id));
    writeData('sleep.json', filtered);
    res.json({ success: true });
});

// Statistics endpoints
app.get('/api/stats/feeding', (req, res) => {
    const feeding = readData('feeding.json');
    const today = new Date().toDateString();
    const todayFeedings = feeding.filter(f => new Date(f.date).toDateString() === today);
    const totalToday = todayFeedings.reduce((sum, f) => sum + f.amount, 0);
    const totalAllTime = feeding.reduce((sum, f) => sum + f.amount, 0);
    
    res.json({
        todayTotal: totalToday,
        allTimeTotal: totalAllTime,
        todayCount: todayFeedings.length,
        avgPerFeeding: todayFeedings.length > 0 ? totalToday / todayFeedings.length : 0
    });
});

app.get('/api/stats/diaper', (req, res) => {
    const diaper = readData('diaper.json');
    const today = new Date().toDateString();
    const todayDiapers = diaper.filter(d => new Date(d.date).toDateString() === today);
    
    const peeCount = todayDiapers.filter(d => d.type === 'pee' || d.type === 'both').length;
    const pooCount = todayDiapers.filter(d => d.type === 'poo' || d.type === 'both').length;
    
    res.json({
        todayTotal: todayDiapers.length,
        peeCount,
        pooCount
    });
});

app.get('/api/stats/sleep', (req, res) => {
    const sleep = readData('sleep.json');
    const today = new Date().toDateString();
    const todaySleep = sleep.filter(s => new Date(s.date).toDateString() === today);
    
    const totalMinutes = todaySleep.reduce((sum, s) => sum + s.duration, 0);
    const avgSleep = todaySleep.length > 0 ? totalMinutes / todaySleep.length : 0;
    
    res.json({
        todayTotal: totalMinutes,
        sessionCount: todaySleep.length,
        avgSession: avgSleep
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
        console.log(`Baby Tracker server is running on port ${PORT}`);
        console.log(`Visit http://localhost:${PORT} to use the app`);
    });
} 