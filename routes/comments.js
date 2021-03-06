const   express = require('express'),
        router = express.Router({mergeParams: true}),
        Meme = require('../models/meme'),
        Comment = require('../models/comment'),
        Log = require("../models/log"),
        middleware = require('../middleware');

router.get('/new', middleware.isLoggedIn, function(req,res){
    Meme.findById(req.params.id, function(err, meme){
        if(err){
            console.log(err);
        } else {
            res.render('comment',{meme: meme});
        }
    });
});

router.post('/', middleware.isLoggedIn, function(req,res){
    Meme.findById(req.params.id, function(err, meme){
        if(err){
            console.log(err);
            res.redirect('/edumeme/meme');
        } else {
            Comment.create(req.body.comment, function(err,comment){
                if(err){
                    console.log(err);
                } else {
                    var date = Date();
                    Log.create(new Log({text: req.user.username + " has comment meme(comment id:"+ comment.id + ")", date: date}), function(err,log){
                        if(err){
                            console.log(err);
                        } else {
                            console.log(log);
                        }
                    });
                    comment.author.id = req.user._id;
                    comment.author.username = req.user.username;
                    comment.save();
                    meme.comments.push(comment);
                    meme.save();
                    res.redirect('/edumeme/meme/' + meme._id);
                }
            });
        }
    });
});

router.get("/:comment_id/edit", middleware.checkCommentOwnership, function(req,res){
    Comment.findById(req.params.comment_id, function(err, foundComment){
        if(err){
            res.redirect('back');
        } else {
            res.render("comment/edit", {meme_id: req.params.id, comment: foundComment});
        }
    });
});

router.put("/:comment_id", middleware.checkCommentOwnership, function(req,res){
    Comment.findByIdAndUpdate(req.params.comment_id, req.body.comment, function(err, updatedComment){
        if(err){
            res.redirect('back');
        } else {
            var date = Date();
            Log.create(new Log({text: req.user.username + " has edit comment (comment id:"+ updatedComment.id + ")", date: date}), function(err,log){
                if(err){
                    console.log(err);
                } else {
                    console.log(log);
                }
            });
            res.redirect('/edumeme/meme/' + req.params.id);
        }
    });
});

router.delete("/:comment_id", middleware.checkCommentOwnership, function(req,res){
    Comment.findByIdAndRemove(req.params.comment_id, function(err, select){
        if(err){
            res.redirect('back'); 
        } else {
            var date = Date();
            Log.create(new Log({text: req.user.username + " has delete comment (comment id:"+ select.id + ")", date: date}), function(err,log){
                if(err){
                    console.log(err);
                } else {
                    console.log(log);
                }
            });
            res.redirect('/edumeme/meme/' + req.params.id);
        }
    });
});

module.exports = router;