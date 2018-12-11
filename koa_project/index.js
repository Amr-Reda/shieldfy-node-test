const Koa = require('koa');
const app = new Koa();
const path = require('path');
const views = require('koa-views');
const router = require('koa-router')();
const mongoose = require('mongoose');
const koaBody = require('koa-body');
const Person = require('./model')

app.use(koaBody({ multipart: true }));

mongoose.connect('mongodb://localhost/my_database', { useNewUrlParser: true },()=>{
    console.log("mongodb connected");
});

app.use(views(path.join(__dirname, '/views'), { extension: 'html' }));

app.use(router.routes());

router.get("/", async (ctx) => {
    await ctx.render('index');
});

router.get("/login", async (ctx) => {
    await ctx.render('login');
});

router.get("/register", async (ctx) => {
    await ctx.render('register');
});

router.post("/register", async (ctx) => {

    var newPerson = new Person({
        userName : ctx.request.body.user_name,
        password : ctx.request.body.password,
        email : ctx.request.body.email,
        img : ctx.request.files.img.path
    });
    
    await newPerson.save((err)=>{
        if(err) {
            console.log(err);
        }else{
            console.log("add new user");
        }
    })

    await ctx.redirect('/');
});

router.post("/login", async (ctx) => {
    user = {
        userName : ctx.request.body.user_name,
        password : ctx.request.body.password
    }
    await Person.findOne(user, async (err,doc)=>{
        if(doc){
            console.log(doc);
            await ctx.redirect('/');
        }else{
            await ctx.redirect('/login');
        }
    })
    
});


app.listen(3000,()=>{
  console.log("server running on port 3000...");
});