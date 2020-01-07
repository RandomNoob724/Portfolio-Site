//node packages
const express = require('express')

//files
const db = require('./db')

const router = express.Router()


router.use(express.static("public"))

router.get('/', function (request, response) {
  const isLoggedIn = request.session.isLoggedIn
  db.getAllBlogPosts(function (error, blogpost) {
    if (error) {
      response.status(500).render("error500.hbs")
    } else {
      const model = {
        isLoggedIn,
        somethingWentWrong: false,
        blogpost
      }
      response.render("blog.hbs", model)
    }
  })
})

router.get('/create', function (request, response) {
  const validationErrors = []
  if (request.session.isLoggedIn != true) {
    validationErrors.push("You have to be logged in to use this resource")
    const model = {
      validationErrors
    }
    response.render('home.hbs', model)
  } else {
    response.render('create-post.hbs')
  }
})

router.post('/create', function (request, response) {
  const date = new Date()
  const postHeader = request.body.blogpostHeader
  const postText = request.body.blogpostText
  const postDate = date.toDateString()
  const timestamp = date.getTime()
  const titleLimit = 50
  const textLimit = 500

  const validationErrors = []

  if(request.session.isLoggedIn != true){
    response.redirect('/authentication-error')
  } else {
    if (postHeader.trim() == "") {
      validationErrors.push("Must enter a Header for the post")
    }

    if(postHeader.trim() > titleLimit){
      validationErrors.push("Too many characters in title")
    }

    if (postText.trim() == "") {
      validationErrors.push("Mush enter a post body text")
    }

    if(postText.trim() > textLimit){
      validationErrors.push("Text limit is reached")
    }

    if (validationErrors.length > 0) {
      const model = {
        validationErrors,
        postHeader,
        postText
      }
      response.render('create-post.hbs', model)
    } else {
      db.createNewBlogPost(postHeader, postText, postDate, timestamp, function (error) {
        if (error) {
          console.log(error)
          response.status(500).render('error500.hbs')
        } else {
          response.redirect('/blog')
        }
      })
    }
  }
})

router.post('/post/:id', function (request, response) {
  const id = request.params.id
  let commentPublisher = request.body.commenterName
  const commentText = request.body.commentMainText
  const maxCommentPublisherLength = 20
  const maxCommentTextLength = 100
  const commentError = []

  if (commentPublisher.trim() == "") {
    commentPublisher = "Anonymous"
  } 
  if (request.session.isLoggedIn == true){
    commentPublisher = "Admin"
  }

  if (commentPublisher.length > maxCommentPublisherLength) {
    commentError.push("Name is too long")
  }

  if (commentText.trim() == "") {
    commentError.push("You're not allowed to have empty comments")
  }

  if (commentText.length > maxCommentTextLength) {
    commentError.push("Comments can't be over 200 characters")
  }
  
  if (commentError.length > 0) {
    db.getBlogPostById(id, function (error, blogpost) {
      if (error) {
        response.status(500).render('error500.hbs')
        console.log(error)
      } else {
        db.getAllCommentsOnPost(id, function (error, comments) {
          const model = {
            commenterName: commentPublisher,
            commentError,
            blogpost,
            comments
          }
          if (error) {
            console.log(error)
            response.status(500).render('error500.hbs')
          }
          if (blogpost == null) {
            commentError.push("There are no posts with this id")
            response.render('blog.hbs', model)
          } else {
            response.render('post.hbs', model)
          }
        })
      }
    })
  } else {
    db.createComment(commentPublisher, commentText, id, function (error) {
      if (error) {
        console.log(error);
        response.status(500).render('error500.hbs')
      }
      response.redirect('/blog/post/' + id)
    })
  }
})

router.get('/search', function (request, response) {
  const keyWord = request.query.inputedSearch
  const dateFrom = new Date(request.query.dateFrom)
  const dateTo = new Date(request.query.dateTo)
  dateFrom = dateFrom.getTime()
  dateTo = dateTo.getTime()

  const validationErrors = []

  // If you've not entered a date or a keyword you should not be able to search
  if (keyWord.trim() == "" && Number.isNaN(dateFrom) == true && Number.isNaN(dateTo) == true) {
    validationErrors.push("Can't search for empty string")
    db.getAllBlogPosts(function (error, blogposts) {
      if (error) {
        console.log(error)
        response.status(500).render('error500.hbs')
      } else {
        const model = {
          validationErrors,
          keyWord,
          blogpost: blogposts
        }
        response.render('blog.hbs', model)
      }
    })
  } else if (Number.isNaN(dateFrom) && Number.isNaN(dateTo)) {
    db.searchBlogPostWithKeyword(keyWord, function (error, blogposts) {
      if (error) {
        console.log(error)
        response.status(500).render('error500.hbs')
      } else {
        const model = {
          blogpost: blogposts,
          keyWord
        }
        response.render('blog.hbs', model)
      }
    })
  } else if (keyWord.trim() == "" && Number.isNaN(dateFrom) == false && Number.isNaN(dateTo) == false) { //Here we're searching with date
    db.searchBlogPostWithDate(dateFrom, dateTo, function (error, blogposts) {
      if (error) {
        console.log(error)
      } else {
        const model = {
          blogpost: blogposts,
          keyWord
        }
        response.render('blog.hbs', model)
      }
    })
  } else {
    db.searchBlogPost(keyWord, dateFrom, dateTo, function (error, blogposts) {
      if (error) {
        console.log(error)
      } else {
        const model = {
          blogpost: blogposts
        }
        response.render('blog.hbs', model)
      }
    })
  }
})

// pagination
router.get('/:id', function (request, response) {
  const currentPageNumber = request.params.id
  const postsPerPage = 3
  const startPage = 0

  db.getAmountOfPosts(function (error, amount) {
    const totalAmountOfPosts = parseInt(amount.nrOfRows)
    const offset = postsPerPage * currentPageNumber

    if (error) {
      console.log(error)
      response.status(500).render('error500.hbs')
    } else {
      db.getBlogPostWithinLimit(postsPerPage, offset, function (error, blogposts) {
        previousPage = parseInt(currentPageNumber) - 1
        nextPage = parseInt(currentPageNumber) + 1
        let disabledNext = false
        let disabledPrevious = false
        if (error) {
          console.log(error)
          response.status(500).render('error500.hbs')
        } else {
          if (currentPageNumber == startPage) {
            previousPage = startPage
            disabledNext = true
          }
          //uses plus one to check if there is any posts on the next page
          if ((postsPerPage+1) * currentPageNumber >= totalAmountOfPosts) {
            nextPage = currentPageNumber
            disabledPrevious = true
          }
          const model = {
            previousPage,
            nextPage,
            disabledNext,
            disabledPrevious,
            disabled: "disabled",
            blogpost: blogposts
          }
          response.render('blog.hbs', model)
        }
      })
    }
  })
})

router.get('/post/:id', function (request, response) {
  const id = request.params.id
  const validationErrors = []
  db.getBlogPostById(id, function (error, blogpost) {
    if (error) {
      response.status(500).render('error500.hbs')
      console.log(error)
    } else {
      db.getAllCommentsOnPost(id, function (error, comments) {
        const model = {
          validationErrors,
          blogpost,
          comments
        }
        if (error) {
          console.log(error)
          response.redirect('/error500')
        }
        if (blogpost == null) {
          validationErrors.push("There are no posts with this id")
          response.render('blog.hbs', model)
        } else {
          response.render('post.hbs', model)
        }
      })
    }
  })
})

router.get('/post/:id/edit', function (request, response) {
  const blogpostID = request.params.id
  const validationErrors = []
  db.getBlogPostById(blogpostID, function (error, blogpost) {
    if (error) {
      console.log("Something went wrong when getting blogpost from the database")
      response.status(500).render("error500.hbs")
    } else if (request.session.isLoggedIn != true) {
      validationErrors.push("You have to log in to access this part of the website")
      const model = {
        notLoggedIn: true,
        validationErrors
      }
      response.render('blog.hbs', model)
    } else {
      db.getAllCommentsOnPost(blogpostID, function (error, comments) {
        if (error) {
          response.status(500).render('error500.hbs')
        } else {
          const model = {
            validationErrors,
            comments,
            blogpost
          }
          response.render('edit-blogpost.hbs', model)
        }
      })
    }
  })
})

router.post('/post/:id/edit', function (request, response) {
  const blogpostID = request.params.id
  const blogpostHeader = request.body.blogpostHeader
  const blogpostText = request.body.blogpostText
  if(request.session.isLoggedIn != true){
    response.redirect('/authentication-error')
  } else {
    db.updateBlogPost(blogpostHeader, blogpostText, blogpostID, function (error) {
      if (error) {
        response.status(500).render('error500.hbs')
      } else {
        response.redirect('/blog/post/' + blogpostID)
      }
    })
  }
})

//This sends a request to the server to delete a blogpost with the specific id that is loaded in to the url
router.post('/post/:id/delete-post', function (request, response) {
  const blogpostID = request.params.id

  db.deleteAllCommentWithId(blogpostID, function (error) {
    if (error) {
      const model = {
        couldNotDeletePost: true
      }
      response.render('blog.hbs', model)
    } else {
      db.deleteBlogPost(blogpostID, function (error) {
        if (error) {
          const model = {
            couldNotDeletePost: true
          }
          response.render('blog.hbs', model)
        } else {
          response.redirect('/admin/manage/blog')
        }
      })
    }
  })
})

module.exports = router