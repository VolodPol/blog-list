const {reduce, groupBy} = require("lodash/collection");
const {last} = require("lodash/array")
const {toPairs, mapValues} = require("lodash/object");
const {sumBy} = require("lodash/math");


const dummy = (blogs) => {
    return 1
}


const totalLikes = blogs => !blogs
    ? 0
    : blogs.map(it => it.likes)
        .reduce((sum, likes) => sum + likes, 0)


const favoriteBlog = blogs => blogs
    .reduce((favorite, b) => favorite.likes > b.likes ? favorite : b)


const mostBlogs = inputBlogs => {
    const pairs = toPairs(
        mapValues(
            groupBy(inputBlogs, it => it.author),
            it => it.length
        )
    );
    const reducePairs = (best, current) => {
        const [... bestCount] = best
        const [... count] = current

        return count > bestCount ? current : best
    };
    const [author, blogs] = reduce(pairs, reducePairs)
    return {author, blogs}
}

const mostLikes = inputBlogs => {
    const paired = toPairs(
        mapValues(
            groupBy(inputBlogs, 'author'),
                list => sumBy(list, blog => blog.likes)
        )
    )
    const [author, likes] = reduce(
        paired,
        (mostLiked, array) => last(array) > last(mostLiked) ? array : mostLiked
    )
    return {author, likes};
}

module.exports = { dummy, totalLikes, favoriteBlog, mostBlogs, mostLikes}