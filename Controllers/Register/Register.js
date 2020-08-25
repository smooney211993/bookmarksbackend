const handleRegister = async (req,res,db, bcrypt)=>{
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
            res.json(user[0])
            await trx.commit
        }catch(error){
            await trx.rollback
            res.status(400).json('unable to register')

        }
    })
}

module.exports = {
    handleRegister: handleRegister

}