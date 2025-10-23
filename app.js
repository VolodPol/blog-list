const express = require("express");
const config = require('./utils/config')
const mongoose = require("mongoose")
const logger = require("./utils/logger")
const blogRouter = require("./controllers/blogs")
const userRouter = require('./controllers/users')
const loginRouter = require('./controllers/login')
const userTracker = require("./utils/userTracker");
const { errorHandler } = require("./errors/hanlder");


const app = express()

app.use(express.json())

if (process.env.NODE_ENV === 'test') {
    const testingRouter = require('./controllers/testing')
    app.use('/api/reset', testingRouter)
}

app.use('/api/blogs', userTracker, blogRouter)
app.use('/api/users', userRouter)
app.use('/api/login', loginRouter)
app.use(errorHandler)

const mongoUrl = config.MONGODB_URI
mongoose.connect(mongoUrl)
    .then(_ => {
        logger.info('Connected to MongoDB')
    })
    .catch(error => {
        logger.info('Error: could not connect to MondoDB: ', error.message);
    })

module.exports = app