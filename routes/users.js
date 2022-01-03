const express = require('express');
const router  = express.Router();
const catchAsync = require('../utils/catchAsync');
const User    = require('../models/user');

router.get('/register',(req,res) =>{
    res.render('users/register');
})

router.post('/register',catchAsync( async(req,res) =>{
    const {username,firstName, lastName, email, telNo, password} = req.body;
    const user =  new User({username,firstName, lastName, email, telNo});
    const registeredUser =  await User.register(user,password);
    console.log(registeredUser);
    res.redirect('/contents');
}));

module.exports = router;