require('shieldfy-nodejs-client').start({
    appKey:'aaa',
    appSecret:'123',
    endPoint:'http://d300b502.ngrok.io/v2/',
});
const Hapi = require('hapi');
const Ejs = require('ejs');
const mysql = require('mysql')

const server = Hapi.server({
    port: 3000,
    host: 'localhost',
});

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

server.state('session', {
    ttl: null,
    isSecure: false,
    isHttpOnly: false,
    encoding: 'base64json',
    clearInvalid: false, // remove invalid cookies
    strictHeader: true // don't allow violations of RFC 6265
});

const init = async () => {

    await server.start();
    await server.register(require('vision'));
    server.views({
        engines: { ejs: Ejs },
        relativeTo: __dirname,
        path: 'views'
    });
    
    console.log(`Server running at: ${server.info.uri}`);
};

server.route({
    method: 'GET',
    path: '/',
    handler: function (request, h) {
        return h.view('index',{user : request.state.session})
    }
});

server.route({
    method: 'GET',
    path: '/login',
    handler: (request, h) => {
        if(request.state.session){
            return h.redirect('/')
        }else{
            return h.view('login',{message : ''});
        }
        
    }
});

server.route({
    method: 'GET',
    path: '/register',
    handler: (request, h) => {
        if(request.state.session){
            return h.redirect('/')
        }else{
            return h.view('register',{message : ''});
        }
    }
});

server.route({
    method: 'POST',
    path: '/register',
    handler: async (request, h) => {
        if(!request.payload.user_name || !request.payload.password || !request.payload.email || !request.payload.img.hapi.filename) {
            return h.view('register',{message:'Invalid details!'});
        }else{
            const promise = new Promise((resolve, reject) => {
                connection.query(`SELECT * FROM users WHERE userName = "${request.payload.user_name}"`,function(error, results, fields) {
                    if(results.length != 0){
                        const response = h.view('register', {message: "User Already Exists! Login or choose another username"});
                        resolve(response);
                    }else{
                        var newPerson = {
                            userName : request.payload.user_name,
                            password : request.payload.password,
                            email : request.payload.email,
                            img : request.payload.img.hapi.filename
                        };
                        
                        connection.query('INSERT INTO users SET ?',newPerson, function(err,results) {  
                            const response = h.redirect('/').state('session', newPerson.userName);
                            resolve(response);
                        });
                    }
                });
            })
            return promise;
        }
    },
    options: {
        payload: {
            output: 'stream',
            parse: true,
            allow: 'multipart/form-data'
        }
    }
});

server.route({
    method: 'POST',
    path: '/login',
    handler: async (request, h) => {
        console.log('=#############=');
        console.log(request.payload);
        const promise = new Promise((resolve, reject) => {
            connection.query(`SELECT * FROM users WHERE userName = "${request.payload.user_name}" AND password = "${request.payload.password}"`,async function(error, results, fields) {
                console.log('====================================');
                console.log(results);
                console.log('====================================');
                if(results.length != 0){
                    const response = h.redirect('/').state('session', results[0].userName);
                    resolve(response);
                }else{
                    const response = h.view('login',{message:'Wrong Username or Password!'});
                    resolve(response);
                }
            });
        });
        return promise 
    }
});

server.route({
    method: 'GET',
    path: '/logout',
    handler: function (request, h) {
        return h.redirect('login').unstate('session');
    }
});


process.on('unhandledRejection', (err) => {

    console.log(err);
    process.exit(1);
});

init();