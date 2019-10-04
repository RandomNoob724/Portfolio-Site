const express = require('express')
const expressHandlebars = require('express-handlebars')
const expressSession = require('express-session')
const bodyParser = require('body-parser')
const cookieParser = require('cookie-parser')
const SQLiteStore = require('connect-sqlite3')(expressSession)
//routers
const blogRouter = require('./blogRouter')
const portfolioRouter = require('./portfolioRouter')
const commentRouter = require('./commentRounter')

const db = require('./db')

const app = express()

const username = "RandomAdmin"
const password = "admin123"

/*
* Make sure to make the cookies work together with the sessions
*/

//Used for the body parser, used when handling forms
app.use(bodyParser.urlencoded({
  extended: false
}))

app.use(express.static("public"))

app.use(cookieParser())

app.use(expressSession({
  secret: "paoifhdohfosdfjaodjf",
  saveUninitialized: false,
  resave: false,
  store: new SQLiteStore()
}))

app.use(function(request, response, next){
  response.locals.isLoggedIn = request.session.isLoggedIn
  next()
})

app.use('/blog', blogRouter)

app.use('/portfolio', portfolioRouter)

//Unclear if this is a resource that is supposed to be used as a router
//app.use('/comment', commentRouter)

app.engine("hbs", expressHandlebars({
  defaultLayout: 'main.hbs'
})
)

app.get('/', function(request, response){
  response.render("home.hbs")
})

app.get('/about', function(request, response){
  response.render("about.hbs")
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

app.post('/login', function(request, response){
  const inputedUsername = request.body.username
  const inputedPassword = request.body.password
  const validationErrors = []

  if(inputedUsername != username){
    validationErrors.push("Username does not match existing username")
  }
  if(inputedPassword != password){
    validationErrors.push("Wrong password")
  }
  if(request.body.username == username && request.body.password == password){
    const model = {
      somethingWentWrong: false,
      username: request.body.username
    }
    request.session.isLoggedIn = true
    response.redirect("/")
  } else {
    const model = {
      somethingWentWrong: true,
      validationErrors
    }
    response.render("login.hbs", model)
  }
})

app.get('/logout', function(request, response){
  request.session.isLoggedIn = false
  response.redirect("/")
})

app.listen(8080, () =>{
  console.log("server is starting on port", 8080)
})

app.use(function(request, response, next){
  response.status(404).send("Error 404. Sorry can't find that!")
})
