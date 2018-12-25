require('shieldfy-nodejs-client').start({
    appKey:'aaa',
    appSecret:'123',
    endPoint:'http://d300b502.ngrok.io/v2/',
});
const restify = require('restify');
const CookieParser = require('restify-cookies');
const render = require('restify-render-middleware');
const mysql = require('mysql2');

var connection = mysql.createConnection({
    host     : 'localhost',
    user     : 'root',
    password : '',
    database : 'my_database'
});

connection.connect(function(err){
    if(err){
        console.log(err);
        return;
    }else{
        console.log('Connection to db');
    }
});

var server = restify.createServer();

server.use(restify.plugins.bodyParser());
server.use(CookieParser.parse);

server.use(render({
    engine: 'ejs',
    dir: 'views'
}));

server.get('/', function(req,res,next) {
     res.render('index.ejs',{user : req.cookies.user})
});

server.get('/login', function(req,res,next) {
    if(req.cookies.user){
        res.redirect('/',next)
    }else{
        res.render('login.ejs',{message:''})
    }
});

server.get('/register', function(req,res,next) {
    if(req.cookies.user){
        res.redirect('/',next)
    }else{
        res.render('register.ejs',{message:''})
    }
});

server.post('/register', function(req,res,next) {
    if(!req.body.user_name || !req.body.password || !req.body.email || !req.files.img.name) {
        res.render('register.ejs',{message:'Invalid details!'});
    }else{
        connection.query(`SELECT * FROM users WHERE userName = "${req.body.user_name}"`,function(error, results, fields) {
            if(results.length != 0){
                res.render('register.ejs', {message: "User Already Exists! Login or choose another username"});
            }else{
                var newPerson = {
                    userName : req.body.user_name,
                    password : req.body.password,
                    email : req.body.email,
                    img : req.files.img.name
                };
                
                connection.query('INSERT INTO users SET ?',newPerson, function(err,results) {
                    res.setCookie('user', newPerson.userName);
                    res.redirect('/',next);
                });
            }
        });
    }
});

server.post('/login', function(req,res,next) {
    connection.query(`SELECT * FROM users WHERE userName = "${req.body.user_name}" AND password = "${req.body.password}"`,async function(error, results, fields) {
        if(results.length != 0){
            res.setCookie('user', results[0].userName);
            res.redirect('/',next);
        }else{
            res.render('login.ejs',{message:'Wrong Username or Password!'})
        }
    });
});

server.get('/logout', function(req,res,next) {
    res.clearCookie('user');
    res.redirect('/login',next)
});

server.listen(3000, function() {
     console.log('%s listening at %s', server.name, server.url);
});