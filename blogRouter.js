const express = require('express')
const db = require('./db')

const router = express.Router()

router.use(express.static("public"))

router.get('/', function(request, response){
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

router.get('/create-post', function(request, response){
    const model = {
      validationErrors: []
    }
    response.render('create-post.hbs', model)
  })

router.post('/create-post', function(request, response){
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

router.get('/:id', function(request, response){
    var id = request.params.id
    db.getBlogPostById(id, function(error, blogpost){
        if(error){
            console.log("something went wrong")
        } else {
            const model = {
                blogpost
            }
            response.render("post.hbs", model)
        }
    })
})

module.exports = router
