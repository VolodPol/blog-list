const ERRORS = Object.freeze({
    INVALID_PASSWORD: 'InvalidPassword',
    MONGO_NOT_UNIQUE: 'MongoServerError'
})



const errorHandler = (error, request, response, next) => {
    const errorName = error.name
    const { INVALID_PASSWORD, MONGO_NOT_UNIQUE } = ERRORS

    const reply = (code, message) => {
        console.log(message)
        return response.status(code).json(
            { error: message }
        )
    }

    switch (errorName) {
        case INVALID_PASSWORD:
            return reply(404, 'The password should contain at least 3 characters!')
        case MONGO_NOT_UNIQUE:
            return reply(400, error.errorResponse.errmsg)
        case 'ValidationError':
            return reply(400, 'Username should be unique and contain at least 3 characters')
    }

    next(error)
}

module.exports = { ERRORS, errorHandler}