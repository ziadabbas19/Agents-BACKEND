const express = require('express');
const  cors = require('cors');
const dotenv = require('dotenv');

dotenv.config();

const app  = express();

app.use(cors());
app.use(express.json());



// Routes
app.use('/api/auth', require('./routes/auth.routes'));
app.use('/api/agents', require('./routes/agents.routes'));
app.use('/api/areas', require('./routes/area.routes'));
app.use('/api/dailylog', require('./routes/dailyLog.routes'))


// 404
app.use((req, res, next) => {
    res.status(404).json({ message: "Not Found" });
});

// Global Error Handler
app.use((err, req, res, next) => {
    const statusCode = res.statusCode !== 200 ? res.statusCode : 500;
    res.status(statusCode).json({
    message: err.message,
    stack: process.env.NODE_ENV === "production" ? null : err.stack,
    });
});

module.exports = app;