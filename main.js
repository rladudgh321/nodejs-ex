const http = require('http');
const url = require('url');
const fs = require('fs');
const template = require('./lib/template');
const qs = require('querystring');
const path = require('path');
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
                const filtered = path.parse(queryData.id).base;
                fs.readFile(`./data/${filtered}`,'utf8',function(error2,data){
                    const title = queryData.id;
                    const senitizedTitle = sanitizeHtml(title);
                    const senitizedDescription = sanitizeHtml(data, {
                        allowedTags:['h1']
                    });
                    // console.log(title);
                    const list = template.link(filelist);
                    const html = template.html(senitizedTitle,list,senitizedDescription, `
                    <a href="/create">CREATE</a>
                    <a href="/update?id=${senitizedTitle}">UPDATE</a>
                    <form action="delete_process" method="post">
                        <p><input type="hidden" name="id" value="${senitizedTitle}"></p>
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
            const filtered = path.parse(queryData.id).base;
            fs.readFile(`./data/${filtered}`,'utf8',function(error2,data){
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
            const filtered = path.parse(post.id).base;
            fs.unlink(`./data/${filtered}`,function(error){
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