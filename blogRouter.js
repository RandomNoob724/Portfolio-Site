//node packages
const express = require('express')

//files
const commentRouter = require('./commentRounter')
const db = require('./db')

const router = express.Router()

router.use(express.static("public"))

router.get('/', function(request, response){
  const isLoggedIn = request.session.isLoggedIn
  db.getAllBlogPosts(function(error, blogpost){
    if(error){
      const model = {
        somethingWentWrong: true
      }
      response.render("blog.hbs", model)
    }else{
      const model = {
        isLoggedIn,
        isSearchable: true,
        somethingWentWrong: false,
        blogpost
      }
      model.blogpost.reverse()
      response.render("blog.hbs", model)
    }
  })
})

// Here should be implemented a function to search for blogposts

router.get('/create', function(request, response){
  const model = {
    validationErrors: []
  }
  if(request.session.isLoggedIn != true){
    response.send("You have to be logged in to use this resource")
  }else{
    response.render('create-post.hbs', model)
  }
})

router.post('/create', function(request, response){
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
      blogpostHeader,
      blogpostText
    }
    response.render("create-post.hbs", model)
  }
})

router.get('/:id', function(request, response){
    var id = request.params.id
    const validationErrors = []
    db.getBlogPostById(id, function(error, blogpost){
        if(error){
            console.log("something went wrong")
        }else{
            db.getAllCommentsOnPost(id, function(error, comments){
              const model = {
                validationErrors,
                blogpost,
                comments
              }
              if(error){
                console.log(error)
              }
              if(blogpost == null){
                validationErrors.push("There are no posts with this id")
                response.render("blog.hbs", model)
              }
              response.render("post.hbs", model)
            })
        }
    })
})

router.get('/:id/edit', function(request, response){
  const blogpostID = request.params.id
  const validationErrors = []
  db.getBlogPostById(blogpostID, function(error, blogpost){
    if(error){
      console.log("Something went wrong when getting blogpost from the database")
    }else{
      const model = {
        validationErrors,
        blogpost
      }
      response.render("edit.hbs", model)
    }
  })
})

//This sends a request to the server to delete a blogpost with the specific id that is loaded in to the url
router.get('/:id/delete-post', function(request, response){
  const blogpostID = request.params.id
  const validationErrors = []
  db.deleteBlogPost(blogpostID, function(error){
    if(error){
      const model = {
        couldNotDeletePost: true
      }
      response.render('/blog', model)
    }else{
      response.redirect('/blog')
    }
  })
})

router.post('/:id/edit', function(request, response){
  const blogpostID = request.params.id
  const blogpostHeader = request.body.blogpostHeader
  const blogpostText = request.body.blogpostText
  db.updateBlogPost(blogpostHeader, blogpostText, blogpostID, function(error){
    if(error){
      console.log(error)
    }else{
      response.redirect('/blog/'+blogpostID)
    }
  })
})

module.exports = router