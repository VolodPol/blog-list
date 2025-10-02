const blogRouter = require('express').Router()
const Blog = require('../models/blog')


blogRouter.get('/', async (request, response) => {
    const fetchedBlogs = await Blog.find({})
    response.json(fetchedBlogs)
})

blogRouter.post('/', async (request, response) => {
    const blog = new Blog(request.body)

    response.status(201).json(
        await blog.save()
    )
})

module.exports = blogRouter