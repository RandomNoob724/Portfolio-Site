const express = require('express')
const db = require('./db')

const router = express.Router()

router.use(express.static('public'))

router.get('/portfolio', function(request, response){
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

module.exports = router