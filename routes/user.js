const express = require('express');
const router = express.Router();
const passport = require('passport');
const User = require('../models/user.js');


router.get('/register',(req,res)=>
{
    res.render('register.ejs');
})

router.post('/register', async(req,res)=>
{
    try{
            const{ username ,email,password } = req.body;
    const user =  new User({username,email});
    const newUser =  await User.register(user,password);
  
    req.login(newUser, (err)=>               // this ensures that user got logged in when is registered
    {
        if(err) return next(err);
        req.flash("success"," Happy Blogging");


    res.redirect("/home");
    })
    }
    
    catch(e)
    {
        req.flash("err", e.message);
        res.redirect("/register");
        
    }


})
router.get("/login",(req,res)=>
{
    res.render("login.ejs");
})
                                                                                        //not flashing it :(
router.post('/login', (req, res, next) => {
  passport.authenticate('local', (err, user, info) => {
    if (err) {
      return next(err);
    }
    if (!user) {
      req.flash('err', 'Invalid username or password'); // Flash an error message
      return res.redirect('/login');
    }
    req.logIn(user, (err) => {
      if (err) {
        return next(err);
      }
      req.flash('success', 'Welcome Back!');
      const redirectPath = req.session.returnTo || '/home';
      return res.redirect(redirectPath);
    });
  })(req, res, next);
});




router.get("/logout",(req,res,next)=>
{
    req.logout(function(err) {
        if (err) { return next(err); }
        req.flash("del"," Logged Out successfully!!"); 
    res.redirect("/home");

    }

    
    )
    
})

module.exports = router;