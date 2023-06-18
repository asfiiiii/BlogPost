const mongoose = require('mongoose');

const schema = mongoose.Schema ;


const imageSchema = new schema({

    path:String,
    filename:String

});

const blogSchema = ({

    title: String,
    description: String,
    time: String,
    image:[imageSchema],
    author: {
        type: schema.Types.ObjectId,
        ref:'User'
    }
    
})

const Blog =  mongoose.model('Blog',blogSchema);

module.exports = Blog;