const store = new Vuex.Store({
    state: {
        feeds: [],
        editFeed: null,
        confirmation :null
    },
    getters: {
        feeds: state=>{
            return state.feeds;
        },
        editFeed: state=>{
            return state.editFeed;
        },
        confirmation: state=>{
            return state.confirmation;
        }
    },
    mutations: {
        setFeeds(state, payload){
            state.feeds = payload.feeds;
        },
        setEditFeed(state, payload){
            state.editFeed = payload.editFeed;
        },
        setConfirmation(state, payload){
            state.confirmation = payload;
        }
    },
    actions: {
        refresh (context){
            axios.get("/api/feeds/").then(res=>{
                context.commit("setFeeds", {
                    feeds: res.data
                });
            })
        }
    }
})
Vue.component('app', {
    template: "#AppTemplate",
})
Vue.component('feedlist', {
    template: "#FeedListTemplate",
    computed:{
        feeds(){
            return store.getters.feeds;
        }
    },
    mounted(){
        store.dispatch("refresh");
    }
})
Vue.component('feed', {
    template: "#FeedTemplate",
    props: ["feed"],
    methods:{
        editFeed(){
            store.commit("setEditFeed", {
                editFeed: this.feed
            })
        },
        deleteFeed(){
            store.commit("setConfirmation", {
                header: `${this.feed.feedName} 삭제`,
                content: `${this.feed.feedName}을 정말로 삭제 하시겠습니까?`,
                onConfirm: async ()=>{
                    await axios.delete(`/api/feeds/${this.feed.id}`);
                    store.dispatch("refresh");
                }
            })
        }
    }
})
Vue.component("feedEditModal", {
    template: "#FeedEditModalTemplate",
    computed:{
        feed(){
            return store.getters.editFeed;
        },
        tags(){
            if(this.tagText!=null){
                return this.tagText.split(",");
            } else {
                return [];
            }
        },
        isInsert(){
            return this.id==null;
        }
    },
    data(){
        return {
            id: null,
            feedName: null,
            url: null,
            tagText: null,
            channelId: null
        }
    },
    watch:{
        feed(newValue){
            if(newValue){
                this.id = newValue.id;
                this.feedName=newValue.feedName;
                this.url= newValue.url;
                this.channelId = newValue.channelId;
                if(newValue.tags!=null) this.tagText = newValue.tags.join(",");
                else this.tagText = null;
                const inst = this;
                $(this.$refs["modal"])
                    .modal({
                        onApprove:()=>{
                            if(inst.isInsert) inst.insertFeed();
                            else inst.editFeed();
                            store.dispatch("refresh");
                        },
                        onHidden: ()=>{
                            store.commit("setEditFeed",{
                                editFeed: null
                            })
                        }
                    })
                    .modal("show");
            } else {
                this.id = null;
                this.feedName = null;
                this.url = null;
                this.tagText = null;
                $(this.$refs["modal"]).modal("hide");
            }
        }
    },
    methods:{
        async insertFeed(){
            await axios.post("/api/feeds", {
                feedName: this.feedName,
                url: this.url,
                channelId: this.channelId,
                tags: this.tags
            })
        },
        async editFeed(){
            await axios.patch(`/api/feeds/${this.id}`, {
                feedName: this.feedName,
                channelId: this.channelId,
                tags: this.tags
            })
        }
    }
})

Vue.component("appMenu", {
    template: "#MenuTemplate",
    methods:{
        addFeed(){
            store.commit("setEditFeed",{
                editFeed:{}
            })
        }
    }
})

Vue.component("confirmation", {
    template: "#ConfirmTemplate",
    data(){
        return {
            header: null,
            content: null,
            onConfirm: null
        }
    },
    computed:{
       confirmData(){
           return store.getters.confirmation;
       }
    },
    watch:{
        confirmData(newValue){
            if(newValue){
                this.header = newValue.header;
                this.content = newValue.content;
                this.onConfirm = newValue.onConfirm;
                $(this.$refs["modal"])
                    .modal({
                        onApprove: ()=>{
                            this.onConfirm();
                        },
                        onHidden: ()=>{
                            store.commit("setConfirmation",null)
                        }
                    })
                    .modal("show");
                
            } else {
                $(this.$refs["modal"]).modal("hide");
            }
        }
    }
})
