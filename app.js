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
const adminRouter = require('./adminRouter')

const db = require('./db')

const app = express()

const saltRounds = 10

// Now using hashed password instead of using a password in plain text
const username = "RandomAdmin"
const hash = "$2b$10$b1tuiPuE98ROC7Bj4je6fOZOIO1Vehhe5mPoK1KWfGNkuaUGb./86"

const csrfProtection = csurf({ cookie: true })

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

app.use(csrfProtection)

app.use(function (request, response, next) {
  response.locals.isLoggedIn = request.session.isLoggedIn
  response.locals.csrfToken = request.csrfToken()
  next()
})

app.use('/blog', blogRouter)

app.use('/portfolio', portfolioRouter)

//Unclear if this is a resource that is supposed to be used as a router
app.use('/comment', commentRouter)

app.use('/admin', adminRouter)

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

// app.get('/admin/manage/comments', function(request, response){
//   const validationErrors = []
//   if(request.session.isLoggedIn == false){
//     validationErrors.push("You have to be logged in to access this part of the website")
//     const model = {
//       validationErrors
//     }
//     response.redirect()
//   } else {
//     db.getAllBlogPosts(function(error, blogposts){
//       if(error){
//         console.log(error)
//       } else {
        
//       }
//     })
//   }
// })

app.get('/login', function (request, response) {
  const alreadyLoggedIn = "You are already logged in"
  if (request.session.isLoggedIn) {
    const model = {
      alreadyLoggedIn
    }
    response.render('login.hbs', model)
  } else {
    response.render('login.hbs')
  }
})

app.post('/login', csrfProtection, function (request, response) {
  const inputedUsername = request.body.username
  const inputedPassword = request.body.password
  const loginErrors = []

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
      loginErrors.push("Username does not match existing username")
    }

    if (passwordMatch == false) {
      loginErrors.push("Wrong password")
    }

    if (inputedUsername == username && passwordMatch) {
      request.session.isLoggedIn = true
      response.redirect("/")
    } else {
      const model = {
        somethingWentWrong: true,
        loginErrors,
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

app.get('*', function(request, response){
  response.status(404).render("404.hbs")
})

app.listen(8080, () => {
  console.log("server is starting on port", 8080)
})