const info = require('./info');
const mongoose = require('mongoose');

const Blog = require('../models/blog');
mongoose.set('strictQuery', true);
mongoose.connect('mongodb://127.0.0.1:27017/blogs', {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(() => {
  console.log('Connected to MongoDB');
}).catch((error) => {
  console.error('Error connecting to MongoDB:', error);
});

const sample = (array) => 
{
    return array[Math.floor(Math.random() * array.length)];
}

const seedDb = async () =>
{
    Blog.deleteMany({});
    for (let i = 0; i < 3; i++) {
        const blog = new Blog({
            
            title: info[i].title,
            description: info[i].description,
            time: new Date(),
            image:'https://source.unsplash.com/random/?blog/'
             
        })
        await blog.save();
    }
}

seedDb().then(() => {
    mongoose.connection.close();
})