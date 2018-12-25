/**
 * Route Mappings
 * (sails.config.routes)
 *
 * Your routes tell Sails what to do each time it receives a request.
 *
 * For more information on configuring custom routes, check out:
 * https://sailsjs.com/anatomy/config/routes-js
 */

module.exports.routes = {

  /***************************************************************************
  *                                                                          *
  * Make the view located at `views/homepage.ejs` your home page.            *
  *                                                                          *
  * (Alternatively, remove this and add an `index.html` file in your         *
  * `assets` directory)                                                      *
  *                                                                          *
  ***************************************************************************/

    'get /': function(req, res) {
        return res.view('index',{user : req.cookies.user});
    },

    'get /login': function(req, res) {
        if(req.cookies.user){
            res.redirect('/');
        }else{
            return res.view('login',{message : ''});
        }
    },

    'get /register': function(req, res) {
        if(req.cookies.user){
            res.redirect('/');
        }else{
            return res.view('register',{message : ''});
        }
    },

    'post /register': function(req, res) {
        req.file('img').upload(async function (err, uploadedFiles){
            if(!req.body.user_name || !req.body.password || !req.body.email || !uploadedFiles[0].filename){
                res.status("400");
                res.send("Invalid details!");
            }else{
                Users.findOne({userName : req.body.user_name}).exec((err,doc)=>{
                    if(doc){
                        res.view('register', {message: "User Already Exists! Login or choose another username"});
                    }else{
                        
                        var newPerson = {
                            userName : req.body.user_name,
                            password : req.body.password,
                            email : req.body.email,
                            img : uploadedFiles[0].filename
                        };
                        Users.create(newPerson).exec((err,doc)=>{
                            if(err) {
                                console.log(err);
                                res.view('register', {message: "Error"});
                            }else{
                                console.log("add new user");
                                res.cookie('user', newPerson.userName, { maxAge: 900000, httpOnly: true });
                                res.redirect('/');
                            }
                        })
                    }
                })
            }
        });
    },

    'post /login': function(req, res) {
        user = {
            userName : req.body.user_name,
            password : req.body.password
        }
    
        Users.findOne(user).exec((err,doc)=>{
            if(doc){
                res.cookie('user', doc.userName, { maxAge: 900000, httpOnly: true });
                res.redirect('/');
            }else{
                res.render('login',{message:"Wrong Username or Password!"});
            }
        })
    },

    'get /logout': function(req, res) {
        res.clearCookie('user');
        return res.view('login',{message : ''});
    },
  


  /***************************************************************************
  *                                                                          *
  * More custom routes here...                                               *
  * (See https://sailsjs.com/config/routes for examples.)                    *
  *                                                                          *
  * If a request to a URL doesn't match any of the routes in this file, it   *
  * is matched against "shadow routes" (e.g. blueprint routes).  If it does  *
  * not match any of those, it is matched against static assets.             *
  *                                                                          *
  ***************************************************************************/


};
