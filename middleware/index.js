const Meme = require("../models/meme");
const Comment = require("../models/comment");
const User = require("../models/user");

let middlewareObj = {};

middlewareObj.checkMemeOwnership = function(req, res, next){
    if(req.isAuthenticated()){
        Meme.findById(req.params.id, function(err, foundMeme){
            if(err){
                console.log(err);
                res.redirect("back");
            } else {
                if(foundMeme.author.id.equals(req.user.id) || (req.user.type == "admin")){
                    next();
                } else {
                    res.redirect("back");
                }
            }
        });
    }
    else{
        res.redirect("back");
    }
}

middlewareObj.checkCommentOwnership = function(req, res, next){
    if(req.isAuthenticated()){
        Comment.findById(req.params.comment_id, function(err, foundComment){
            if(err){
                res.redirect("back");
            } else {
                if(foundComment.author.id.equals(req.user._id) || (req.user.type == "admin")) {
                    next();
                } else {
                    res.redirect('back');
                }
            }
        });
    } else {
        res.redirect('back');
    }
}

middlewareObj.isLoggedIn = function(req, res, next){
   if(req.isAuthenticated()){
        return next();
    }
    req.flash("error", "You need to login first");
    res.redirect('/edumeme/login');
} 

module.exports = middlewareObj;