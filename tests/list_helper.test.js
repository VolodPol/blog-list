const { test, describe } = require('node:test')
const assert = require('node:assert')
const listHelper = require('../utils/list_helper')


test('dummy returns one', () => {
    const blogs = []

    const result = listHelper.dummy(blogs)
    assert.strictEqual(result, 1)
})

describe('verify totalLikes() function', () => {
    const blogs = require('./mock/blogs.json')

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