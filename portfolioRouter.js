const express = require('express')
const db = require('./db')

const router = express.Router()

router.use(express.static('public'))

router.get('/', function(request, response){
    db.getProjects(function(error, projects){
        if(error){
        const model = {
            somethingWentWrong: true
        }
        response.statusCode = 500
        response.redirect('/error')
        }else{
        const model = {
            somethingWentWrong: false,
            projects
        }
        response.render("portfolio.hbs", model)
        }
    })
})

router.get('/create', function(request, response){
    if(request.session.isLoggedIn){
        response.render("create-portfolio-project.hbs")
    } else {
        response.redirect('/authentication-error')
    }
})

router.post('/create', function(request, response){
    const projectName = request.body.projectName
    const projectDescription = request.body.projectDescription
    const projectLink = request.body.projectLink
    if (request.session.isLoggedIn){
        db.addNewProject(projectName, projectDescription, projectLink, function(error){
            if(error){
                response.redirect(500, '/error')
            } else {
                response.redirect('/portfolio')
            }
        })
    } else {
        response.redirect('/authentication-error')
    }
})

router.post('/:id/delete', function(request, response){
    const id = request.params.id
    if(request.session.isLoggedIn){
        db.deleteProjectWithId(id, function(error){
            if(error){
                response.status(500).render('error500.hbs')
                console.log(error)
            } else {
                response.redirect('/admin/manage/projects')
            }
        })
    } else {
        response.redirect('/authentication-error')
    }
})

router.get('/:id/edit', function(request, response){
    const id = request.params.id
    if(request.session.isLoggedIn){
        db.getProjectWithId(id, function(error, project){
            if(error){
                response.status(500).render('erro500.hbs')
                console.log(error)
            } else {
                const model = {
                    project
                }
                response.render('edit-project.hbs', model)
            }
        })
    } else {
        response.redirect('/authentication-error')
    }
})

router.post('/:id/edit', function(request, response){
    const id = request.params.id
    const title = request.body.projectName
    const description = request.body.projectDescription
    const link = request.body.projectLink
    if(request.session.isLoggedIn){
        db.updateProjectWithId(title, description, link, id, function(error){
            if(error){
                response.status(500).render('error500.hbs')
                console.log(error)
            } else {
                response.redirect('/admin/manage/projects')
            }
        })
    } else {
        response.redirect('/authentication-error')
    }
})

module.exports = router