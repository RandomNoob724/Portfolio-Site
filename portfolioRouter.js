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
    response.render("create-portfolio-project.hbs")
})

router.post('/create', function(request, response){
    const projectName = request.body.projectName
    const projectDescription = request.body.projectDescription
    const projectLink = request.body.projectLink
    db.addNewProject(projectName, projectDescription, projectLink, function(error){
        if(error){
            response.redirect(500, '/error')
        } else {
            response.redirect('/portfolio')
        }
    })
})

router.post('/:id/delete', function(request, response){
    const id = request.params.id
    db.deleteProjectWithId(id, function(error){
        if(error){
            //Do something
        } else {
            response.redirect('/admin/manage/projects')
        }
    })
})

router.get('/:id/edit', function(request, response){
    const id = request.params.id
    db.getProjectWithId(id, function(error, project){
        if(error){
            console.log(error)
        } else {
            const model = {
                project
            }
            response.render('edit-project.hbs', model)
        }
    })
})

router.post('/:id/edit', function(request, response){
    const id = request.params.id
    const title = request.body.projectName
    const description = request.body.projectDescription
    const link = request.body.projectLink
    db.updateProjectWithId(title, description, link, id, function(error){
        if(error){
            console.log(error)
        } else {
            response.redirect('/admin/manage/projects')
        }
    })
})

module.exports = router