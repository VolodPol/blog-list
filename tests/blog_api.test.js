const { test, after } = require('node:test')
const assert = require('node:assert')
const mongoose = require('mongoose')
const supertest = require('supertest')

const app = require('../app')
const Blog = require('../models/blog')
const blogs = require('./mock/blogs.json')
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
        .expect('Content-Type', /application\/json/);
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

after(async () => {
    await mongoose.connection.close()
})