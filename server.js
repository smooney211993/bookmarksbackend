const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const knex = require('knex');
const bcrypt = require('bcryptjs');
const db = knex({
    client : 'pg',
    connection : {
      host: '127.0.0.1',
      user: 'postgres',
      password: 'JonesbO21',
      database: 'bookmarks'
    }
    
  })



const app = express();

const PORT = process.env.PORT || 3001;

app.use(cors())
app.use(bodyParser.json())


app.get('/', (req,res,next)=>{
    res.send(' i am working')
})


app.get('/user', async (req,res,next)=>{
    const data =  await db.select('*').from("users")
    res.send(data[0])
    console.log(data)

})

//  get all user saved bookmarks
app.get('/bookmarks', async (req,res,next)=>{
   /* const data =  await db.select('*').from("savedbookmarks").where('id', '=', '5')*/
   const data = await db('savedbookmarks').distinct('bookmarks_name','bookmarks_url').where('id', '=','5')
    res.send(data)
    console.log(data.length)
})

// add bookmarks to the database
app.post('/bookmarks', async (req,res,next)=>{
    const {name, url, id} = req.body;
    if(!name || !url || !id) {
        return res.status(400).json('incorrect form submission');
    }
        try {
            const bookmarks = await db('savedbookmarks').returning('*').insert({
                bookmarks_name:name, 
                bookmarks_url: url, 
                date_created: new Date(),
                 id: id})
            res.json(bookmarks[0])

        } catch (error) {
            res.status(400).json('unable to register')
        }  

})
// register user
app.post('/register', async (req,res,next)=>{
    const {password, email,name} = req.body;
    const salt = bcrypt.genSaltSync(10);
    const hash = bcrypt.hashSync(password, salt);
    if (!email || !name || !password) {
        return res.status(400).json('incorrect form submission');
      }
    db.transaction(async(trx)=>{
        try{
            const loginEmail = await trx.insert({
                hash: hash,
                email: email
            }).into('login')
            .returning('email')
            console.log(req.body)
            const user = await trx('users')
            .returning('*')
            .insert({
                email: loginEmail[0],
                name: name,
                joined: new Date()
            })

            console.log(user[0])
            res.send(user[0])
            await trx.commit
        }catch(error){
            await trx.rollback
            res.status(400).json('unable to register')

        }
    })
    

})

app.post('/signin', (req,res,next)=>{
    
})


app.listen(PORT, ()=>{
    console.log(`you are listening on ${PORT}`)
})

