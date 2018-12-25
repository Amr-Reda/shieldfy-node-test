require('shieldfy-nodejs-client').start({
    appKey:'aaa',
    appSecret:'123',
    endPoint:'http://d300b502.ngrok.io/v2/',
});
var express = require('express');
var app = express();
const path = require('path');
const mongoose = require('mongoose');
const Person = require('./model');
var bodyParser = require('body-parser');
var multer = require('multer');
var upload = multer(); 
var cookieParser = require('cookie-parser');
var session = require('express-session');
// var logger = require('morgan');

// app.use(logger('dev'));

app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())

app.use(upload.single('img'));

app.use(cookieParser());
app.use(session({secret: 'keyboard cat',}));

mongoose.connect('mongodb://localhost/my_database', { useNewUrlParser: true },()=>{
    console.log("mongodb connected");
});

app.set('view engine','ejs');

// var newPerson = new Person({
//     userName : "hello",
//     password : "1111",
//     email : "hello@world.com",
//     img : "myImg"
// });

// newPerson.save((err)=>{
//     if(err) {
//         console.log(err);
//     }else{
//         console.log("add new user");
//     }
// })

app.get('/',(req,res)=>{
    // res.status(400);
    // setTimeout(()=>{
        res.render("index",{user:req.session.user}) 
    // },3000)
    // test(()=>{
    //     res.render("index",{user:req.session.user}) 
    // })
    // test(()=>{
    // //     setTimeout(()=>{
    //         res.write("hello")
    //         res.end()
    //     // },500)
    // })
});
function test(cb){
    cb();
}

app.get("/login", (req,res) => {
    if(req.session.user){
        res.redirect('/')
    }else{
        res.render('login',{message : ''});
    }
});

app.get("/register", (req,res) => {
    if(req.session.user){
        res.redirect('/')
    }else{
        res.render('register',{message:''});
    }
});

app.post("/register", (req,res) => {

    if(!req.body.user_name || !req.body.password || !req.body.email || !req.file.originalname){
        res.status("400");
        res.send("Invalid details!");
    }else{
        Person.findOne({userName : req.body.user_name}, (err,doc)=>{
            if(doc){
                res.render('register', {message: "User Already Exists! Login or choose another username"});
            }else{
                var newPerson = new Person({
                    userName : req.body.user_name,
                    password : req.body.password,
                    email : req.body.email,
                    img : req.file.originalname
                });
                
                    newPerson.save((err)=>{
                    if(err) {
                        console.log(err);
                        res.render('register', {message: "Error"});
                    }else{
                        console.log("add new user");
                        req.session.user = newPerson.userName;
                        res.redirect('/');
                    }
                })
            }
        })
    }
});

app.post("/login", (req,res) => {
    
    user = {
        userName : req.body.user_name,
        password : req.body.password
    }
    // res.write("hello")
    Person.findOne(user, (err,doc)=>{
        if(doc){
            req.session.user = doc.userName;
            res.redirect('/');
            // res.write("hello again ")
            // res.end("ok")
        }else{
            res.render('login',{message:"Wrong Username or Password!"});
        }
    })
});

app.get('/logout', function(req, res){
    req.session.destroy(function(){
       console.log("user logged out.")
    });
    res.redirect('/login');
 });

app.listen(3000,()=>{
  console.log("server running on port 3000...");
});