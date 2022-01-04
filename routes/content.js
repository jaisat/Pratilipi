const express = require('express');
const router  = express.Router();
const catchAsync = require('../utils/catchAsync');
const Content = require('../models/content');
const User = require('../models/user');
const { isLoggedIn, isAuthor, validateContent } = require('../middleware');


router.get('/',catchAsync( async(req,res) => {
    const contents = await Content.find({});
    res.render('contents/index', {contents});
}));

router.get('/new',isLoggedIn ,(req,res) => {
    res.render('contents/new');
});

router.get('/newcontent', async(req,res) =>{

    const contents = await Content.find({}).sort({datePublished: -1});    
    res.render('contents/index', {contents});

});

router.get('/mostliked', async(req,res) =>{

    const contents = await Content.find({}).sort({like: -1});  
    res.render('contents/index', {contents});
    
});

router.get('/mostviewed', async(req,res) =>{

    const contents = await Content.find({}).sort({views: -1});  
    res.render('contents/index', {contents});
    
});

router.get('/:id',catchAsync( async(req,res) =>{
    const content = await Content.findById(req.params.id).populate('author');
    if(!content){
        req.flash('error' , 'Can not find the content');
        return res.redirect('/contents');
    }
    res.render('contents/show', {content});
}));

router.post('/',isLoggedIn, validateContent, catchAsync( async(req,res,next) =>{
        
        var date = new Date(); 
        req.body.content.datePublished = date;

        const content = new Content(req.body.content);
        content.author = req.user._id;
        await content.save();
        req.flash('success', 'Successfully made a new Content');
        res.redirect(`/contents/${content._id}`);
}));

router.get('/:id/edit' , isLoggedIn,isAuthor, catchAsync(async(req,res) =>{
    const content = await Content.findById(req.params.id);
    if(!content){
        req.flash('error' , 'Can not find the content');
        return res.redirect('/contents');
    }
    res.render('contents/edit', {content});
}));



router.get('/:id/view', isLoggedIn, catchAsync(async(req,res) =>{
    const { id } = req.params;
    const currentContent= await Content.findById(id);
    if(!currentContent){
        req.flash('error' , 'Content does not exists');
        return res.redirect(`/contents/${id}`);
    }
    
    Content.findByIdAndUpdate(id,{
        $inc:{views: 1}
    },{
        new:true
    }).exec((err,result) =>{
        if(err){
          req.flash('error' , 'Can not find the content');
          return res.redirect('/contents');
        }
    })
    res.redirect(`/contents/${id}`);
}));

router.put('/:id/like', isLoggedIn, catchAsync(async(req,res) =>{
    const { id } = req.params;
    const currentContent= await Content.findById(id);
    let currentUser =  currentContent.likes.includes(req.user._id);
    if(currentUser){
        req.flash('error' , 'You have already liked the story');
        return res.redirect(`/contents/${id}`);
    }
    
    Content.findByIdAndUpdate(id,{
        $push:{likes:req.user._id},
        $inc:{like: 1}
        
    },{
        new:true
    }).exec((err,result) =>{
        if(err){
          req.flash('error' , 'Can not find the content');
          return res.redirect('/contents');
        }
    })
    res.redirect(`/contents/${id}`);
}));


// http://localhost:3000/contents/61d45e268ce602398f677a8d/view?_method=PUT
// http://localhost:3000/contents/61d45e268ce602398f677a8d

router.put('/:id',isLoggedIn, isAuthor, validateContent ,catchAsync(async(req,res) =>{
    const { id } = req.params;
    const content = await Content.findByIdAndUpdate(id, {...req.body.content});
    req.flash('success', 'Successfully updated the Content');
    res.redirect(`/contents/${content._id}`);
}));

router.delete('/:id',isLoggedIn,isAuthor, async(req,res) =>{
    const { id } = req.params;
    await Content.findByIdAndDelete(id);
    res.redirect('/contents');
})

module.exports = router;