const mysql = require('mysql2');
const http = require('http');
const fs = require('fs');
const path = require('path');
const db = require('./database');

const validAuthToken = [];
const cookie = require('cookie');
const connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'root',
    database: 'chat'
})

const pathToIndex = path.join(__dirname, 'index.html');
const pathToStyle = path.join(__dirname, 'style.css');
const pathToScript = path.join(__dirname, 'script.js');

const pathToAuth = path.join(__dirname, 'register.js');
const pathToRegister = path.join(__dirname, 'register.html');
const pathToRegisterCss = path.join(__dirname, 'registerStyle.css');

const { Server } = require("socket.io");
const { register } = require('module');

const indexHtmlFile = fs.readFileSync(pathToIndex);
const scriptFile = fs.readFileSync(pathToScript);
const styleFile = fs.readFileSync(pathToStyle);

const authFile = fs.readFileSync(pathToAuth);
const registerFile = fs.readFileSync(pathToRegister);
const registerFileCss = fs.readFileSync(pathToRegisterCss);

const server = http.createServer((req, res) => {

    if (req.method === 'GET') {
        switch (req.url) {
            case '/': return res.end(indexHtmlFile);
            case '/script.js': return res.end(scriptFile);
            case '/style.css': return res.end(styleFile);

            case '/register.js' : return res.end(authFile);
            case '/register' : return res.end(registerFile);
            case '/registerStyle.css' : return res.end(registerFileCss);

            default: return guarded(req, res);
        }
    }
    if(req.method === 'POST')
    {
        switch (req.url){
            case '/api/register': return registerUser(req, res);
            case '/api/login': return loginUser(req, res);

            default: return guarded(req, res);
        }
    }

    res.statusCode = 404;
    return res.end('404');
});

function guarded(req, res)
{
    const credentionals = getCredentionals(req.headers?.cookie);
    if(!credentionals)
    {
        res.writeHead(302, {'Location': '/register'});
        return res.end();
    }
    if(req.method === 'GET')
    {
        switch(req.url)
        {
            case '/': return res.end(indexHtmlFile);
            case '/script.js': return res.end(scriptFile);
        }
    }
    res.writeHead(404);
    return res.end('Error 404');
}
function getCredentionals(c = '')
{
    const cookies = cookie.parse(c);
    const token = cookies?.token;

    if(!token || !validAuthToken.includes(token))
    {
        return null;
    }
    const [user_id, login] = token.split('.');
    if(user_id || !login)
    {
        return null;
    }
    return {user_id, login};
}


function loginUser(req, res)
{
    let data = '';
    req.on('data', function(chunk){
        data += chunk; 
    });
    req.on('end', async function(){
        try
        {
            const user = JSON.parse(data);
            const token = await db.getAuthToken(user);
            validAuthToken.push(token);
            res.writeHead(200);
            res.end(token);
        }catch(e)
        {
            res.writeHead(500);
            return res.end('Error: ' + e);
        }
    });
}


function registerUser(req, res)
{
    let data = '';
    req.on('data', function(chunk){
        data += chunk;
    });
    req.on('end', async function(){
        try{
            const user = JSON.parse(data);
            if(!user.login || !user.password)
            {
                return res.end('Empty login or pass')
            }
            if(await db.isUserExist(user.login))
            {
                return res.end('User already exist')
            }
            await db.addUser(user);
            return res.end('Registration is successfull');
        }catch(e)
        {
            return res.end('Error: ' + e);
        }
    });
}

server.listen(3000);

const io = new Server(server);
// io.emit('event_name', data);
// socket.emit('event_name', data);
// socket.on('event_name', (data)=> {});

io.on('connection', async (socket) => {
    console.log('a user connected.id - ' + socket.id);
    let userNickName = 'admin';
    let messages = await db.getMessages();

    socket.emit('all_messages', messages);

    socket.on('set_nickname', (nickname) => {
        userNickName = nickname;
    });

    socket.on('new_message', (message) => {
        db.addMessage(message, 1);
        console.log(message);
        io.emit('message', userNickName + ": " + message);
    })
})

// io.use((socket, next) => {
//     const cookie = socket.handshake.auth.cookie;
//     const credentionals = getCredentionals(cookie);
//     if(!credentionals)
//         {
//             next(new Error("no auth"));
//         }
//     socket.credentionals = credentionals;
//     next();    
// });























//     if (req.url == '/message' && req.method == 'GET') {
//         connection.query(
//             'SELECT * FROM message',
//             function(err, reulst, fields){
//                 let html = '<html><body><ol>';
//                 reulst.forEach(f=> html += `<li>${f.content}</li>`);
//                 html += `</ol>
//                             <form method="POST" action="/add">
//                                 <input type="text" name="content">
//                             </form>
//                         </body>
//                     </html>`;
//                 res.writeHead(200, {'Content-Type':'text/html'})
//                 res.end(html);
//             }
//         );
//     }
//     else if (req.url == '/friends' && req.method == 'GET') {
//         connection.query(
//             'SELECT * FROM user',
//             function (err, resolt, fields) {
//                 let html = '<html><body><ol>';
//                 resolt.forEach(f => html += `<li>
//                    Name - ${f.name} <br>
//                    Email - ${f.email}
//                </li>`);
//                 html += '</ol></body></html>';
//                 res.writeHead(200, { 'Content-Type': 'text/html' });
//                 res.end(html);
//             }
//         );
//     }


//     else if (req.url == '/add') {
//         let data = '';
//         req.on('data', function (chunk) {
//             data += chunk;
//         })
//         req.on('end', function () {
//             let sp = new URLSearchParams(data);
//             let content = sp.get('content');

//             connection.query(
//                 `INSERT INTO message (content, author_id, dialog_id, formate) VALUES ("${content}", 1, 1, "TEXT")`,
//                     function (err, resolt, fields) {
//                         res.writeHead(302, { 'Location': '/message' })
//                         res.end();
//                     }
//             )
//         })
//     }



//     else {
//         res.writeHead(404, { 'Content-Type': 'text/text' })
//         res.end("sorry we don`t have this thing");
//     }


