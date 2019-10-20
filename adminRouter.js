const express = require('express')
const db = require('./db')

const router = express.Router()

router.get('/', function (request, response) {
    if (request.session.isLoggedIn == true) {
        response.render('admin.hbs')
    } else {
        console.log("Visitor trying to access the admin site without valid login")
        response.redirect('/')
    }
})

router.get('/manage/blog', function (request, response) {
    const validationErrors = []
    if (request.session.isLoggedIn != true) {
        response.redirect('/login')
    } else {
        db.getAllBlogPosts(function (error, blogposts) {
            if (error) {
                response.status(500).render("error500.hbs")
            } else {
                const model = {
                    blogposts
                }
                response.render("manage-blog.hbs", model)
            }
        })
    }
})

router.get('/manage/projects', function (request, response) {
    const validationErrors = []
    if (request.session.isLoggedIn != true) {
        validationErrors.push("You have to be logged in to access this part of the website")
        const model = {
            validationErrors
        }
        response.render("manage-portfolio.hbs", model)
    } else {
        db.getProjects(function (error, projects) {
            if (error) {
                console.log(error)
                response.render('/error500')
            } else {
                const model = {
                    projects
                }
                response.render("manage-portfolio.hbs", model)
            }
        })
    }
})

module.exports = router