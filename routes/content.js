const express = require('express');
const router  = express.Router();
const catchAsync = require('../utils/catchAsync');
const Content = require('../models/content');
const Like = require('../models/like');
const View = require('../models/view');
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

    const contents = await Content.find({}).sort({likeCount: -1});  
    res.render('contents/index', {contents});
    
});

router.get('/mostviewed', async(req,res) =>{

    const contents = await Content.find({}).sort({viewCount: -1});  
    res.render('contents/index', {contents});
    
});

// router.post('/csv',)

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

    const currentView = new View({view:req.user._id});
    await currentView.save();

    const currentContent= await Content.findById(id);

    if(!currentContent){
        req.flash('error' , 'Content does not exists');
        return res.redirect(`/contents/${id}`);
    }
    
    Content.findByIdAndUpdate(id,{
        $inc:{viewCount : 1}
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
    const currentLike =  new Like({like:req.user._id});
    await currentLike.save();
    
    const currentContent = await Content.findById(id).populate({
        path : 'likes',
        match : {like : {$in : [req.user._id]} },
        select : 'like -_id'
    }).exec();
    
   
    if(currentContent.likes.length){
        req.flash('error' , 'You have already liked the story');
        return res.redirect(`/contents/${id}`);
    }
    
    Content.findByIdAndUpdate(id,{
        $push:{likes: currentLike._id},
        $inc:{likeCount : 1}
        
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