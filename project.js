const   express = require("express"),
        mongoose = require("mongoose"),
        bodyParser = require("body-parser"),
        passport = require("passport"),
        passportLocal = require("passport-local"),
        passportLocalMongoose = require("passport-local-mongoose"),
        User = require("./models/user");
        indexRoutes = require('./routes/index');

const app = express();

mongoose.connect('mongodb://localhost:27017/project', {useNewUrlParser: true});
app.use(express.static("public"));
app.use(bodyParser.urlencoded({extended: true}));
app.set("view engine","ejs");

app.use(require("express-session")({
    secret: "CSS227",
    resave: false,
    saveUninitialized: false
}));

app.use(passport.initialize());
app.use(passport.session());
app.use(function(req,res,next){
    res.locals.currentUser = req.user;
    next();
});


passport.use(new passportLocal(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use('/memehub',indexRoutes);


app.listen(3000, function(req,res){
    console.log("Started Now!!");
});