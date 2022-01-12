const express = require('express');
const router  = express.Router();
const catchAsync = require('../utils/catchAsync');
const User    = require('../models/user');
const passport = require('passport');
const { isLoggedIn,isAuthor } = require('../middleware');

// For refistration of new user
router.get('/register',(req,res) =>{
    res.render('users/register');
})

// post route for regitration
router.post('/register',catchAsync(async(req,res) =>{
    try{
        //console.log(req.body);
        const {username,firstName, lastName, email, telNo, password} = req.body;
        // making a new user object and storing in database.
        const user =  new User({username,firstName, lastName, email, telNo});
        const registeredUser =  await User.register(user,password);
        req.login(registeredUser, err =>{
            if(err) return next(err);
            req.flash('success','Welcome to PratiLipi'); 
            res.redirect('/contents');
        });
    }catch(e){
        req.flash('error',e.message);
        res.redirect('register');
    }
}));

// login route
router.get('/login', (req,res) =>{
    res.render('users/login');
})

// post route for login and validation
router.post('/login' , passport.authenticate('local', { failureFlash : true, failureRedirect : '/login'}) ,(req,res) =>{
    req.flash('Welcome Back'); 
    res.redirect('/contents');
})

// User can edit their information, edit page
router.get('/edit/:id', isLoggedIn, catchAsync( async(req,res) =>{
        const user = await User.findById(req.user._id);
        res.render('users/edit',{user});

}));

// post route for edit page
router.put('/edit/:id',isLoggedIn, catchAsync(async(req,res) =>{
    const id = req.user._id;
    console.log(req.body);
    // finding the existing user by user_id
    const sanitizedUser = await User.findByIdAndUpdate(id, {...req.body.user});
    // incase user wants to update their password
    const newPassword = req.body.user.password;
    await sanitizedUser.setPassword(newPassword);
    await sanitizedUser.save();
      
    req.flash('success', 'Successfully updated the Content');
    res.redirect('/contents');
}));

// Logout 
router.get('/logout', (req,res) =>{
    req.logout();
    req.flash('success','GoodBye!');
    res.redirect('/contents');
})


module.exports = router;