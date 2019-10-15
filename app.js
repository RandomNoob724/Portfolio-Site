const express = require('express')
const expressHandlebars = require('express-handlebars')
const expressSession = require('express-session')
const bodyParser = require('body-parser')
const cookieParser = require('cookie-parser')
const SQLiteStore = require('connect-sqlite3')(expressSession)
const bcrypt = require('bcrypt')
const csurf = require('csurf')

//routers
const blogRouter = require('./blogRouter')
const portfolioRouter = require('./portfolioRouter')
const commentRouter = require('./commentRounter')

const db = require('./db')

const app = express()

const saltRounds = 10

// Now using hashed password instead of using a password in plain text
const username = "RandomAdmin"
const hash = "$2b$10$b1tuiPuE98ROC7Bj4je6fOZOIO1Vehhe5mPoK1KWfGNkuaUGb./86"

const csrfProtection = csurf({cookie: true})

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

app.use(function (request, response, next) {
  response.locals.isLoggedIn = request.session.isLoggedIn
  next()
})

app.use('/blog', blogRouter)

app.use('/portfolio', portfolioRouter)

//Unclear if this is a resource that is supposed to be used as a router
app.use('/comment', commentRouter)

app.engine("hbs", expressHandlebars({
  defaultLayout: 'main.hbs'
}))

app.get('/', function (request, response) {
  response.render("home.hbs")
})

app.get('/about', function (request, response) {
  response.render("about.hbs")
})

app.get('/contact', function (request, response) {
  response.render('contact.hbs')
})

app.get('/admin', function (request, response) {
  if (request.session.isLoggedIn) {
    response.render('admin.hbs')
  } else {
    console.log("Visitor trying to access the admin site without valid login")
    response.redirect('/')
  }
})

app.get('/admin/manage-blog', function (request, response) {
  db.getAllBlogPosts(function (error, blogposts) {
    if (error) {

    } else {
      const model = {
        blogposts
      }
      response.render("manage-blog.hbs", model)
    }
  })
})

app.get('/admin/manage-projects', function(request, response){
  db.getProjects(function(error, projects){
    if(error){
      // Do something
    } else {
      const model = {
        projects
      }
      response.render("manage-portfolio.hbs", model)
    }
  })
})

app.get('/login', function (request, response) {
  const alreadyLoggedIn = "You are already logged in"
  if(request.session.isLoggedIn){
    const model = {
      alreadyLoggedIn
    }
    response.render('login.hbs', model)
  } else {
    response.render('login.hbs')
  }
})

app.post('/login', function (request, response) {
  const inputedUsername = request.body.username
  const inputedPassword = request.body.password
  const validationErrors = []

  bcrypt.compare(inputedPassword, hash, function (error, passwordMatch) {
    if (error) {
      const model = {
        somethingWentWrong: true,
        username: inputedUsername
      }
      response.render("login.hbs", model)
    }

    // Check if input is correct or not and push validationErrors to the validation error array
    if (inputedUsername != username) {
      validationErrors.push("Username does not match existing username")
    }

    if (passwordMatch == false) {
      validationErrors.push("Wrong password")
    }

    if (inputedUsername == username && passwordMatch) {
      request.session.isLoggedIn = true
      response.redirect("/")
    } else {
      const model = {
        somethingWentWrong: true,
        validationErrors,
        username: inputedUsername
      }
      response.render("login.hbs", model)
    }
  })
})

app.get('/logout', function (request, response) {
  request.session.isLoggedIn = false
  response.redirect("/")
})

app.get('/error', function (request, response, next) {
  const statusError = []
  const funnyErrorPicture = ""
  if(response.status(500)){
    statusError.push("Internal Server Error, We're sorry for this and trying to fix it as soon as possible")
    const model = {
      statusError
    }
    response.render("error.hbs", model)
  } else if(response.status(404)){
    statusError.push("Page not found")
    const model = {
      statusError
    }
    response.render("error.hbs", model)
  }
})

app.listen(8080, () => {
  console.log("server is starting on port", 8080)
})