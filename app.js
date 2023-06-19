
if(process.env.NODE_ENV !=="production")
{
    require("dotenv").config()
}


const express = require("express");
const mongoose = require("mongoose");
const Blog = require('./models/blog.js');
const user = require("./models/user");
const{isLoggedIn} = require("./loggedIn");
const {storage, cloudinary } = require("./cloudinaryImageUpload.js");

const multer = require('multer');
const upload = multer({storage});   // image upload

const favicon = require('serve-favicon');
const path = require('path');
const faviconPath = path.join(__dirname, 'public', 'fav.ico');

const methodOverride = require("method-override");
const passport = require("passport"); // for authentication
const localStrategy = require("passport-local");
const session = require("express-session"); // for cookies and FLash
const flash = require('connect-flash');
const mongoStore = require('connect-mongo'); // this is for storing our session info in mongo instead of local broweser


// routes

const userRoutes = require('./routes/user.js');

mongoose.set('strictQuery', true);
mongoose.connect('mongodb+srv://asfarma2815:JpN30YkQv6EaTdjZ@cluster0.0gb0gcb.mongodb.net/?retryWrites=true&w=majority', {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(() => {
  console.log('Connected to MongoDB');
}).catch((error) => {
  console.error('Error connecting to MongoDB:', error);
});
const db = mongoose.connection;


// App uses
const app = express();
app.use(favicon(faviconPath));
app.set("view engine", "ejs");
app.use(express.urlencoded({ extended: true }));
app.use(express.static("public"));
app.use(methodOverride("_method")); // overriding help us in deleting and patching requests

const store = mongoStore.create({
  mongoUrl:'mongodb+srv://asfarma2815:JpN30YkQv6EaTdjZ@cluster0.0gb0gcb.mongodb.net/?retryWrites=true&w=majority',
  secret:"hehe",
  touchAfter: 24 * 60 * 60,
  collection:'sessions'

});

db.on('error', console.error.bind(console, 'connection error:'));
const config = {      //session making stuff hehe:)..

store: store,
secret: " secrethehe",
resave : false,
saveUninitialized: true,

cookie :
{
  expires: Date.now + 1000* 60 * 60 * 24 * 7,
  maxAge: 1000* 60 * 60 * 24 * 7,
  httpOnly: true
}

}

app.use(session(config));
app.use(flash());
// authentication 

app.use(passport.initialize());
app.use(passport.session());
passport.use(new localStrategy(user.authenticate()));

passport.serializeUser(user.serializeUser());
passport.deserializeUser(user.deserializeUser());


app.use((req,res,next)=>  // these are the global variables
{

    res.locals.loggedUser = req.user;        // this showss the current user
    res.locals.success = req.flash("success");
    res.locals.err = req.flash("err");            //Flash messages
    res.locals.del = req.flash("del");



    next();
})


const isAuthor = async(req,res,next)=>
{
    const {id}= req.params;
    const blog = await Blog.findById({ _id:id });
 
    if( !blog.author.equals(req.user._id) )
    {
        req.flash("err","You dont have any Permission");
       return res.redirect(`/home/${id}`);
    }

    next();
}

app.get("/home", async (req, res) => {
  const blogs = await Blog.find({}).populate('author');

  res.render('home.ejs', { blogs });
  });

app.get("/home/new", isLoggedIn , (req, res) => {
  res.render("new.ejs");
});

app.post("/home", upload.single('image'), isLoggedIn, async (req, res) => {
  const { title, description} = req.body;
  const {path , filename} = req.file;

  const date = new Date();
  const time = date.toLocaleString('default', { day: 'numeric', month: 'short' });
  const image = {path,filename};
  const author = req.user._id;
  const blog = new Blog({title,description,time,image,author});
  
  await blog.save();
  res.redirect('/home');
});


app.get("/home/:id", async (req,res)=>
{
  const id = req.params.id;
  const blog = await Blog.findById({_id : id}).populate('author');;
  res.render("show.ejs",{blog});
})
app.get('/home/:id/edit',isLoggedIn, isAuthor, async(req,res)=>
{
  const id = req.params.id;
  const blog = await Blog.findById({_id:id});
  res.render("edit.ejs",{blog})
})

app.put("/home/:id",isLoggedIn,  isAuthor,  async (req, res) => {
  const id = req.params.id;
  const { title, description } = req.body;

  // Set the current time dynamically
  const date = new Date();
  const time = date.toLocaleString('default', { day: 'numeric', month: 'short' });
  // Prepare the updated blog data
  const updatedBlogData = {
    title: title,
    description: description,
    time: time,
  };

  try {
    // Update the blog using findByIdAndUpdate
    const updatedBlog = await Blog.findByIdAndUpdate(id, updatedBlogData, {
      new: true,
    });

    res.redirect(`/home/${id}`);
  } catch (error) {
    // Handle any potential errors
    res.status(500).send("An error occurred while updating the blog.");
  }
});

app.use('/',userRoutes);


app.delete("/home/:id",isLoggedIn,isAuthor, async(req,res)=>
{
  const id = req.params.id;
  const del_blog = await Blog.findByIdAndDelete(id);
  res.redirect('/home');
})

const port = process.env.PORT || 3000
app.listen(port, () => {
  console.log(`Server started on port ${port}`);
});
