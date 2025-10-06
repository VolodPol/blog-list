const { test, after, describe } = require('node:test')
const assert = require('node:assert')
const mongoose = require('mongoose')
const supertest = require('supertest')

const app = require('../app')
const User = require('../models/user')
const { fetchAllRecords } = require("./util");
const api = supertest(app)

const mockUser = require('./mock/user.json')


test.beforeEach(async () => {
    await User.insertOne(mockUser)
})

test.afterEach(async () => {
    await User.deleteMany({})
})

describe('test GET requests', () => {
    test('users returned correctly', async () => {
        const response = await api.get('/api/users')
        const users = response.body
        assert.strictEqual(users.length, 1)

        users.forEach(u => {
            assert.strictEqual(
                u.username === mockUser.username && u.name === mockUser.name && u.id && !u.passwordHash,
                true
            )
        })
    })
})

describe('verify POST requests', () => {
    test('verify user creation request and password is concealed', async () => {
        const newUser = {
            username: "anotherUser",
            name: "Second User",
            password: "032042243"
        }

        assert.strictEqual((await fetchAllRecords(User)).length, 1)
        const saveResponse = await api.post('/api/users')
            .send(newUser)
            .expect(201)
            .expect('Content-Type', /application\/json/)
        assert.strictEqual((await fetchAllRecords(User)).length, 2)
        const { username, name, passwordHash} = saveResponse.body

        assert.strictEqual(username, newUser.username)
        assert.strictEqual(name, newUser.name)
        assert.strictEqual(passwordHash, undefined)
    })

    test('verify invalid users', async () => {
        await api.post('/api/users')
            .send(mockUser)
            .expect(400)
            .expect(res => res.body.error === 'E11000 duplicate key error collection: bloglist.users index: username_1 dup key: { username: \"joeD\" }')
        await api.post('/api/users')
            .send(
                {
                    username: 'jo',
                    name: 'Joe Rogan',
                    password: '777283428'
                }
            ).expect(400)
            .expect(res => res.body.error === 'Username should be unique and contain at least 3 characters')
        await api.post('/api/users')
            .send(
                {
                    username: 'joe',
                    name: 'Joe Rogan',
                    password: '11'
                }
            ).expect(404)
            .expect(res => res.body.error === 'The password should contain at least 3 characters!')
    })
})


after(async () => {
    await mongoose.connection.close()
})