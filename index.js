const express = require('express');
const router = require('./src/router');
const init = require("./src/service/initService");
const app = express();

app.use(express.json());
app.use("/api", router);
app.use(express.static('public'));

init().then(()=>{
    app.listen(3000, ()=>{
        console.log("App listen port 3000");
    })
})

