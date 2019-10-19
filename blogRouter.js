//node packages
const express = require('express')
const multer = require('multer')

//files
const db = require('./db')

const router = express.Router()

const upload = multer({ dest: 'public/uploads/' })

router.use(express.static("public"))

router.get('/', function (request, response) {
  const isLoggedIn = request.session.isLoggedIn
  db.getAllBlogPosts(function (error, blogpost) {
    if (error) {
      response.status(500).render("500.hbs")
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
    response.render("home.hbs", model)
  } else {
    response.render('create-post.hbs', model)
  }
})

router.post('/create', function (request, response) {
  let date = new Date()
  const postHeader = request.body.blogpostHeader
  const postText = request.body.blogpostText
  const postDate = date.toDateString()
  const timestamp = date.getTime()

  const validationErrors = []
  if (postHeader.trim() == "") {
    validationErrors.push("Must enter a Header for the post")
  }

  if (postText.trim() == "") {
    validationErrors.push("Mush enter a post body text")
  }

  if (validationErrors.length > 0) {
    const model = {
      validationErrors,
      blogpostHeader,
      blogpostText
    }
    response.render("create-post.hbs", model)
  } else {
    db.createNewBlogPost(postHeader, postText, postDate, timestamp, function (error) {
      if (error) {
        console.log(error)
        response.status(500).render("500.hbs")
      } else {
        response.redirect('/blog')
      }
    })
  }
})

router.post('/post/:id', function (request, response) {
  const id = request.params.id
  let commentPublisher = request.body.commenterName
  const commentText = request.body.commentMainText
  const commentError = []

  if (commentPublisher.trim() == "") {
    commentPublisher = "Anonymous"
  }
  if (commentText.trim() == "") {
    commentError.push("You're not allowed to have empty comments")
  }
  if (commentError.length > 0) {
    db.getBlogPostById(id, function (error, blogpost) {
      if (error) {
        response.status(500).render("500.hbs")
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
            response.status(500).render("500.hbs")
          }
          if (blogpost == null) {
            commentError.push("There are no posts with this id")
            response.render("blog.hbs", model)
          } else {
            response.render("post.hbs", model)
          }
        })
      }
    })
  } else {
    db.createComment(commentPublisher, commentText, id, function (error) {
      if (error) {
        console.log(error);
        response.status(500).render("500.hbs")
      }
      response.redirect('/blog/post/' + id)
    })
  }
})

router.get('/search', function (request, response) {
  let keyWord = request.query.inputedSearch
  let dateFrom = new Date(request.query.dateFrom)
  let dateTo = new Date(request.query.dateTo)
  dateFrom = dateFrom.getTime()
  dateTo = dateTo.getTime()

  const validationErrors = []

  // If you've not entered a date or a keyword you should not be able to search
  if (keyWord.trim() == "" && Number.isNaN(dateFrom) == true && Number.isNaN(dateTo) == true) {
    validationErrors.push("Can't search for empty string")
    db.getAllBlogPosts(function (error, blogposts) {
      if (error) {
        console.log(error)
        response.status(500).render("500.hbs")
      } else {
        const model = {
          validationErrors,
          blogpost: blogposts
        }
        response.render("blog.hbs", model)
      }
    })
  } else if (Number.isNaN(dateFrom) && Number.isNaN(dateTo)) { //Here we're searching with keyword
    db.searchBlogPostWithKeyword(keyWord, function (error, blogposts) {
      if (error) {
        console.log(error)
        response.status(500).render("500.hbs")
      } else {
        const model = {
          blogpost: blogposts
        }
        response.render("blog.hbs", model)
      }
    })
  } else if (keyWord.trim() == "" && Number.isNaN(dateFrom) == false && Number.isNaN(dateTo) == false) { //Here we're searching with date
    db.searchBlogPostWithDate(dateFrom, dateTo, function (error, blogposts) {
      if (error) {
        console.log(error)
      } else {
        const model = {
          blogpost: blogposts
        }
        response.render("blog.hbs", model)
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
        response.render("blog.hbs", model)
      }
    })
  }
})

// pagination
router.get('/:id', function (request, response) {
  const pageNumber = request.params.id
  let postsPerPage = 3

  // let startIndex = (currentPage - 1) * pageSize;
  // let endIndex = Math.min(startIndex + pageSize - 1, totalItems - 1);
  db.getAmountOfPosts(function (error, amount) {
    let amountOfPosts = parseInt(amount.nrOfRows)

    let startIndex = (pageNumber - 1) * postsPerPage
    let endIndex = Math.min(startIndex + postsPerPage - 1, amountOfPosts - 1)
    if (error) {
      console.log(error)
    } else {
      db.getBlogPostWithinLimit(postsPerPage, endIndex, function (error, blogposts) {
        previousPage = parseInt(pageNumber) - 1
        nextPage = parseInt(pageNumber) + 1
        let disabledNext = false
        let disabledPrevious = false
        if (error) {
          console.log(error)
          response.status(500).render("500.hbs")
        } else {
          if (pageNumber == 1) {
            previousPage = 1
            disabledNext = true
          }
          if (postsPerPage * pageNumber >= amountOfPosts) {
            nextPage = pageNumber
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
          response.render("blog.hbs", model)
        }
      })
    }
  })
})

router.get('/post/:id', function (request, response) {
  var id = request.params.id
  const validationErrors = []
  db.getBlogPostById(id, function (error, blogpost) {
    if (error) {
      response.status(500).render("500.hbs")
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
          response.render("blog.hbs", model)
        } else {
          response.render("post.hbs", model)
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
      response.render("blog.hbs", model)
    } else {
      db.getAllCommentsOnPost(blogpostID, function (error, comments) {
        if (error) {
          response.status(500).render("error500.hbs")
        } else {
          const model = {
            validationErrors,
            comments,
            blogpost
          }
          response.render("edit-blogpost.hbs", model)
        }
      })
    }
  })
})

router.post('/post/:id/edit', function (request, response) {
  const blogpostID = request.params.id
  const blogpostHeader = request.body.blogpostHeader
  const blogpostText = request.body.blogpostText
  db.updateBlogPost(blogpostHeader, blogpostText, blogpostID, function (error) {
    if (error) {
      response.status(500).render("500.hbs")
    } else {
      response.redirect('/blog/post/' + blogpostID)
    }
  })
})

//This sends a request to the server to delete a blogpost with the specific id that is loaded in to the url
router.post('/post/:id/delete-post', function (request, response) {
  const blogpostID = request.params.id

  db.deleteAllCommentWithId(blogpostID, function (error) {
    if (error) {
      const model = {
        couldNotDeletePost: true
      }
      response.render("blog.hbs", model)
    } else {
      db.deleteBlogPost(blogpostID, function (error) {
        if (error) {
          const model = {
            couldNotDeletePost: true
          }
          response.render("blog.hbs", model)
        } else {
          response.redirect('/admin/manage/blog')
        }
      })
    }
  })
})

module.exports = router