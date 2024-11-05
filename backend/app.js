const restify = require('restify');
const router=require('./Router/router')


const server=restify.createServer();
server.use(restify.plugins.bodyParser());

router.applyRoutes(server);


server.listen(3000,()=>{
    console.log(`server running`)
})