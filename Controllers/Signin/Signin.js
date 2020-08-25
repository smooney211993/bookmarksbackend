const handleSignin = async (req,res, db, bcrypt)=>{
    const {email, password} = req.body;
    try{
        const data = await db.select('email', 'hash').from('login')
        .where('email', '=', email)
        if(bcrypt.compareSync(password, data[0].hash)){
            const user = await db.select('*')
            .from('users')
            .where('email', '=', email)
            //res.json(user[0])
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
};

module.exports = {
    handleSignin: handleSignin
}