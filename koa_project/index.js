require('shieldfy-nodejs-client').start({
    appKey:'7nh1p9t',
    appSecret:'e1cc34ae072216e829b114ff1a6c88831ca8dd2807b692a29e3fbbd3830b48ab',
    endPoint:'http://f3a3d9e5.ngrok.io/v2/'
});
const Koa = require('koa');
const app = new Koa();
const path = require('path');
const views = require('koa-views');
const router = require('koa-router')();
const mongoose = require('mongoose');
const koaBody = require('koa-body');
const session = require('koa-session');
const Person = require('./model');

app.use(koaBody({ multipart: true }));

app.keys = ['Shh, its a secret!'];
app.use(session(app));  // Include the session middleware

mongoose.connect('mongodb://localhost/my_database', { useNewUrlParser: true },()=>{
    console.log("mongodb connected");
});

app.use(views(path.join(__dirname, '/views'), { extension: 'ejs' }));

app.use(router.routes());

router.get("/", async (ctx) => {
    await ctx.render('index',{user:ctx.session.user});
});

router.get("/login", async (ctx) => {
    if(ctx.session.user){
        await ctx.redirect('/');
    }else{
        await ctx.render('login',{message : ''});
    }
});

router.get("/register", async (ctx) => {
    if(ctx.session.user){
        await ctx.redirect('/')
    }else{
        await ctx.render('register',{message:''});
    }
});

router.post("/register", async (ctx) => {

    if(!ctx.request.body.user_name || !ctx.request.body.password || !ctx.request.body.email || !ctx.request.files.img.path) {
        ctx.status("400");
        ctx.body = 'Invalid details!';
    }else{
        const promise = new Promise((resolve, reject) => {
            Person.findOne({userName : ctx.request.body.user_name},  (err,doc)=>{
                if(doc){
                    resolve(ctx.render('register',{message: "User Already Exists! Login or choose another username"}));
                }else{
                    var newPerson = new Person({
                        userName : ctx.request.body.user_name,
                        password : ctx.request.body.password,
                        email : ctx.request.body.email,
                        img : ctx.request.files.img.path
                    });
                    
                    newPerson.save( (err)=>{
                        if(err) {
                            console.log(err);
                            resolve(ctx.render('register', {message: "Error"}));
                        }else{
                            console.log("add new user");
                            ctx.session.user = newPerson.userName;
                            resolve(ctx.redirect('/'));
                        }
                    });
                }
            });
        })
        return promise;
    }
});

router.post("/login", async (ctx) => {
    user = {
        userName : ctx.request.body.user_name,
        password : ctx.request.body.password
    };
    const promise = new Promise((resolve, reject) => {
        Person.findOne(user, (err,doc)=>{
            if(doc){
                ctx.session.user = doc.userName;
                resolve(ctx.redirect('/'));
            }else{
                resolve(ctx.render('login',{message:"Wrong Username or Password!"}));
            }
        });
    })
    return promise;
});

router.get('/logout',async (ctx) => {
    ctx.session = null;
    await ctx.redirect('/login');
});


app.listen(3000,()=>{
  console.log("server running on port 3000...");
});