const sqlite = require('sqlite3')
const db = new sqlite.Database("database.db")

exports.getProjects = function(callback){
    const query = "SELECT * FROM projects"
    db.all(query, function(error, projects){
        callback(error, projects)
    })
}

exports.getAllBlogPosts = function(callback){
    const query = "SELECT * FROM blogpost"

    db.all(query, function(error, blogpost){
        callback(error, blogpost)
    })
}

exports.getBlogPostById = function(id, callback){
    const query = "SELECT * FROM blogpost WHERE blogpostID = ?"
    const values = [id]

    db.get(query, values, function(error, blogpost){
        callback(error, blogpost)
    })
}

exports.createNewBlogPost = function(postHeader, postText, postDate, callback){
    const query = "INSERT INTO blogpost (blogpostHeader, blogpostText, blogpostDate) VALUES (?, ?, ?)"
    const values = [postHeader, postText, postDate]

    db.run(query, values, function(error){
        const id = this.lastID
        callback(error, id)
    })
}
