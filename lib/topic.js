const db = require('../db/db');
const url = require('url');
const template = require('./template');
const qs = require('querystring');


exports.home = function(request,response){
    db.query(`SELECT *FROM topic`,function(error,topics){
        if(error){
            throw error;
        }
        // console.log(topics);
        
        const title = 'welcome';
        const data = 'node. js';
        const list = template.link(topics);
        const html = template.html(title,list,data,`
        <a href="/create">CREATE</a>`);
        response.writeHead(200);
        response.end(html);
    });
},

exports.page = function(request,response){
    const queryData =url.parse(request.url,true).query;

    db.query(`SELECT *FROM topic`,function(error,topics){
        if(error){
            throw error;
        }
        db.query(`SELECT * FROM topic WHERE id = ?`,[queryData.id],function(error2, topic){
            if(error2){
                throw error2;
            }
            const title = topic[0].title;
            const description = topic[0].description;                    
            const list = template.link(topics);
            const html = template.html(title,list,description, `
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
},

exports.create = function(request, response){
    db.query(`SELECT *FROM topic`,function(error,topics){
        if(error){
            throw error;
        }
        const title = 'CREATE';
        const data = '';
        const list = template.link(topics);
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
},

exports.create_process = function(request,response){
    let body = ``;
        request.on('data', function(data){
            body += data;
            // console.log(body);
        });
        request.on('end',function(){
            const post = qs.parse(body);
            db.query(`INSERT INTO topic(title,description,created,author_id)
            VALUES(?,?,NOW(),?)`,[post.title,post.description,1],function(error,result){
                if(error){
                    throw error;
                }
                console.log(result);
                response.writeHead(302,{location:`/?id=${result.insertId}`});
                response.end();
            });
        });
},

exports.update = function(request,response){
    const queryData =url.parse(request.url,true).query;
    db.query(`SELECT *FROM topic`,function(error,topics){
        if(error){
            throw error;
        }
        db.query(`SELECT * FROM topic WHERE id = ?`,[queryData.id],function(error2, topic){
            if(error2){
                throw error2;
            }                
            const list = template.link(topics);
            const html = template.html(``,list,'<h2>UPDATE</h2>',`
            <form action="update_process" method="post">
            <input type="hidden" name="id" value="${queryData.id}">
            <p><input type="text" name="title" placeholder="title" value="${topic[0].title}"></p>
            <p><textarea name="description" placeholder="description">${topic[0].description}</textarea></p>
            <p><input type="submit" value="UPDATE"></p>
            </form>
            `);
            response.writeHead(200);
            response.end(html);
        });
    });
},

exports.update_process = function(request, response){
    let body = ``;
    request.on('data', function(data){
        body += data;
        // console.log(body);
    });
    request.on('end',function(){
        const post = qs.parse(body);
        // console.log(post);
        db.query(`UPDATE topic SET
            title = ?,
            description = ?
            WHERE id = ?
        `,[post.title, post.description, post.id], function(error,result){
            response.writeHead(302,{location:`/?id=${post.id}`});
            response.end();
        });
    });
},

exports.delete_process= function(request,response){
    let body = ``;
    request.on('data', function(data){
        body += data;
        // console.log(body);
    });
    request.on('end',function(){
        const post = qs.parse(body);
        // console.log(post);
        db.query(`DELETE FROM topic WHERE id =?`,[post.id],function(error,result){
            if(error){
                throw error;
            }
            response.writeHead(302,{location:`/`});
            response.end();
        });
    });
}