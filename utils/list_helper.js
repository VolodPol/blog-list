const dummy = (blogs) => {
    return 1
}


const totalLikes = blogs => blogs ? blogs.map(it => it.likes)
        .reduce((sum, likes) => sum + likes, 0)
    : 0

module.exports = { dummy, totalLikes}