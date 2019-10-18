const express = require('express')
const db = require('./db')

const router = express.Router()

router.post('/:id/publish-comment', function(request, response){
    const id = request.params.id
    let commentPublisher = request.body.commenterName
    const commentText = request.body.commentMainText
    const validationErrors = []

    if(commentPublisher == ""){
        commentPublisher = "Anonymous"
    }

    db.createComment(commentPublisher, commentText, id, function(error){
        if(error){
            console.log(error);
        }else{
            if(commentText == ""){
                validationErrors.push("Comments must contain text")
            }
        }
        response.redirect('/blog/post/'+id)
    })
})

router.post('/:commentID/delete', function(request, response){
    const commentID = request.params.commentID
    const blogpostID = request.body.blogpostID
    db.deleteCommentWithId(commentID, function(error){
        if(error){
            response.status(500).render("error500.hbs")
        } else {
            response.redirect('/blog/post/'+blogpostID)
        }
    })
})

module.exports = router