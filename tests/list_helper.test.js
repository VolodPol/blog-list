const { test, describe } = require('node:test')
const assert = require('node:assert')
const listHelper = require('../utils/list_helper')

const blogs = require('./mock/blogs.json')

test('dummy returns one', () => {
    const blogs = []

    const result = listHelper.dummy(blogs)
    assert.strictEqual(result, 1)
})

describe('verify totalLikes() function', () => {
    test('empty input', () => {
        assert.strictEqual(listHelper.totalLikes([]), 0)
        assert.strictEqual(listHelper.totalLikes(), 0)
    })

    test('test 1 blog in the list', () => {
        assert.strictEqual(listHelper.totalLikes(blogs.slice(0, 1)), blogs[0].likes)
    })

    test('full case verification', () => {
        assert.strictEqual(
            listHelper.totalLikes(blogs),
            blogs.reduce((sum, blog) => sum + blog.likes, 0)
        )
    })
})

describe('verify favoriteBlog() function', () => {
    assert.deepStrictEqual(
        listHelper.favoriteBlog(blogs),
        blogs.find(b => b.title === 'Canonical string reduction')
    )
})

describe('verify mostBlogs() function', () => {
    assert.deepStrictEqual(
        listHelper.mostLikes(blogs),
        {
            author: "Edsger W. Dijkstra",
            likes: 17
        }
    )
})