const blogRouter = require('express').Router()
const jwt = require('jsonwebtoken')
const Blog = require('../models/blog')
const User = require('../models/user')
const { ERRORS } = require('../errors/hanlder')


blogRouter.get('/', async (request, response) => {
    const fetchedBlogs = await Blog.find({})
        .populate('user', { username: 1, name: 1, id: 1 })
    response.json(fetchedBlogs)
})

blogRouter.post('/', async (request, response, next) => {
    let requestBody = request.body
    const {title, url} = requestBody

    if (!title || !url)
        return response.status(400).end()

    const payload = jwt.verify(request.token, process.env.SECRET)
    if (!payload.id)
        return next({ name: ERRORS.INVALID_TOKEN })

    if (!requestBody.likes)
        requestBody.likes = 0

    const creator = await User.findById(payload.id)
    if (!creator)
        return next({ name: ERRORS.MISSING_USER })


    const blog = new Blog(
        {
            ...requestBody,
            user: creator._id
        }
    )

    const savedBlog = await blog.save()
    creator.blogs = creator.blogs.concat(savedBlog._id)
    await creator.save()

    response.status(201).json(savedBlog)
})

blogRouter.delete('/:id', async (request, response, next) => {
    const payload = jwt.verify(request.token, process.env.SECRET)
    if (!payload.id)
        return next({name: ERRORS.INVALID_TOKEN})

    const id = request.params.id
    const foundBlog = await Blog.findById(id)
    if (foundBlog.user.toString() !== payload.id)
        return next({ name: ERRORS.ILLEGAL_DELETION })


    if (await Blog.findByIdAndDelete(id, {}))
        return response.status(204).end()

    response.status(400).json({ error: 'No blog to delete with such id' })
})

blogRouter.put('/:id', async (request, response) => {
    const id = request.params.id
    const { likes } = request.body
    if (!likes)
        return response.status(400).json({ error: 'No \'likes\' property provided' })

    const updated = await Blog.findByIdAndUpdate(id, { $set: { likes: likes } }, { new: true })
    if (updated)
        return response.json(updated)

    response.status(400).json({ error: 'No blog to update with such id' })
})

module.exports = blogRouter