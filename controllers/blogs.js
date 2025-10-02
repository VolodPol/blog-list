const blogRouter = require('express').Router()
const Blog = require('../models/blog')


blogRouter.get('/', async (request, response) => {
    const fetchedBlogs = await Blog.find({})
    response.json(fetchedBlogs)
})

blogRouter.post('/', async (request, response) => {
    let requestBody = request.body
    if (!requestBody.likes)
        requestBody.likes = 0
    const blog = new Blog(requestBody)

    response.status(201).json(
        await blog.save()
    )
})

module.exports = blogRouter