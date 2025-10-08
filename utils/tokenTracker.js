const PREFIX = 'Bearer '

const getToken = (request) => {
    const header = request.get('authorization')
    if (header && header.startsWith(PREFIX))
        return header.replace(PREFIX, '')

    return null
}

/**
 * Middleware for tracking a jwt bearer token fetched from 'Authorization' header
 * @param request
 * @param response
 * @param next
 */
const tokenTracker = (request, response, next) => {
    if (!request.token)
        request.token = getToken(request)

    next()
}

module.exports = { tokenTracker }