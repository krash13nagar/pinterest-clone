var express = require('express');
const passport = require('passport');
var router = express.Router();
const userModel=require('./users');
const postModel=require('./post')
const localStrategy = require('passport-local');
const upload=require('./multer');
const {v4:uuidv4} = require('uuid');
const path=require('path');
const { uploadBytes,getStorage,ref, getDownloadURL } = require('firebase/storage');


passport.use(new localStrategy(userModel.authenticate()));

router.get('/', function(req, res, next) {
  res.render('index',{nav:false});
});

router.get('/register',function(req, res, next) {
  res.render('register',{nav:false});
});

router.get('/profile',isLoggedIn,async function(req, res, next) {
  const user=await userModel.findOne({username:req.session.passport.user}).populate("posts");
  res.render('profile',{user,nav:true});
});

router.get('/show/posts',isLoggedIn,async function(req, res, next) {
  const user=await userModel.findOne({username:req.session.passport.user}).populate("posts");
  res.render('show',{user,nav:true});
});

router.get('/feed',isLoggedIn,async function(req,res,next){
  const user=await userModel.findOne({username:req.session.passport.user});
  const posts=await postModel.find().populate("user");
  res.render("feed",{user,posts,nav: true});
})



router.get('/add',isLoggedIn,async function(req, res, next) {
    const user=await userModel.findOne({username:req.session.passport.user});
    res.render("add",{user,nav:true});
});

router.post('/createpost',isLoggedIn,upload.single("postimage"),async function(req, res, next) {
  const user=await userModel.findOne({username:req.session.passport.user});
  const unique=uuidv4();
 const filename=unique+path.extname(req.file.originalname);
 const storage=getStorage();
 const imageRef=ref(storage,filename);
 const uploadTask=await uploadBytes(imageRef,req.file.buffer);
 const downloadTask=await getDownloadURL(imageRef);
  const post=await postModel.create({
    user:user._id,
    title:req.body.title,
    description:req.body.description,
    image:downloadTask
  });
  user.posts.push(post._id);
  await user.save();
  res.redirect("/profile");
})


router.post('/fileupload',isLoggedIn,upload.single("image"),async function(req, res, next) {
 const user=await userModel.findOne({username:req.session.passport.user});
 const unique=uuidv4();
 const filename=unique+path.extname(req.file.originalname);
const storage=getStorage();
const imageRef=ref(storage,filename);
const uploadTask=await uploadBytes(imageRef,req.file.buffer);
const downloadTask=await getDownloadURL(imageRef);

 user.profileImage=downloadTask;

 await user.save();
 res.redirect("/profile");
 
});




router.post('/register',function(req, res, next) {
  const data=new userModel({
    username: req.body.username,
    name:req.body.fullname,
    email: req.body.email,
    contact: req.body.contact,
  });
  userModel.register(data,req.body.password)
  .then(function(){
    passport.authenticate("local")(req,res,function(){
      res.redirect('/profile');
    })
  })
});


router.post('/login',passport.authenticate("local",{
  failureRedirect:"/",
  successRedirect:"/profile",
}),function(req, res, next) {
});


router.get('/logout',function(req,res,next){
  req.logout(function(err){
    if(err){
      return next(err);
    }
    res.redirect('/');
  })
});

function isLoggedIn(req, res, next){
  if(req.isAuthenticated()){
    return next();
  }
  res.redirect("/");
};

module.exports = router;
