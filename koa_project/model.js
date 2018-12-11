var mongoose = require('mongoose');

var personSchema = mongoose.Schema({
    userName : String,
    password : String,
    email : String,
    img : String
});

const Person = mongoose.model('user', personSchema);
module.exports = Person;