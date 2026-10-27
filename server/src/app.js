require('dotenv').config();
const path = require('path');
const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const { notFound, errorHandler } = require('./middlewares/errorHandler');

const app = express();
app.use(helmet());
app.use(cors({ origin: process.env.CORS_ORIGIN }));
app.use(express.json({ limit: '10kb' }));
app.use(express.static(path.join(__dirname, '../../client')));

app.use('/api/auth', require('./routes/auth'));
app.use('/api/viajes', require('./routes/viajes'));
app.use('/api', notFound);
app.use(errorHandler);

module.exports = app;
