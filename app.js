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
  const model = {
    something: dummyData.something
  }
  response.render("about.hbs", model)
})

app.listen(8080)