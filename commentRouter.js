const express = require('express')
const db = require('./db')

const router = express.Router()

router.post('/:commentID/delete', function (request, response) {
    const commentID = request.params.commentID
    const blogpostID = request.body.blogpostID
    if(request.session.isLoggedIn){
        db.deleteCommentWithId(commentID, function (error) {
            if (error) {
                response.status(500).render("500.hbs")
            } else {
                response.redirect('/blog/post/' + blogpostID)
            }
        })
    } else {
        response.redirect('/authentication-error')
    }
})

router.get('/:commentID/edit', function (request, response) {
    const commentId = request.params.commentID
    if(request.session.isLoggedIn){
        db.getCommentWithId(commentId, function (error, comment) {
            if (error) {
                response.status(500).render("500.hbs")
            } else {
                const model = {
                    comment
                }
                response.render("edit-comment.hbs", model)
            }
        })
    } else {
        response.redirect('/authentication-error')
    }
})

router.post('/:commentID/edit', function (request, response) {
    const updatedCommentPublisher = request.body.commentPublisher
    const updatedCommentText = request.body.commentText
    const commentID = parseInt(request.params.commentID)
    const blogpostID = request.body.blogpostID
    if(request.session.isLoggedIn){
        db.updateCommentWithId(updatedCommentPublisher, updatedCommentText, commentID, function(error){
            if(error){
                console.log(error);
                response.status(500).render('error500.hbs')
            } else {
                db.getCommentWithId(commentID, function(error, comment){
                    if(error){
                        response.status(500).render('error500.hbs')
                    } else {
                        response.redirect('/blog/post/'+comment.blogpostID)
                    }
                })
            }
        })
    }
})



module.exports = router