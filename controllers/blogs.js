const blogRouter = require('express').Router()
const Blog = require('../models/blog')


blogRouter.get('/', async (request, response) => {
    const fetchedBlogs = await Blog.find({})
    response.json(fetchedBlogs)
})

blogRouter.post('/', async (request, response) => {
    let requestBody = request.body
    const {title, url} = requestBody
    if (!title || !url)
        return response.status(400).end()

    if (!requestBody.likes)
        requestBody.likes = 0
    const blog = new Blog(requestBody)

    response.status(201).json(
        await blog.save()
    )
})

blogRouter.delete('/:id', async (request, response) => {
    const id = request.params.id;
    if (await Blog.findByIdAndDelete(id, {}))
        return response.status(204).end()

    response.status(400).json({ error: 'No blog with such id' })
})

module.exports = blogRouter