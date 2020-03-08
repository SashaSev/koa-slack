const Koa = require('koa');
const app = new Koa();
const serve = require('koa-static');
const Router = require('koa-router');
const router = new Router();
const Pug = require('koa-pug');
const db = require('./config/database');
const path = require('path');
const bodyParser = require('koa-bodyparser');
const User = require('./models/user');
const bcrypt = require('bcryptjs');
const socket = require('socket.io');
const http = require('http');

const generateMessage = require('./src/messages');
const {addUser, getUser, getUsersInWorkspace} = require('./src/users');

const passport = require('koa-passport');
require('./config/passport/passport');
app.use(bodyParser());
app.use(serve('./public'));
new Pug({
    viewPath: path.join(__dirname, 'views'),
    basedir: './views',
    app: app
});

app.use(passport.initialize());
app.use(passport.session());

db.authenticate()
    .then(() => console.log('database connected...'))
    .catch(err => console.log('Error: ' + err));

router.get('/', require('./routes/frontpage').get);
router.get('/login', async (ctx) => {
    await ctx.render('login');
});

router.get('/register', require('./routes/register').get);
router.post("/register", require('./routes/register').post);
router.post('/login', (ctx, next) => {
    passport.authenticate('local', {
        session: false,
        successRedirect: '/dashboard',
        failureRedirect: '/login',
    })(ctx, next);
});
router.post('/logout', async ctx => {
    ctx.logout();
    ctx.redirect('/')
});

app.use(router.routes()).use(router.allowedMethods());

router.get('/workspace.html', async ctx => {
    await ctx.render('workspace.html');
});


////////socket ////////////
const server = http.createServer(app.callback());
const io = socket(server);

io.on('connection', socket => {
    console.log('User connected');
    socket.on('join', (options, callback) => {
        const {error, user} = addUser({id: socket.id, ...options});

        if (error) {
            return callback(error)
        }

        socket.join(user.workspace);

        socket.emit('message', generateMessage('Admin', 'Welcome!'));
        socket.broadcast.to(user.workspace).emit('message', generateMessage('Admin', `${user.username} has joined!`));
        io.to(user.workspace).emit('workspaceData', {
            workspace: user.workspace,
            users: getUsersInWorkspace(user.workspace)
        });

        callback()
    });

    socket.on('sendMessage', (message, callback) => {
        const user = getUser(socket.id);

        io.to(user.workspace).emit('message', generateMessage(user.username, message));
        callback()
    })

});

const port = process.env.PORT || 3000;
app.listen(port);