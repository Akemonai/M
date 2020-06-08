const   express = require('express'),
        router = express.Router(),
        multer = require("multer"),
        path = require("path"),
        Meme = require("../models/meme"),
        middleware = require('../middleware');

const   storage = multer.diskStorage({
    destination: "./public/uploads",
    filename: function(req, file, cb){
        cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname));
    }
});

const   imageFilter = function(req, file, cb){
    var ext = path.extname(file.originalname);
    if(ext !== '.png' && ext !== '.gif' && ext !== '.jpg' && ext !== '.jpeg'){
        return cb(new Error('Only image is allowed'), false)
    }
    cb(null, true);
}

const   upload = multer({storage: storage, fileFilter: imageFilter})

router.get("/", function(req,res){
    Meme.find({},function(error, allMeme){
        if(error){
            console.log("Error!");
        } else {
            res.render("memes/index",{Meme:allMeme});
        }
    })
});

router.post("/", middleware.isLoggedIn, upload.single("image"), function(req,res){
    let n_name = req.body.name;
    let n_image = req.file.filename;
    let n_desc = req.body.desc;
    let n_author = {
        id: req.user._id, 
        username: req.user.username
    };
    let n_meme = {name:n_name,image:n_image,desc:n_desc, author: n_author};
    Meme.create(n_meme, function(error,newMeme){
        if(error){
            console.log(error);
        } else {
            console.log("New meme added.");
            res.redirect("/memehub/meme");
        }
    });
});

router.get("/add", middleware.isLoggedIn,function(req,res){
    res.render("memes/add");
});

router.get("/:id", function(req,res){
    Meme.findById(req.params.id).populate("comments").exec(function(error, idMeme){
        if(error){
            console.log(error);
        } else {
            res.render("memes/show",{meme:idMeme});
        }
    });
});

router.get("/:id/edit", middleware.checkMemeOwnership, function(req,res){
    Meme.findById(req.params.id, function(err, foundMeme){
            res.render("memes/edit", {meme: foundMeme});
    });
});

router.put("/:id", middleware.checkMemeOwnership, function(req,res){
    Meme.findByIdAndUpdate(req.params.id, req.body.meme, function(err, updatedMeme){
        if(err){
            res.redirect("/memehub/meme");
        } else {
            res.redirect('/memehub/meme/' + req.params.id);
        }
    });
});

router.delete("/:id", middleware.checkMemeOwnership, function(req,res){
    Meme.findByIdAndRemove(req.params.id, function(err){
        if(err){
            res.redirect("/memehub/meme");
        }
        else{
            res.redirect("/memehub/meme");
        }
    });
});

module.exports = router;