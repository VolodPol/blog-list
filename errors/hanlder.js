const ERRORS = Object.freeze({
    INVALID_PASSWORD: 'InvalidPassword',
    MONGO_NOT_UNIQUE: 'MongoServerError',
    INCORRECT_CREDENTIALS: 'InvalidUsernameOrPassword',
    INVALID_TOKEN: 'InvalidToken',
    MISSING_USER: 'MissingUser',
    JWT_ERROR: 'JsonWebTokenError'
})



const errorHandler = (error, request, response, next) => {
    const errorName = error.name
    const { INVALID_PASSWORD, MONGO_NOT_UNIQUE, INCORRECT_CREDENTIALS, INVALID_TOKEN, MISSING_USER, JWT_ERROR } = ERRORS

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
        case INCORRECT_CREDENTIALS:
            return reply(401, 'Invalid username or password')
        case INVALID_TOKEN:
        case JWT_ERROR:
            return reply(401, 'Token invalid')
        case MISSING_USER:
            return reply(400, 'UserId missing or not valid')
    }

    next(error)
}

module.exports = { ERRORS, errorHandler}