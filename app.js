const express = require('express')
const expressHandlebars = require('express-handlebars')

const db = require('./db')

const app = express()

app.use(express.static("public"))

app.engine("hbs", expressHandlebars({
  defaultLayout: 'main.hbs'
}))

app.get('/', function(request, response){
  response.render("home.hbs")
})

app.get('/portfolio', function(request, response){
  const model = {
    projects: dummyData.projects
  }
  response.render("portfolio.hbs", model)
})

app.get('/about', function(request, response){
  response.render("about.hbs")
})

app.get("/blog", function(request, response){
  db.getAllBlogPosts(function(error, blogpost){
    if(error){
      const model = {
        somethingWentWrong: true
      }
      response.render("blog.hbs", model)
    }else{
      const model = {
        somethingWentWrong: false,
        blogpost
      }
      response.render("blog.hbs", model)
    }
  })
})

app.get('/contact', function(request, response){
  response.render('contact.hbs')
})

app.get('/admin', function(request, response){
  response.render('admin.hbs')
})

app.get('/login', function(request, response){
  response.render('login.hbs')
})

app.get('/create-post', function(request, response){
  response.render('create-post.hbs')
})

app.listen(8080, () =>{
  console.log("server is starting on port", 8080)
})

app.use(function(request, response, next){
  response.status(404).send("Error 404. Sorry can't find that!")
})