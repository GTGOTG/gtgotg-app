const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Enable CORS for all routes
app.use(cors());

// Parse JSON bodies
app.use(express.json());

// Serve static files
app.use(express.static(path.join(__dirname, 'static')));

// API Routes
app.get('/api/health', (req, res) => {
    res.json({ status: 'healthy', message: 'GTGOTG API is running' });
});

app.post('/api/search', (req, res) => {
    const { query } = req.body;
    
    // Mock business data for demonstration
    const businesses = [
        {
            id: 1,
            name: "Shell Gas Station",
            type: "Gas Station",
            address: "100 Main Street, " + (query || "Denver, CO"),
            rating: 4.1,
            cleanliness: 4.1,
            safety: 4.4,
            verified: true,
            amenities: {
                toiletPaper: true,
                soapDispenser: true,
                paperTowels: true,
                handDryer: false,
                babyChanging: false,
                wheelchairAccessible: true,
                wheelchairStall: true,
                grabBars: true,
                loweredSink: false,
                goodLighting: true,
                cleanFloors: true,
                workingLock: true
            }
        },
        {
            id: 2,
            name: "McDonald's",
            type: "Restaurant",
            address: "211 Main Street, " + (query || "Denver, CO"),
            rating: 4.3,
            cleanliness: 4.5,
            safety: 4.1,
            verified: false,
            amenities: {
                toiletPaper: true,
                soapDispenser: true,
                paperTowels: true,
                handDryer: true,
                babyChanging: true,
                wheelchairAccessible: true,
                wheelchairStall: true,
                grabBars: true,
                loweredSink: true,
                goodLighting: true,
                cleanFloors: true,
                workingLock: true
            }
        },
        {
            id: 3,
            name: "Starbucks Coffee",
            type: "Coffee Shop",
            address: "322 Broadway, " + (query || "Denver, CO"),
            rating: 3.8,
            cleanliness: 3.9,
            safety: 3.7,
            verified: true,
            amenities: {
                toiletPaper: true,
                soapDispenser: true,
                paperTowels: false,
                handDryer: true,
                babyChanging: true,
                wheelchairAccessible: true,
                wheelchairStall: false,
                grabBars: false,
                loweredSink: false,
                goodLighting: true,
                cleanFloors: true,
                workingLock: true
            }
        }
    ];
    
    res.json({ businesses });
});

// Admin routes
app.get('/admin', (req, res) => {
    res.sendFile(path.join(__dirname, 'static', 'admin.html'));
});

app.post('/api/admin/login', (req, res) => {
    const { username, password } = req.body;
    
    if (username === 'admin' && password === 'gtgotg2025!') {
        res.json({ 
            success: true, 
            token: 'admin-token-' + Date.now(),
            message: 'Login successful' 
        });
    } else {
        res.status(401).json({ 
            success: false, 
            message: 'Invalid credentials' 
        });
    }
});

app.get('/api/admin/stats', (req, res) => {
    res.json({
        totalUsers: 1247,
        totalBusinesses: 3892,
        totalReviews: 8934,
        monthlyRevenue: 4250,
        activeUsers: 892,
        growthRate: 12.5
    });
});

// Catch all handler: send back React's index.html file
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'static', 'index.html'));
});

app.listen(PORT, '0.0.0.0', () => {
    console.log(`GTGOTG server running on port ${PORT}`);
});

module.exports = app;

