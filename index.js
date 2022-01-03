const express = require('express');
const { MongoClient } = require('mongodb');
require('dotenv').config();
const cors = require('cors');
const ObjectId = require('mongodb').ObjectId;

const app = express();
const port = process.env.PORT || 5000;

// middleware
app.use(cors());
app.use(express.json());



const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.voxe2.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

async function run() {
  try {
      await client.connect();
      const database = client.db('BookReaders');
      const usersCollection = database.collection('users');
      const booksCollection = database.collection('books');
      const membersCollection = database.collection('members');
      const commentCollection = database.collection('comments');

      // save users data
       app.post('/users', async (req, res) => {
        const user = req.body;
        const result = await usersCollection.insertOne(user);
        res.json(result);
      });

      // save users data when register using google sign in
      app.put('/users', async (req, res) => {
        const user = req.body;
        const filter = { email: user.email };
        const options = { upsert: true };
        const updateDoc = { $set: user };
        const result = await usersCollection.updateOne(filter, updateDoc, options);
        res.json(result);
      });

      // get user by email admin or not
      app.get('/users/:email', async (req, res) => {
        const email = req.params.email;
        const query = { email: email };
        const user = await usersCollection.findOne(query);
        let isAdmin = false;
        if (user?.role === 'admin') {
            isAdmin = true;
        }
        res.json({ admin: isAdmin });
      })

      // Make admin API
      app.put('/users/admin', async (req, res) => {
        const user = req.body;
        const filter = { email: user.email };
        const updateDoc = { $set: { role: 'admin' } };
        const result = await usersCollection.updateOne(filter, updateDoc);
        res.json(result);
      })

      // POST API for books
      app.post('/books', async (req, res) => {
        const book = req.body;
        const result = await booksCollection.insertOne(book);
        console.log(result);
        res.json(result)
      }); 

      // GET API for all books
      app.get('/books', async (req, res) => {
        const cursor = booksCollection.find({});
        const books = await cursor.toArray();
        res.send(books);
      });

      // GET API for a single book
      app.get('/books/:id', async (req, res) => {
        const id = req.params.id;
        const query = { _id: ObjectId(id) };
        const book = await booksCollection.findOne(query);
        res.json(book);
      });
      
      // DELETE API for manage books 
      app.delete('/books/:id', async (req, res) => {
        const id = req.params.id;
        const query = { _id: ObjectId(id) };
        const result = await booksCollection.deleteOne(query);
        res.json(result);
      });
      
      // POST API for members
      app.post('/members', async (req, res) => {
        const member = req.body;
        const result = await membersCollection.insertOne(member);
        console.log(result);
        res.json(result)
      }); 
      
      // GET API for all members
      app.get('/members', async (req, res) => {
        const cursor = membersCollection.find({});
        const members = await cursor.toArray();
        res.send(members);
      });

      // POST API for comment
      app.post('/comment', async (req, res) => {
        const comment = req.body;
        const result = await commentCollection.insertOne(comment);
        console.log(result);
        res.json(result)
      });

      // GET API for user given comment
      app.get('/comment', async (req, res) => {
        const cursor = commentCollection.find({});
        const comment = await cursor.toArray();
        res.send(comment);
      });  

    }
      finally {
          // await client.close();
      }
    }

    run().catch(console.dir);


app.get('/', (req, res) => {
  res.send('Running Bangladesh Book Readers Association server');
});

app.listen(port, () => {
  console.log('Running Bangladesh Book Readers Association server on port ', port);
})