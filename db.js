const sqlite = require('sqlite3')
const db = new sqlite.Database("database.db")

exports.getAllBlogPosts = function(callback){
    const query = "SELECT * FROM blogpost"

    db.all(query, function(error, blogpost){
        callback(error, blogpost)
    })
}


exports.createNewBlogPost = function(callback){
    const query = "INSERT INTO blogpost(blogpostHeader, blogpostText, blogpostDate) VALUES ?"
    const values = [blogpostHeader, blogpostText, blogpostDate]

    db.run(query, values, function(error){
        callback(error, id)
    })
}