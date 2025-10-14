const User = require("../models/user");
const jwt = require("jsonwebtoken");
const { ERRORS } = require("../errors/hanlder");
const PREFIX = 'Bearer '

const getToken = (request) => {
    const header = request.get('authorization')
    if (header && header.startsWith(PREFIX))
        return header.replace(PREFIX, '')

    return null
}

/**
 * Middleware designed to keep track of a current user by its own jwt token for POST, DELETE, PUT requests
 * @param request
 * @param response
 * @param next
 * @returns {Promise<*>}
 */
const userTracker = async (request, response, next) => {
    if (request.method === 'GET' || request.url.includes('api/users') && request.method === 'POST')
        return next()

    const token = getToken(request)

    const payload = jwt.verify(token, process.env.SECRET)
    if (!payload.id)
        return next({ name: ERRORS.INVALID_TOKEN })

    const currentUser = await User.findById(payload.id)
    if (!currentUser)
        return next({ name: ERRORS.MISSING_USER })

    if (!request.user)
        request.user = {
            id: currentUser._id,
            username: currentUser.username,
            blogs: currentUser.blogs
        }
    next()
}

module.exports = userTracker