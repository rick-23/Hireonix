const createError = require('http-errors');
const express = require('express');
const path = require('path');
const dotenv = require('dotenv');
const cookieParser = require('cookie-parser');
const cors = require('cors');
const httpLogger = require('./middlewares/httpLogger');
const profiles = require('./routes/profiles');
const { authRouter } = require('./routes/auth');
const errorHandler = require('./middlewares/errorHandler');
// const upload = require('./middlewares/upload'); // Uncomment if you have a custom upload middleware

dotenv.config({ path: path.join(__dirname, '../.env') });

const app = express();

app.use(httpLogger);
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(
    cors({
        origin: 'http://localhost:5173',
        credentials: true,
    }),
);

app.use('/', profiles, authRouter);
const uploadRouter = require('./routes/upload');
app.use('/', uploadRouter);

app.get('/favicon.ico', (req, res) => res.status(204).end());

// catch 404 and forward to error handler
app.use((_req, _res, next) => {
    next(createError(404));
});

// error handler
app.use(errorHandler);

module.exports = app;