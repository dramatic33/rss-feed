const Router = require("express").Router;
const router = Router();
const FeedService = require("../service/feedService");

router.get("/feeds", async (req, res, next)=>{
    try{
        const list = await FeedService.listFeed();
        res.send(list)
    }catch(err){
        handleError(res, err);
    }
});

router.post("/feeds", async(req, res, next)=>{
    try {
        const body = req.body;
        if(!body.feedName) throw new Error("require feedName");
        if(!body.url) throw new Error("require url");
        if(!body.tags) throw new Error("require tags");
        if(!body.channelId) throw new Error("require channelId");
        const list = await FeedService.insertFeed(body);
        res.send(list)
    } catch (err){
        handleError(res, err);
    }
})

router.patch("/feeds/:id", async(req, res, next)=>{
    try {
        const body = req.body;
        const id = req.params.id;
        if(!id) throw new Error("require id");
        if(!body.feedName) throw new Error("require feedName");
        if(!body.tags) throw new Error("require tags");
        if(!body.channelId) throw new Error("require channelId");
        await FeedService.editFeed(id, body);
        res.send(body)
    } catch (err){
        handleError(res, err);
    }
})

router.delete("/feeds/:id", async(req, res, next)=>{
    try{
        const id = req.params.id;
        const list = await FeedService.deleteFeed(id);
        res.send(list);
    }catch(err){
        handleError(res, err);
    }

})

function handleError(res, err){
    console.error(err);
    res.status(500).send({
        err : err.message
    })
}

module.exports = router;
