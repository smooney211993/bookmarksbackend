const handleAddBookmarks = async (req,res,db)=>{
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

}

const handleDeleteBookmarks = async(req,res,db)=>{
    try {
        const remove = req.bookmark
        if(remove){
            const {bookmarks_id} = req.bookmark
            const deleted = await db("savedbookmarks").where({bookmarks_id: bookmarks_id}).del()
            res.json('succesfully deleted')
        } else {
            res.status(400).json('bookmark not found')
        }
    } catch (error) {
        
    }

}

const handleUpdateBookmarks = async(req,res,db)=>{
    const {name, url} = req.body
    const {id} = req.params
    try {
            const updated = await db('savedbookmarks').where({bookmarks_id: id})
            .update({bookmarks_name: name, bookmarks_url: url})
            .returning('updated')
            console.log(updated)
            res.json(updated)

        
    } catch (error){
        res.status(400).json('can not update bookmarks')
    }
}

module.exports = {
    handleDeleteBookmarks : handleDeleteBookmarks,
    handleAddBookmarks: handleAddBookmarks,
    handleUpdateBookmarks: handleUpdateBookmarks
}