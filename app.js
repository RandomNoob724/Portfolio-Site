//node packages
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
const commentRouter = require('./commentRouter')
const adminRouter = require('./adminRouter')

const app = express()

//login
const username = "RandomAdmin"
const hash = "$2b$10$0TBKM124B6LVd0km6RQ28e1kbgV3BhvkmLBYBEAzivfAUJevLHQwK"

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

app.use(function(error, request, response, next){
  if(error.code === 'EBADCSRFTOKEN'){
    response.status(403).render('error403.hbs')
  } else {
    next()
  }
})

app.use('/blog', blogRouter)

app.use('/portfolio', portfolioRouter)

app.use('/comment', commentRouter)

app.use('/admin', adminRouter)

app.engine("hbs", expressHandlebars({
  defaultLayout: 'main.hbs'
}))

app.get('/', function (request, response) {
  response.render('home.hbs')
})

app.get('/about', function (request, response) {
  response.render('about.hbs')
})

app.get('/contact', function (request, response) {
  response.render('contact.hbs')
})

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
      response.render('login.hbs', model)
    }

    if (inputedUsername != username) {
      loginErrors.push("Username does not match existing username")
    }

    if (passwordMatch == false) {
      loginErrors.push("Wrong password")
    }

    if (inputedUsername == username && passwordMatch) {
      request.session.isLoggedIn = true
      response.redirect('/')
    } else {
      const model = {
        somethingWentWrong: true,
        loginErrors,
        username: inputedUsername
      }
      response.render('login.hbs', model)
    }
  })
})

app.post('/logout', function (request, response) {
  request.session.isLoggedIn = false
  response.redirect('/')
})

app.get('*', function(request, response){
  response.status(404).render('error404.hbs')
})

app.listen(8080, () => {
  console.log("server is starting on port", 8080)
})