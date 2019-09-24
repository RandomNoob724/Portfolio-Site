const express = require('express')
const expressHandlebars = require('express-handlebars')
const bodyParser = require('body-parser')

const db = require('./db')

const app = express()

//Used for the body parser, used when handling forms
app.use(bodyParser.urlencoded({
  extended: false
}))

app.use(express.static("public"))

app.engine("hbs", expressHandlebars({
  defaultLayout: 'main.hbs'
}))

app.get('/', function(request, response){
  response.render("home.hbs")
})

app.get('/portfolio', function(request, response){
  db.getProjects(function(error, projects){
    if(error){
      const model = {
        somethingWentWrong: true
      }
      response.render("portfolio.hbs", model)
    }else{
      const model = {
        somethingWentWrong: false,
        projects
      }
      response.render("portfolio.hbs", model)
    }
  })
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
  const model = {
    validationErrors: []
  }
  response.render('create-post.hbs', model)
})

app.post('/create-post', function(request, response){
  let date = new Date()
  const postHeader = request.body.blogpostHeader
  const postText = request.body.blogpostText
  const postDate = date.toDateString()

  const validationErrors = []

  if(postHeader == ""){
    validationErrors.push("Must enter a Header for the post")
  }

  if(postText == ""){
    validationErrors.push("Mush enter a post body text")
  }

  if(validationErrors.length == 0){
    db.createNewBlogPost(postHeader, postText, postDate, function(error){
      if(error){
        console.log("Internal server error...")
      }else{
        //fix this so that the server redirects the user to the post site
        response.redirect('/blog')
      }
    })
  }else{
    const model = {
      validationErrors,
      postHeader,
      postText
    }
    response.render("create-post.hbs", model)
  }
})

app.listen(8080, () =>{
  console.log("server is starting on port", 8080)
})

app.use(function(request, response, next){
  response.status(404).send("Error 404. Sorry can't find that!")
})