const dummy = (blogs) => {
    return 1
}


const totalLikes = blogs => !blogs
    ? 0
    : blogs.map(it => it.likes)
        .reduce((sum, likes) => sum + likes, 0)


const favoriteBlog = blogs => blogs
    .reduce((favorite, b) => favorite.likes > b.likes ? favorite : b)

module.exports = { dummy, totalLikes, favoriteBlog}