// backend/index.js (ปรับปรุงเพื่อเพิ่ม Image Proxy Route)
require('dotenv').config();
const express = require('express');
const { Pool } = require('pg');
const cors = require('cors');
const path = require('path');

// นำเข้า Routes modules
const userRoutes = require('./routes/userRoutes');
const teamRoutes = require('./routes/teamRoutes');
const playerRoutes = require('./routes/playerRoutes');
const newsRoutes = require('./routes/newsRoutes');
const matchRoutes = require('./routes/matchRoutes');


const app = express();
const port = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// ตั้งค่า Pool สำหรับเชื่อมต่อ PostgreSQL
const pool = new Pool({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_DATABASE,
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT,
});

// ทดสอบการเชื่อมต่อฐานข้อมูล
pool.connect((err, client, done) => {
    if (err) {
        console.error('Database connection error:', err.stack);
        return;
    }
    console.log('Successfully connected to PostgreSQL database!');
    client.release();
});

// Routes หลักของ API
app.get('/', (req, res) => {
    res.send('TAE E-SPORT Backend API is running!');
});

// ใช้ Routes ทั้งหมด
app.use('/api/users', userRoutes(pool));
app.use('/api/teams', teamRoutes(pool));
app.use('/api/players', playerRoutes(pool));
app.use('/api/news', newsRoutes(pool));
app.use('/api/matches', matchRoutes(pool));


// เริ่มต้น Server
app.listen(port, () => {
    console.log(`TAE E-SPORT Backend running on http://localhost:${port}`);
});