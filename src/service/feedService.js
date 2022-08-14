const RssFeedEmitter = require('rss-feed-emitter');
const axios = require("axios");
const config = require("config")
const NodeHtmlMarkdown = require("node-html-markdown").NodeHtmlMarkdown;
const FeedDao = require("../dao/feeds");
console.log(`Load config ${JSON.stringify(config)}`);

class FeedService {
    constructor(){
        this.feeder = new RssFeedEmitter({skipFirstLoad: config.rss.skipFirstLoad});
        this.feeder.on('error', console.error);
    }
    async init(){
        const list = await this.listFeed();
        list.forEach(item=>{
            this.addFeed(item);
        })
    }
    addFeed(item){
        console.log(item);
        this.setFeedEvent(item.id, item.channelId, item.tags);
        this.feeder.add({
           url: item.url,
           eventName: item.id,
           refresh: 60000
        });
    }
    setFeedEvent(id, channelId, tags){
        this.feeder._events[id] = [];
        this.feeder.on(id, (m)=>{
          const message = this.mapItemToMessage(m, tags);
          this.sendMessage(message, channelId)
                .then(res=>{
                }).catch(err=>{
                })
        })
        console.log(this.feeder);
    }
    async listFeed(){
        console.log(this.feeder.list);
        return (await FeedDao.listFeed());
    }
    async editFeed(id, feed){
        feed.tags = feed.tags.map(i=>i.trim());
        await FeedDao.editFeed(id, feed);
        this.setFeedEvent(id, feed.channelId, feed.tags);
    }
    async insertFeed(feed){
        feed.tags = feed.tags.map(i=>i.trim());
        const id = await FeedDao.insertFeed(feed);
        feed.id = id;
        this.addFeed(feed);
        return await(this.listFeed());
    }
    async deleteFeed(feedId){
        const feed = await FeedDao.findFeed(feedId);
        if(!feed) throw new Error("Feed Not found");
        this.feeder.remove(feed.url);
        await FeedDao.deleteFeed(feedId);
        return await(this.listFeed());
    }
    mapItemToMessage(item, tags){
       return `##### [${item.title}](${item.link})

${NodeHtmlMarkdown.translate(item.description)}

${tags.map(i=>"#"+i).join(" ")}
        `
    }
    sendMessage(message, channelId){
      return axios({
          method: "POST",
          url: `${config.coco.url}/api/v4/posts`,
          headers:{
              "Authorization":`Bearer ${config.coco.token}`
          },
          data:{
              channel_id: channelId,
              message
          }
      })
    }
}

module.exports = new FeedService();
