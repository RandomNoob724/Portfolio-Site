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

router.get('/:id/delete', function(request, response){
    const id = request.params.id
    db.deleteProjectWithId(id, function(error){
        if(error){
            //Do something
        } else {
            response.redirect('/admin/manage-projects')
        }
    })
})

module.exports = router