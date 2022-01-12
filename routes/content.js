const express = require('express');
const router  = express.Router();
const catchAsync = require('../utils/catchAsync');
const Content = require('../models/content');
const Like = require('../models/like');
const View = require('../models/view');
const { isLoggedIn, isAuthor, validateContent } = require('../middleware');

// Home page for contents
router.get('/',catchAsync( async(req,res) => {
    const contents = await Content.find({});
    res.render('contents/index', {contents});
}));


// New Content page to write story
router.get('/new', isLoggedIn, (req,res) => {
    res.render('contents/new');
});

// sorting on the basis of date Published
router.get('/newcontent', isLoggedIn, async(req,res) =>{
    const contents = await Content.find({}).sort({datePublished: -1});    
    res.render('contents/index', {contents});
});

// sorting on the basis of count of likes
router.get('/mostliked', async(req,res) =>{
    const contents = await Content.find({}).sort({likeCount: -1});  
    res.render('contents/index', {contents});
});

// sorting on the basis of view counts
router.get('/mostviewed', async(req,res) =>{
    const contents = await Content.find({}).sort({viewCount: -1});  
    res.render('contents/index', {contents});
});

// a particular content
router.get('/:id',catchAsync( async(req,res) =>{
    const content = await Content.findById(req.params.id).populate('author');
    if(!content){
        req.flash('error' , 'Can not find the content');
        return res.redirect('/contents');
    }
    res.render('contents/show', {content});
}));

// post route for content 
router.post('/',isLoggedIn, validateContent, catchAsync( async(req,res,next) =>{
        
        // getting current date 
        var date = new Date(); 
        req.body.content.datePublished = date;

        // making a new content object and saving into database
        const content = new Content(req.body.content);
        content.author = req.user._id;
        await content.save();
        req.flash('success', 'Successfully made a new Content');
        // redirecting to page where it has been created
        res.redirect(`/contents/${content._id}`);
}));

// To edit a particular content page
router.get('/:id/edit' , isLoggedIn,isAuthor, catchAsync(async(req,res) =>{
    const content = await Content.findById(req.params.id);
    if(!content){
        req.flash('error' , 'Can not find the content');
        return res.redirect('/contents');
    }
    res.render('contents/edit', {content});
}));

// calculation of when a view has counted for a content
router.get('/:id/view', isLoggedIn, catchAsync(async(req,res) =>{
    const { id } = req.params;

    // making a view object that has reference to user
    const currentView = new View({view:req.user._id});
    await currentView.save();

    // finding the content on which user triggered view
    const currentContent= await Content.findById(id);

    if(!currentContent){
        req.flash('error' , 'Content does not exists');
        return res.redirect(`/contents/${id}`);
    }
    Content.findByIdAndUpdate(id,{
        // increment of viewCount variable of current content
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

// calculation of when a like is counted for a content
router.put('/:id/like', isLoggedIn, catchAsync(async(req,res) =>{
    const { id } = req.params;

    // making a new like object from like schema 
    const currentLike =  new Like({like:req.user._id});
    await currentLike.save();
    
    // finding the content on which like operation triggered and populating likes[] array which contain reference of like object
    const currentContent = await Content.findById(id).populate({
        path : 'likes',
        match : {like : {$in : [req.user._id]} },
        select : 'like -_id'
    }).exec();
    
   // if we find a empty array then user has not liked the content yet otherwise yes 
    if(currentContent.likes.length){
        req.flash('error' , 'You have already liked the story');
        return res.redirect(`/contents/${id}`);
    }

    // pushing the _id of like object created and increamenting likeCount for a content. 
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

// For updating the a particualar content/story --> middleware taking care of if user logged in, is Author and validity.
router.put('/:id',isLoggedIn, isAuthor, validateContent ,catchAsync(async(req,res) =>{
    const { id } = req.params;
    const content = await Content.findByIdAndUpdate(id, {...req.body.content});
    req.flash('success', 'Successfully updated the Content');
    res.redirect(`/contents/${content._id}`);
}));

// For deleting a content. can be deleted by only owner of story.
router.delete('/:id',isLoggedIn,isAuthor, async(req,res) =>{
    const { id } = req.params;
    await Content.findByIdAndDelete(id);
    res.redirect('/contents');
})

module.exports = router;