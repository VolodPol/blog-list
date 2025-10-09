const blogRouter = require('express').Router()
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

    if (!requestBody.likes)
        requestBody.likes = 0

    const creator = request.user
    const blog = new Blog(
        {
            ...requestBody,
            user: creator.id
        }
    )

    const savedBlog = await blog.save()
    await User.updateOne({ _id: creator.id }, { $set: { blogs: creator.blogs.concat(savedBlog._id) } })

    response.status(201).json(savedBlog)
})

blogRouter.delete('/:id', async (request, response, next) => {
    const id = request.params.id
    const foundBlog = await Blog.findById(id)
    const authorId = request.user.id
    if (foundBlog.user.toString() !== authorId.toString())
        return next({ name: ERRORS.ILLEGAL_DELETION })


    const deleted = await Blog.findByIdAndDelete(id, {});
    console.log(
        'blogs from request user: ', request.user
    )

    if (deleted) {
        const updatedBlogs = request.user.blogs.filter(b => b.toString() !== deleted._id.toString() );
        await User.updateOne(
            { _id: authorId },
            { $set: { blogs:  updatedBlogs }}
        )
        return response.status(204).end()
    }

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