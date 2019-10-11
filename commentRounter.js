const express = require('express')
const db = require('./db')

const router = express.Router()

router.post('/:id/publish-comment', function(request, response){
    const id = request.params.id
    const commentPublisher = request.body.commenterName
    const commentText = request.body.commentMainText

    db.createComment(commentPublisher, commentText, id, function(error){
        if(error){
            console.log(error);
        }else{
            response.redirect('/blog/'+id)
        }
    })
})

module.exports = router