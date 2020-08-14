const express = require('express')
const db = require('./db')

const router = express.Router()

router.get('/', function (request, response) {
    if (request.session.isLoggedIn) {
        response.render('admin.hbs')
    } else {
        console.log("Visitor trying to access the admin site without valid login")
        response.redirect('/login')
    }
})

router.get('/manage/blog', function (request, response) {
    if (request.session.isLoggedIn != true) {
        response.redirect('/authentication-error')
    } else {
        db.getAllBlogPosts(function (error, blogposts) {
            if (error) {
                response.status(500).render('error500.hbs')
            } else {
                const model = {
                    blogposts
                }
                response.render('manage-blog.hbs', model)
            }
        })
    }
})

router.get('/manage/projects', function (request, response) {
    if (request.session.isLoggedIn != true) {
        response.redirect('/authentication-error')
    } else {
        db.getProjects(function (error, projects) {
            if (error) {
                response.render(500).render('error500.hbs')
            } else {
                const model = {
                    projects
                }
                response.render('manage-portfolio.hbs', model)
            }
        })
    }
})

module.exports = router