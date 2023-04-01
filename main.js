const http = require('http');
const url = require('url');
const fs = require('fs');
const template = require('./lib/template');
const qs = require('querystring');
const sanitizeHtml = require('sanitize-html');

const app = http.createServer(function(request,response){
    const queryData =url.parse(request.url,true).query;
    // console.log(url.parse(request.url,true).query);
    const pathname = url.parse(request.url,true).pathname;
    if(pathname === '/'){
        if(queryData.id === undefined){
            fs.readdir(`./data`,function(error,filelist){
                const title = 'welcome';
                const data = 'node. js';
                const list = template.link(filelist);
                const html = template.html(title,list,data,`
                <a href="/create">CREATE</a>`);
                response.writeHead(200);
                response.end(html);
            });
        } else {
            fs.readdir(`./data`,function(error,filelist){
                fs.readFile(`./data/${queryData.id}`,'utf8',function(error2,data){
                const title = queryData.id;
                const list = template.link(filelist);
                const html = template.html(title,list,data, `
                <a href="/create">CREATE</a>
                <a href="/update?id=${queryData.id}">UPDATE</a>
                <form action="delete_process" method="post">
                    <p><input type="hidden" name="id" value="${queryData.id}"></p>
                    <p><input type="submit" value="DELETE"></p>
                </form>
                `);
                    response.writeHead(200);
                    response.end(html);
                });
            });
        }
    } else if(pathname === '/create'){
        fs.readdir(`./data`,function(error,filelist){
            const title = 'CREATE';
            const data = '';
            const list = template.link(filelist);
            const html = template.html(title,list,data,`
            <form action="create_process" method="post">
            <p><input type="text" name="title" placeholder="title"></p>
            <p><textarea name="description" placeholder="description"></textarea></p>
            <p><input type="submit" value="CREATE"></p>
            </form>
            `);
            response.writeHead(200);
            response.end(html);
        });
    } else if(pathname === '/create_process'){
        let body = ``;
        request.on('data', function(data){
            body += data;
            // console.log(body);
        });
        request.on('end',function(){
            const post = qs.parse(body);
            // console.log(post);
            fs.writeFile(`./data/${post.title}`,post.description,'utf-8',function(error){
                response.writeHead(302,{location:`/?id=${post.title}`});
                response.end();
            });
        });
    } else if(pathname === '/update'){
        fs.readdir(`./data`,function(error,filelist){
            fs.readFile(`./data/${queryData.id}`,'utf8',function(error2,data){
                const title = 'UPDATE';
                const list = template.link(filelist);
                const html = template.html(title,list,'',`
                <form action="update_process" method="post">
                <input type="hidden" name="id" value="${queryData.id}">
                <p><input type="text" name="title" placeholder="title" value="${queryData.id}"></p>
                <p><textarea name="description" placeholder="description">${data}</textarea></p>
                <p><input type="submit" value="UPDATE"></p>
                </form>
                `);
                response.writeHead(200);
                response.end(html);
            });
        });
    } else if(pathname === '/update_process'){
        let body = ``;
        request.on('data', function(data){
            body += data;
            // console.log(body);
        });
        request.on('end',function(){
            const post = qs.parse(body);
            // console.log(post);
            fs.rename(`./data/${post.id}`,`./data/${post.title}`,function(error){
                fs.writeFile(`./data/${post.title}`,post.description,'utf-8',function(error){
                    response.writeHead(302,{location:`/?id=${post.title}`});
                    response.end();
                });
            });
        });
    } else if(pathname === '/delete_process'){
        let body = ``;
        request.on('data', function(data){
            body += data;
            // console.log(body);
        });
        request.on('end',function(){
            const post = qs.parse(body);
            // console.log(post);
            fs.unlink(`./data/${post.id}`,function(error){
                response.writeHead(302,{location:`/`});
                response.end();
            });
        });
    } else {
        response.writeHead(404);
        response.end(`NOT FOUND`);
    }
});
app.listen(3000);