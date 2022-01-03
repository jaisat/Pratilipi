module.exports.isLoggedIn = (req,res,next) =>{
    if(!req.isAuthenticated()){
        req.flash('error','You Must be signed In First');
        return res.redirect('/login');
    }
    next();
}