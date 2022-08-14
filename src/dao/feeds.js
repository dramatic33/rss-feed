const MongoClient = require("mongodb").MongoClient;
const config = require("config");
const { ObjectId } = require("mongodb");

class FeedDao {
    constructor(){
        this.client = new MongoClient(config.database.url);
        this.db = this.client.db(config.database.database);
    }
    async init(){
        await this.client.connect();
    }
    async insertFeed({feedName, url, tags, channelId}){
        const ret = await this.db.collection('feed').insertOne({
            feedName,
            url,
            tags,
            channelId
        });
        return ret.insertedId.toString();
    }
    async findFeed(id){
        return this.map(await this.db.collection('feed').findOne({_id:ObjectId(id)}));
    }
    async listFeed(){
        return (await this.db.collection('feed').find({}).toArray()).map(this.map);
    }
    async editFeed(id, feed){
        await this.db.collection("feed").updateOne({
            _id:ObjectId(id),
        },[
            {$set: {feedName: feed.feedName, tags: feed.tags, channelId: feed.channelId}}
        ])
    }
    async deleteFeed(id){
        await this.db.collection('feed').deleteOne({_id:ObjectId(id)});
    }
    async close(){
        await this.client.close()
    }
    map(ret){
        if(!ret) return null;
        return {
            id: ret._id.toString(),
            feedName: ret.feedName,
            url: ret.url,
            tags: ret.tags,
            channelId: ret.channelId
        }
    }
}

module.exports = new FeedDao();
