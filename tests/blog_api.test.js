const { test, before, after, describe } = require('node:test')
const assert = require('node:assert')
const mongoose = require('mongoose')
const supertest = require('supertest')
const jwt = require('jsonwebtoken')

const app = require('../app')
const Blog = require('../models/blog')
const blogs = require('./mock/blogs.json')
const {fetchAllRecords} = require("./util");
const User = require("../models/user");
const mockUser = require("./mock/user.json");
const api = supertest(app)


let jwtToken


const initDB = async () => {
    const {_id, username} = await User.insertOne(mockUser);
    jwtToken = `Bearer ${jwt.sign({username: username, id: _id.toString()}, process.env.SECRET || 'secret')}`

    const savedBlogs = await Blog.insertMany(blogs);
    await Blog.updateMany({}, {$set: {user: _id}})
    await User.updateOne({}, {$set: {blogs: [...savedBlogs.map(b => b._id)]}})
}

const clear = async () => {
    await Blog.deleteMany({})
    await User.deleteMany({})
}

describe('test GET requests', () => {
    before(async () => await initDB())

    test('blogs are returned correctly', async () => {
        const received = await api
            .get('/api/blogs')
            .expect(200)
            .expect('Content-Type', /application\/json/)
        assert.strictEqual(received.body.length, blogs.length)
    })

    test('a specific blog is within the returned blogs', async () => {
        const response = await api.get('/api/blogs')

        const titles = response.body.map(e => e.title)
        assert.strictEqual(titles.includes('Canonical string reduction'), true)
    })

    test('verify ids are present', async () => {
        const response = await api.get('/api/blogs')
        assert.strictEqual(response.body.every(it => it.id), true)
    })

    after(async () => await clear())
})

describe('verify POST requests', () => {
    before(async () => initDB())

    test('verify post request', async () => {
        const newBlog = {
            title: 'New blog',
            author: 'John Doe',
            url: 'http://www.here.ua/blog',
            likes: 10
        }

        const initialSize = blogs.length
        assert.strictEqual((await fetchAllRecords(Blog)).length, initialSize)
        const saveResponse = await api.post('/api/blogs')
            .set('Authorization', jwtToken)
            .send(newBlog)
            .expect(201)
            .expect('Content-Type', /application\/json/)
        assert.strictEqual((await fetchAllRecords(Blog)).length, initialSize + 1)
        const savedBlog = saveResponse.body

        assert.strictEqual(savedBlog.title, newBlog.title)
        assert.strictEqual(savedBlog.author, newBlog.author)
        assert.strictEqual(savedBlog.url, newBlog.url)
        assert.strictEqual(savedBlog.likes, newBlog.likes)

    })

    test('verify no \'id\' property is handled correctly in POST request', async() => {
        const newBlog = {
            title: 'New blog',
            author: 'John Doe',
            url: 'http://www.here.ua/blog'
        }
        const saved = (await api.post('/api/blogs').set('Authorization', jwtToken).send(newBlog)).body
        assert.strictEqual(saved.likes, 0)
    })

    test('verify POST request with missing obligatory properties', async () => {
        await api.post('/api/blogs')
            .set('Authorization', jwtToken)
            .send(
                {
                    author: 'John Doe',
                    url: 'http://www.here.ua/blog'
                }
            ).expect(400)
        await api.post('/api/blogs')
            .set('Authorization', jwtToken)
            .send(
                {
                    title: 'New blog',
                    author: 'John Doe'
                }
            ).expect(400)
    })
    after(async() => await clear())
})




describe('verify DELETE requests', async () => {
    await before(async () => await initDB())

    await test('succeeds with status code 204 if id is valid', async () => {
        const initialBlogs = await fetchAllRecords(Blog)
        const blogToDelete = initialBlogs[0]

        await api.delete(`/api/blogs/${blogToDelete.id}`)
            .set('Authorization', jwtToken).expect(204)

        const afterDeletion = await fetchAllRecords(Blog)

        const titles = afterDeletion.map(b => b.title)
        assert(!titles.includes(blogToDelete.title))

        assert.strictEqual(afterDeletion.length, initialBlogs.length - 1)
        assert.strictEqual((await User.findOne({})).blogs.length, afterDeletion.length)
    })

    after(async () => await clear())
})


describe('verify PUT requests', () => {
    before(async () => await initDB())

    test('number of likes is updated successful', async () => {
        const countBlogs = async () => (await fetchAllRecords(Blog)).length
        const initialCount = await countBlogs()

        const blogToUpdate = (await fetchAllRecords(Blog))[0]
        blogToUpdate.likes += 10

        const response = await api.put(`/api/blogs/${blogToUpdate.id}`)
            .set('Authorization', jwtToken)
            .send(blogToUpdate)
            .expect(200)
        const { likes } = response.body

        assert.strictEqual(likes, blogToUpdate.likes)
        assert.strictEqual(initialCount, await countBlogs())
    })

    after(async () => await clear())
})


after(async () => {
    await mongoose.connection.close()
})