/*
*
*
*       Complete the API routing below
*       
*       
*/

'use strict';
const Mongoose = require('mongoose')
module.exports = function (app) {
const mySecret = process.env['MONGO_URI']
  Mongoose.connect(mySecret, { useNewUrlParser: true, useUnifiedTopology: true, useFindAndModify: false })
  const bookSchema = Mongoose.Schema({
    title: {type: String, required: true},
    comments: {type: [String], default: []}
  })

  const Book = Mongoose.model("Book", bookSchema);
  app.route('/api/books')
    .get(function (req, res){
      //response will be array of book objects
      //json res format: [{"_id": bookid, "title": book_title, "commentcount": num_of_comments },...]
      Book.find({}, 'title _id comments', (err, books) => {
        if(err) {
          res.send({ error: 'An error occurred' })
        } else if (!books) {
          res.send('no book exists')
        } else  {
          const bookCommentCount = books.map(book => {
            const commentCount = book.comments ? book.comments.length : 0
            return {
              title: book.title,
              _id: book._id,
              commentcount: commentCount
            }
          })
          res.json(bookCommentCount)
        }
      })
      
    })
    
    .post(function (req, res){
      let { title } = req.body;
      //response will contain new book object including atleast _id and title
      if(!title) {
        res.json({error :'missing required field title'})
        return;
      };
      const newBook = new Book({ title });
      newBook.save()
      .then(book => {
        res.json({
        title: book.title,
        _id: book._id
      })
       }).catch(error => {
        res.send({error: 'An error occurred'})
       })
      
    })
    
    .delete(function(req, res){
      //if successful response will be 'complete delete successful'
      Book.deleteMany({}, (err) =>{
        if(err) {
          res.send({error: 'An error occurred'})
        } else {
          res.send('complete delete successful')
        }
      } )
    });



  app.route('/api/books/:id')
    .get(function (req, res){
      let { id } = req.params;
      //json res format: {"_id": bookid, "title": book_title, "comments": [comment,comment,...]}
      Book.findOne({_id: id}, (err, book) => {
        if(err) {
          res.send({error: 'An error occured'})
        } else if (!book) {
          res.send('no book exists')
        } else {
          res.json({
          title: book.title,
          _id: book._id,
          comments: book.comments || []
          })
        }
      })
    })
    
    .post(function(req, res){
      let { id } = req.params;
      let { comment } = req.body;
      //json res format same as .get
      if(!comment) {
        res.send('missing required field comment')
        return;
      }
      Book.findByIdAndUpdate(id, {$push: {comments: comment} } ,{new: true}, (err, book) => {
      if(err) {
        res.send({error: "we can't update the book"})
      } else if (!book) {
        res.send('no book exists')
      } else {
        res.json({
          title: book.title,
          _id: book._id,
          comments: book.comments
        })
      }
      })
    })
    
    .delete(function(req, res){
      let { id } = req.params;
      //if successful response will be 'delete successful'
      Book.findByIdAndRemove(id, (err, book) => {
        if(err) {
          res.send({error: 'An error occured'})
        } else if (!book) {
          res.send('no book exists')
        } else {
          res.send('delete successful')
        }
      })
    });
  
};
