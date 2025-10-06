const bcrypt = require('bcrypt')
const usersRouter = require('express').Router()
const User = require('../models/user')
const { ERRORS } = require("../errors/hanlder");


const SALT_ROUNDS = 10

usersRouter.post('/', async (request, response, next) => {
    const { username, name, password } = request.body
    if (!password || password.length < 3 )
        return next({ name: ERRORS.INVALID_PASSWORD })

    const passwordHash = await bcrypt.hash(password, SALT_ROUNDS)

    const user = new User({
        username,
        name,
        passwordHash,
    })

    const savedUser = await user.save()
    response.status(201).json(savedUser)
})

usersRouter.get('/', async (request, response) => {
    response.status(200)
        .json(await User.find({}))
})

module.exports = usersRouter