const express = require('express')
const db = require('./db')

const router = express.Router()

router.post('/:commentID/delete', function (request, response) {
    const commentID = request.params.commentID
    const blogpostID = request.body.blogpostID
    db.deleteCommentWithId(commentID, function (error) {
        if (error) {
            response.status(500).render("500.hbs")
        } else {
            response.redirect('/blog/post/' + blogpostID)
        }
    })
})

router.get('/:commentID/edit', function (request, response) {
    const commentId = request.params.commentID

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
})

router.post('/:commentID/edit', function (request, response) {
    const updatedCommentPublisher = request.body.commentPublisher
    const updatedCommentText = request.body.commentText
    const commentID = request.params.commentID
    const blogpostID = request.body.blogpostID

    db.updateCommentWithId(updatedCommentPublisher, updatedCommentText, commentID, function (error) {
        if (error) {
            response.status(500).render("500.hbs")
            console.log(error)
        } else {
            response.redirect('/blog/post/' + blogpostID)
        }
    })
})



module.exports = router