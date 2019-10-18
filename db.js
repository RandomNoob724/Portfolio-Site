const sqlite = require('sqlite3')
const db = new sqlite.Database("database.db")

exports.getProjects = function (callback) {
    const query = "SELECT * FROM projects"
    db.all(query, function (error, projects) {
        callback(error, projects)
    })
}

exports.getProjectWithId = function(id, callback){
    const query = "SELECT * FROM projects WHERE id = ?"
    const values = [id]

    db.get(query, values, function(error, project){
        callback(error, project)
    })
}

exports.updateProjectWithId = function(title, description, link, id, callback){
    const query = "UPDATE projects SET name = ?, description = ?, link = ? WHERE id = ?"
    const values = [title, description, link, id]

    db.run(query, values, function(error){
        callback(error)
    })
}

exports.addNewProject = function (projectName, projectDescription, projectLink, callback) {
    const query = "INSERT INTO projects (name, description, link) VALUES (?,?,?)"
    const values = [projectName, projectDescription, projectLink]
    db.run(query, values, function (error) {
        const projectID = this.lastID
        callback(error, projectID)
    })
}

exports.deleteProjectWithId = function(id, callback){
    const query = "DELETE FROM projects WHERE id = ?"
    const values = [id]
    db.run(query, values, function(error){
        callback(error)
    })
}

exports.getAllBlogPosts = function (callback) {
    const query = "SELECT * FROM blogpost ORDER BY blogpostID DESC"

    db.all(query, function (error, blogpost) {
        callback(error, blogpost)
    })
}

exports.getBlogPostById = function (id, callback) {
    const query = "SELECT * FROM blogpost WHERE blogpostID = ?"
    const values = [id]

    db.get(query, values, function (error, blogpost) {
        callback(error, blogpost)
    })
}

exports.getAmountOfPosts = function(callback){
    const query = "SELECT COUNT(*) AS nrOfRows FROM blogpost"

    db.get(query, function(error, amount){
        callback(error, amount)
    })
}

exports.getBlogPostWithinLimit = function(limit, offset, callback){
    const query = "SELECT * FROM blogpost ORDER BY blogpostID DESC LIMIT ? OFFSET ? "
    const values = [limit, offset]

    db.all(query, values, function(error, blogposts){
        callback(error, blogposts)
    })
}

exports.createNewBlogPost = function (postHeader, postText, postDate, timestampPosted, callback) {
    const query = "INSERT INTO blogpost (blogpostHeader, blogpostText, blogpostDate, timestampPosted) VALUES (?, ?, ?, ?)"
    const values = [postHeader, postText, postDate, timestampPosted]

    db.run(query, values, function (error) {
        const id = this.lastID
        callback(error, id)
    })
}

exports.updateBlogPost = function (updatedpostHeader, updatedpostText, postID, callback) {
    const query = "UPDATE blogpost SET blogpostHeader = ?, blogpostText = ? WHERE blogpostID = ?"
    const values = [updatedpostHeader, updatedpostText, postID]

    db.run(query, values, function (error) {
        callback(error)
    })
}

exports.deleteBlogPost = function (postID, callback) {
    const query = "DELETE FROM blogpost WHERE blogpostID = ?"
    const values = [postID]
    db.run(query, values, function (error) {
        callback(error)
    })
}

exports.searchBlogPostWithKeyword = function(search, callback){
    const query = "SELECT * FROM blogpost WHERE (blogpostText LIKE ? OR blogpostHeader LIKE ?) ORDER BY blogpostID DESC"
    const values = ['%'+search+'%', '%'+search+'%']

    db.all(query, values, function(error, blogposts){
        callback(error, blogposts)
    })
}

exports.searchBlogPostWithDate = function(dateFrom, dateTo, callback){
    const query = "SELECT * FROM blogpost WHERE timestampPosted BETWEEN ? AND ?"
    const values = [dateFrom, dateTo]

    db.all(query, values, function(error, blogposts){
        callback(error, blogposts)
    })
}

exports.searchBlogPost = function(keyWord, dateFrom, dateTo, callback){
    const query = "SELECT * FROM blogpost WHERE (blogpostText LIKE ? OR blogpostHeader LIKE ?) AND timestampPosted BETWEEN ? AND ?"
    const values = ['%'+keyWord+'%', '%'+keyWord+'%', dateFrom, dateTo]

    db.all(query, values, function(error, blogposts){
        callback(error, blogposts)
    })
}

exports.getAllCommentsOnPost = function (id, callback) {
    const query = "SELECT * FROM comment WHERE blogpostID = ?"
    const values = [id]
    db.all(query, values, function (error, comment) {
        callback(error, comment)
    })
}

exports.deleteCommentWithId = function(commentID, callback){
    const query = "DELETE FROM comment WHERE commentID = ?"
    const values = [commentID]

    db.run(query, values, function(error){
        callback(error)
    })
}

exports.deleteAllCommentWithId = function (blogpostID, callback) {
    const query = "DELETE FROM comment WHERE blogpostID = ?"
    const values = [blogpostID]

    db.run(query, values, function (error) {
        callback(error)
    })
}

exports.createComment = function (commenterName, commentMainText, blogpostID, callback) {
    const query = "INSERT INTO comment (commentPublisher, commentText, blogpostID) VALUES (?,?,?)"
    const values = [commenterName, commentMainText, blogpostID]

    db.run(query, values, function (error) {
        const id = this.lastID
        callback(error, id)
    })
}