const express = require('express');
const router  = express.Router();
const catchAsync = require('../utils/catchAsync');
const User    = require('../models/user');
const passport = require('passport');
const { isLoggedIn,isAuthor } = require('../middleware');

router.get('/register',(req,res) =>{
    res.render('users/register');
})

router.post('/register',catchAsync(async(req,res) =>{
    try{
        const {username,firstName, lastName, email, telNo, password} = req.body;
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

router.get('/login', (req,res) =>{
    res.render('users/login');
})

router.post('/login' , passport.authenticate('local', { failureFlash : true, failureRedirect : '/login'}) ,(req,res) =>{
    req.flash('Welcome Back'); 
    res.redirect('/contents');
})

router.get('/edit', isLoggedIn, catchAsync( async(req,res) =>{
        const user = await User.findById(req.user._id);
        res.render('users/edit',{user});

}));

router.put('/edit',isLoggedIn, catchAsync(async(req,res) =>{
    const id = req.user._id;
    const sanitizedUser = await User.findByIdAndUpdate(id, {...req.body.user});
    const newPassword = req.body.user.password;
    await sanitizedUser.setPassword(newPassword);
    await sanitizedUser.save();
      
    req.flash('success', 'Successfully updated the Content');
    res.redirect('/contents');
}));

router.get('/logout', (req,res) =>{
    req.logout();
    req.flash('success','GoodBye!');
    res.redirect('/contents');
})


module.exports = router;