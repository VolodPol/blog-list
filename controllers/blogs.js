const blogRouter = require('express').Router()
const Blog = require('../models/blog')
const User = require('../models/user')


blogRouter.get('/', async (request, response) => {
    const fetchedBlogs = await Blog.find({})
        .populate('user', { username: 1, name: 1, id: 1 })
    response.json(fetchedBlogs)
})

blogRouter.post('/', async (request, response) => {
    let requestBody = request.body
    const {title, url} = requestBody
    if (!title || !url)
        return response.status(400).end()

    if (!requestBody.likes)
        requestBody.likes = 0
    const creator = await User.findOne({})
    const blog = new Blog(
        {
            ...requestBody,
            user: creator
        }
    )

    response.status(201).json(
        await blog.save()
    )
})

blogRouter.delete('/:id', async (request, response) => {
    const id = request.params.id;
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