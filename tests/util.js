const Blog = require('../models/blog')


const fetchAllRecords = async () => {
    const blogs = await Blog.find({})
    return blogs.map(it => it.toJSON())
}

module.exports = { fetchAllRecords }