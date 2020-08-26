const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const knex = require('knex');
const bcrypt = require('bcryptjs');
/*const db = knex({
    client : 'pg',
    connection : {
      host: '127.0.0.1',
      user: 'postgres',
      password: 'JonesbO21',
      database: 'bookmarks'
    }
    
  }) */
const db = knex({
    client: 'pg',
    connection: {
      connectionString: process.env.DATABASE_URL,
      ssl: {
        rejectUnauthorized: false
            }
    }
  });
const signinin = require('./Controllers/Signin/Signin');
const register = require('./Controllers/Register/Register');
const bookmarks = require('./Controllers/Bookmarks/Bookmarks');



const app = express();

const PORT = process.env.PORT || 3001;

app.use(cors())
app.use(bodyParser.json())


app.get('/', (req,res,next)=>{
    res.json(' i am working')
})



// bookmarks params
app.param('bookmarkId', async (req,res,next, id)=>{
    try {
   const bookmark = await db.select('*').from('savedbookmarks').where({bookmarks_id: id})
     if(bookmark.length){
         req.bookmark = bookmark[0];
         next();
        } else {
         res.status(400).send('not found')
          }
     } catch(error){
         response.status(400).send('error getting request')
     }

 }) 


app.get('/bookmarks/:bookmarkId', async (req,res,next)=>{
    res.json(req.bookmark)
})

// add bookmarks to the database
app.post('/bookmarks',(req,res)=>{bookmarks.handleAddBookmarks(req,res,db)})
//delete bookmarks
app.delete('/bookmarks/:bookmarkId', (req,res)=>{bookmarks.handleDeleteBookmarks(req,res,db)})
app.put('/bookmarks', async(req,res)=>{
  const {name, url, id} = req.body
  try {
    const updated = db('savedbookmarks')
    .where({ bookmarks_id: id })
    .update({ 
      bookmarks_name: name ,
      bookmarks_url: url
    }).returning('updated')
    res.json(updated)
  }catch(error){
    res.sendStatus(400).json('error')
  }

})

// register user
app.post('/register',(req,res)=>{register.handleRegister(req,res,db,bcrypt)})



app.post('/signin', (req,res)=>{signinin.handleSignin(req,res,db,bcrypt)})


app.listen(PORT, ()=>{
    console.log(`you are listening on ${PORT}`)
})

