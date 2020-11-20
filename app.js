require('dotenv').config()
const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const mongoose = require("mongoose");
const session = require('express-session');
const passport = require("passport");
const passportLocalMongoose = require("passport-local-mongoose");


const app = express();
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({
  extended: true
}));
app.use(express.static("public"));

app.use(session({
    secret: "our little secret.",
    resave: false,
    saveUninitialized: false
}));
app.use(passport.initialize());
app.use(passport.session());

mongoose.connect("mongodb://localhost:27017/userDB",{useNewUrlParser: true,useUnifiedTopology: true});
mongoose.set('useNewUrlParser', true);
mongoose.set('useFindAndModify', false);
mongoose.set('useCreateIndex', true);

const userSchema = new mongoose.Schema({
    email: String,
    password: String
});
userSchema.plugin(passportLocalMongoose);

const model = new mongoose.model("user",userSchema);

passport.use(model.createStrategy());
passport.serializeUser(model.serializeUser());
passport.deserializeUser(model.deserializeUser());

app.get("/",function (req, res){
    res.render("home");
});


app.get("/login",function (req, res){
    res.render("login");
});

app.get("/register",function (req, res){
    res.render("register");
});

app.get("/secrets",function(req,res){
    if (req.isAuthenticated()){
        res.render("secrets");
    }else{
        res.redirect("/login");
    }
});

app.get("/logout",function (req, res){
    req.logout();
    res.redirect("/");
});


app.post("/register",function (req, res){
    model.register({username: req.body.username}, req.body.password,function(err, user){
        if(err){
            console.log(err);
            res.redirect("/register")
        }else{
            passport.authenticate("local")(req,res, function(){
                res.redirect("/secrets");
            })
        }
    })
});

app.post("/login",function (req, res){
    const newUser = new model({
        username: req.body.username,
        password: req.body.password
    });
    req.login(newUser,function(err){
        if(err){
            console.log(err);
        }else{
            passport.authenticate("local")(req,res,function(){
                res.redirect("/secrets");
            })
        }
    })

});


app.listen(3000, function() {
  console.log("Server started on port 3000");
});