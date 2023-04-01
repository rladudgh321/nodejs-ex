const http = require('http');
const url = require('url');
const topic = require(`./lib/topic`);

const app = http.createServer(function(request,response){
    const queryData =url.parse(request.url,true).query;
    // console.log(url.parse(request.url,true).query);
    const pathname = url.parse(request.url,true).pathname;
    if(pathname === '/'){
        if(queryData.id === undefined){
            topic.home(request,response);
        } else {
            topic.page(request,response);
        }
    } else if(pathname === '/create'){
        topic.create(request,response);
    } else if(pathname === '/create_process'){
        topic.create_process(request,response);
    } else if(pathname === '/update'){
        topic.update(request,response);
    } else if(pathname === '/update_process'){
        topic.update_process(request,response);
    } else if(pathname === '/delete_process'){
        topic.delete_process(request,response);
    } else {
        response.writeHead(404);
        response.end(`NOT FOUND`);
    }
});
app.listen(3000);