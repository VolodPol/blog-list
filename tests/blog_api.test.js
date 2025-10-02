const { test, after } = require('node:test')
const assert = require('node:assert')
const mongoose = require('mongoose')
const supertest = require('supertest')

const app = require('../app')
const Blog = require('../models/blog')
const blogs = require('./mock/blogs.json')
const {fetchAllRecords} = require("./util");
const api = supertest(app)


test.beforeEach(async () => {
    await Blog.insertMany(blogs)
})

test.afterEach(async () => {
    await Blog.deleteMany({})
})

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

test('verify post request', async () => {
    const newBlog = {
        title: 'New blog',
        author: 'John Doe',
        url: 'http://www.here.ua/blog',
        likes: 10
    }

    const initialSize = blogs.length
    assert.strictEqual((await fetchAllRecords()).length, initialSize)
    const saveResponse = await api.post('/api/blogs')
        .send(newBlog)
        .expect(201)
        .expect('Content-Type', /application\/json/)
    assert.strictEqual((await fetchAllRecords()).length, initialSize + 1)
    const savedBlog = saveResponse.body

    assert.strictEqual(savedBlog.title, newBlog.title)
    assert.strictEqual(savedBlog.author, newBlog.author)
    assert.strictEqual(savedBlog.url, newBlog.url)
    assert.strictEqual(savedBlog.likes, newBlog.likes)

})

after(async () => {
    await mongoose.connection.close()
})