var express = require('express');
var app = express();
const path = require('path');
const mongoose = require('mongoose');
const Person = require('./model')
var bodyParser = require('body-parser')


mongoose.connect('mongodb://localhost/my_database', { useNewUrlParser: true },()=>{
    console.log("mongodb connected");
});

app.engine('html', require('ejs').renderFile);
app.set('view engine', 'html');


app.get('/',(req,res)=>{
    res.render("index")
})

app.get("/login", (req,res) => {
     res.render('login');
});

app.get("/register", (req,res) => {
     res.render('register');
});

app.post("/register", (req,res) => {

    var newPerson = new Person({
        userName : req.body.user_name,
        password : req.body.password,
        email : req.body.email,
        img : req.files.img.path
    });
    
     newPerson.save((err)=>{
        if(err) {
            console.log(err);
        }else{
            console.log("add new user");
        }
    })

    res.redirect('/');
});

app.post("/login", (req,res) => {
    user = {
        userName : ctx.request.body.user_name,
        password : ctx.request.body.password
    }

    Person.findOne(user, (err,doc)=>{
        if(doc){
            console.log(doc);
            res.redirect('/');
        }else{
            res.redirect('/login');
        }
    })
    
});


app.listen(3000,()=>{
  console.log("server running on port 3000...");
});