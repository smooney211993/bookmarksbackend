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

//  get all user saved bookmarks, all the unique savedbookmarks
app.get('/bookmarks', async (req,res,next)=>{
   /* const data =  await db.select('*').from("savedbookmarks").where('id', '=', '5')*/
   const data = await db('savedbookmarks').distinct('bookmarks_id','bookmarks_name','bookmarks_url').where('id', '=','5')
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
            res.status(400).json('unable to add bookmarks')
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

app.post('/signin', async (req,res,next)=>{
    const {email, password} = req.body;
    try{
        const data = await db.select('email', 'hash').from('login')
        .where('email', '=', email)
        if(bcrypt.compareSync(password, data[0].hash)){
            const user = await db.select('*')
            .from('users')
            .where('email', '=', email)
            //res.send(user[0])
            console.log(user[0].id)
            const id = user[0].id;
            const bookmarks = await db('savedbookmarks').distinct('*').where('id', '=',id)
            const jsonObj = {
                user : user[0],
                bookmarks: bookmarks
            }
            res.json(jsonObj)



          } else {
              res.status(400).send('wrong credentials')
          }

    }catch(error){
        res.status(400).send('unable to connect')

    }
})


app.listen(PORT, ()=>{
    console.log(`you are listening on ${PORT}`)
})

