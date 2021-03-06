const   express = require('express'),
        router = express.Router(),
        multer = require("multer"),
        path = require("path"),
        fs = require("fs"),
        Meme = require("../models/meme"),
        Comments = require("../models/comment"),
        Log = require("../models/log"),
        middleware = require('../middleware');

const storage = multer.diskStorage({
    destination: './public/uploads',
    filename: function(req, file, cb) {
        cb(null,file.fieldname + '-' + Date.now() + path.extname(file.originalname));
    }
});

const imageFilter = function(req, file, cb){
    var ext = path.extname(file.originalname);
    if(ext !== '.png' && ext !== '.gif' && ext !== '.jpg' && ext !== '.jpeg'){
        return cb(new Error('Only image is allowed'), false)
        }
        cb(null, true);
};

const upload = multer({storage: storage, fileFilter: imageFilter})

router.get("/category/undifined",function(req,res){
    Meme.find({category:null},function(error, allMeme){
        if(error){
            console.log("Error!");
        } else {
            res.render("memes/categoryIndex",{Meme:allMeme});
        }
    })
});

router.get("/category/science",function(req,res){
    Meme.find({category:"science"},function(error, allMeme){
        if(error){
            console.log("Error!");
        } else {
            res.render("memes/categoryIndex",{Meme:allMeme});
        }
    })
});

router.get("/category/nonsense",function(req,res){
    Meme.find({category:"nonsense"},function(error, allMeme){
        if(error){
            console.log("Error!");
        } else {
            res.render("memes/categoryIndex",{Meme:allMeme});
        }
    })
});

router.get("/category/comsci",function(req,res){
    Meme.find({category:"comsci"},function(error, allMeme){
        if(error){
            console.log("Error!");
        } else {
            res.render("memes/categoryIndex",{Meme:allMeme});
        }
    })
});

router.get("/", function(req,res){
    res.render("memes/index");
});

router.get("/toprank", middleware.isLoggedIn, function(req,res){
    var rank = { like_count: 1};
    Meme.find({},function(error, allMeme){
        if(error){
            console.log(error);
        } else {
            function compare(a, b) {
                const likeA = a.like_count;
                const likeB = b.like_count;

                let comparison = 0;
                if (likeA > likeB) {
                  comparison = -1;
                } else if (likeA < likeB) {
                  comparison = 1;
                }
                return comparison;
            }
            allMeme.sort(compare);
            res.render("memes/top",{Meme:allMeme});
        }
    });
});

router.post("/", middleware.isLoggedIn, upload.single("image"), function(req,res){
    let n_name = req.body.name;
    let n_image = req.file.filename;
    let n_desc = req.body.desc;
    let n_category = req.body.category;
    let n_author = {
        id: req.user._id, 
        username: req.user.username
    };
    let n_meme = {name:n_name,image:n_image,desc:n_desc, author: n_author, category: n_category};
    Meme.create(n_meme, function(error,newMeme){
        if(error){
            console.log(error);
        } else {
            var date = Date();
            Log.create(new Log({text: req.user.username + " has add meme (id: " + newMeme.id + ")", date: date}), function(err,log){
                if(err){
                    console.log(err);
                } else {
                    console.log(log);
                }                
            });
            console.log(newMeme);
            res.redirect("/edumeme");
        }
    });
});

router.get("/add", middleware.isLoggedIn, function(req,res){
    res.render("memes/add");
});

router.post('/:id/like/:action', middleware.isLoggedIn, (req, res, next) => {
    const action = req.params.action;
    const counter = action === 'Like' ? 1 : -1;
    Meme.update({_id: req.params.id}, {$inc: {like_count: counter}}, {}, (err, numberAffected) => {
        res.send('');
    });
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
            res.redirect("/edumeme");
        } else {
            var date = Date();
            Log.create(new Log({text: req.user.username + " has edit meme (id: " + updatedMeme.id + ")", date: date}), function(err,log){
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

router.delete("/:id", middleware.checkMemeOwnership, function(req,res){
    Meme.findByIdAndRemove(req.params.id, function(err,select){
        if(err){
            res.redirect("/edumeme");
        }
        else{
            const imagePath = './public/uploads/' + select.image;
            fs.unlink(imagePath, function(err){
                if(err){
                    console.log(err);
                    res.redirect('/edumeme');
                }
            });
            (select.comments).forEach(element => {
                console.log(element);
                Comments.findByIdAndRemove(element, function(err, comment){
                    console.log("Meme deleted");
                });
            });
            var date = Date();
            Log.create(new Log({text: req.user.username + " has delete meme (id: " + select.id + ")", date: date}), function(err,log){
                if(err){
                    console.log(err);
                } else {
                    console.log(log);
                }                
            });
            res.redirect("/edumeme");
        }
    });
});

module.exports = router;