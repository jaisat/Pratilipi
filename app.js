const express = require('express');
const app = express();
const path = require('path');
const mongoose = require('mongoose');
const Content = require('./models/content');
const methodOverride = require('method-override');
const ejsMate  = require('ejs-mate');
const ExpressError = require('./utils/ExpressError');
const passport = require('passport');
const LocalStrategy = require('passport-local');
const User = require('./models/user');
const flash = require('connect-flash');
const session = require('express-session');
const multer = require('multer');
const csv  = require('csvtojson');  
const bodyParser = require('body-parser');

const contentRoutes = require('./routes/content');
const userRoutes    = require('./routes/users');

// for staoring csv file
var storage = multer.diskStorage({  
    destination:(req,file,cb)=>{  
        cb(null,'./public/uploads');  
    },  
    filename:(req,file,cb)=>{  
        cb(null,file.originalname);  
    }  
});

var uploads = multer({storage:storage});
app.use(bodyParser.urlencoded({extended:true}));
app.use(express.static(path.resolve(__dirname,'public')));  


// Mongo connection 
mongoose.connect('mongodb://mongodb:27017/prati-lipi',{
    useNewUrlParser: true,
    useUnifiedTopology : true,
});

const db = mongoose.connection;
db.on("error",console.error.bind(console,"connection error:"));
db.once("open",()=>{
    console.log("Database connected");
});

app.engine('ejs',ejsMate);
app.set('view engine','ejs');
app.set('views',path.join(__dirname,'views'));

// session configuration
const sessionConfig = {
    secret : 'thinkofabetterSecret',
    resave : false,
    saveUninitialized : true,
    cookie : {
        httpOnly : true,
        expires : Date.now() + 1000 * 60 * 60 *24 * 7,
        maxAge :  1000 * 60 * 60 *24 * 7
    }
}

app.use(session(sessionConfig));
app.use(flash());

app.use(express.urlencoded({extended: true}));
app.use(methodOverride('_method'));

app.use(passport.initialize());
app.use(passport.session()); 
passport.use(new LocalStrategy(User.authenticate()));

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser())
  
app.use((req,res,next) =>{
    res.locals.currentUser = req.user;
    res.locals.success     = req.flash('success');
    res.locals.error       = req.flash('error');
    next();
})

// using two main routes user and content
app.use('/', userRoutes);
app.use('/contents', contentRoutes);

// home route
app.get('/',(req,res) =>{
    res.render('home');
})

// Data ingestion in database through csv File.
var temp;
app.post('/',uploads.single('csv'),(req,res)=>{  
    //convert csvfile to jsonArray     
    csv()  
   .fromFile(req.file.path)  
   .then((jsonObj)=>{  
       //console.log(jsonObj);  
       //the jsonObj will contain all the data in JSONFormat.
       //but we want columns likeCount, viewCount Final data as number .
       //becuase we set the dataType of these fields as Number in our mongoose.Schema(). 
       //here we put a for loop and change these column value in number from string using parseInt(). 
       //here we use parseInt() beause because these fields contain the Int values.
       for(var x=0;x<jsonObj;x++){  
            temp = parseInt(jsonObj[x].viewCount)  
            jsonObj[x].viewCount = temp;  
            temp = parseFloat(jsonObj[x].likeCount); 
            jsonObj[x].likeCount = temp;  
        } 
        //insertmany is used to save bulk data in database.
        //saving the data in collection(table)
        Content.insertMany(jsonObj,(err,data)=>{  
               if(err){  
                   console.log(err);  
               }else{  
                   res.redirect('/contents');  
               }  
        });  
      });  
   });  
     
// In case we won't get any matches 
app.all('*',(req,res,next) =>{
    next(new ExpressError('Page Not Found', 404));
})

app.use((err,req,res,next) =>{
    const {statusCode = 500} = err;
    if(!err.message) err.message = 'OH NO ! SOMETHING WENT WRONG';  
    res.status(statusCode).render('error', {err});
})

app.listen(3000,() => {
    console.log('Serving on port 3000');
})