require("dotenv").config()
const express = require("express")
const app = express()
const cors = require('cors')
const morgan = require('morgan')
const apiRouter = require('./api')


// Setup your Middleware and API Router here
app.use(express.json());
app.use(cors);
app.use(morgan);
app.use('/api', apiRouter);


module.exports = app;
