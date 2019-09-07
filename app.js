const dummyData = require('./dummy-data')

const express = require('express')
const expressHandlebars = require('express-handlebars')

const app = express()

app.engine("hbs", expressHandlebars({
  defaultLayout: 'main.hbs'
}))

app.get('/', function(request, response){
  response.render("home.hbs")
})

app.get('/portfolio', function(request, response){
  response.render("portfolio.hbs")
})

app.get('/about', function(request, response){
  response.render("about.hbs")
})

app.get('/blog', function(request, response){
  const model = {
    blogPost: dummyData.blogPost
  }
  response.render("blog.hbs", model)
})

app.get('/contact', function(request, response){
  response.render('contact.hbs')
})

app.listen(8080, () =>{
  console.log("server is starting on port", 8080)
})