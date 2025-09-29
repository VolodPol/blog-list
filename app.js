const express = require("express");
const config = require('./utils/config')
const mongoose = require("mongoose")
const logger = require("./utils/logger")
const blogRouter = require("./controllers/blogs");


const app = express()
app.use(express.json())
app.use('/api/blogs', blogRouter)

const mongoUrl = config.MONGODB_URI
mongoose.connect(mongoUrl)
    .then(_ => {
        logger.info('Connected to MongoDB')
    })
    .catch(error => {
        logger.info('Error: could not connect to MondoDB: ', error.message);
    })

module.exports = app