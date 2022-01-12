const {contentSchema} = require('./schemas');
const ExpressError = require('./utils/ExpressError');
const Content = require('./models/content');
const User    = require('./models/user');

module.exports.isLoggedIn = (req,res,next) =>{
    //console.log(req.user);
    if(!req.user){
        req.flash('error','You Must be signed In First');
        return res.redirect('/login');
    }
    next();
}

module.exports.validateContent = (req,res,next) =>{
    const {error} = contentSchema.validate(req.body);
    if (error) {
        const msg = error.details.map(el => el.message).join(',')
        throw new ExpressError(msg, 400)
    } else {
        next();
    }
}

module.exports.isAuthor = async(req,res,next) =>{
    const { id } = req.params;
    const content =  await Content.findById(id);
    if(!content.author.equals(req.user._id)){
        req.flash('error','You do not have permission to do that');
        return res.redirect(`/contents/${id}`);
    }
    next();
} 