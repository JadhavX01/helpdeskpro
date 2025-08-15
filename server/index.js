const express = require('express');
const cors = require('cors');
require('dotenv').config();
const db = require('./db');

const authRoutes = require('./routes/auth');
const ticketRoutes = require('./routes/tickets');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/tickets', ticketRoutes);

app.listen(PORT, () => {
    console.log(`Server running at port ${PORT}`);
});
