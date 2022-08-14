const FeedService = require("./feedService");
const FeedDao = require("../dao/feeds");

module.exports = async ()=>{
    await FeedDao.init();
    await FeedService.init();
}
