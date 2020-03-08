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
const bcrypt =require('bcryptjs');
const socket = require('socket.io');
const http = require('http');

const generateMessage  = require('./src/messages');
const { addUser, getUser, getUsersInWorkspace } = require('./src/users');

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
router.get('/login' ,async  (ctx) => {
   await ctx.render('login');
});

router.get('/register', require('./routes/register').get);
router.post("/register", async (ctx) => {
    const {email, name, password} = ctx.request.body;

    let errors = [];
    if (!email || !name || !password) {
        errors.push({msg: "Please fill in all fields"});
    }
    if (password.length < 7) {
        errors.push({msg: 'Password should at least 7 characters'})
    }
    if (errors.length > 0) {
        await ctx.render('register', {
            errors,
            email,
            name,
            password
        })
    } else {

        User.findOne({where: {email: email}})
            .then(async user => {
                if (user) {
                    errors.push({msg: 'Email is registered'});
                    ctx.render('register', {
                        email,
                        name,
                        password
                    })
                } else {
                    const newUser = await User.create({
                        email,
                        name,
                        password
                    });

                    bcrypt.genSalt(10, (err, salt)=> {
                        bcrypt.hash(newUser.password,salt,(err,hash) => {
                            if(err) throw err;
                            newUser.password = hash;
                            newUser.save()
                                .then(user => {
                                    ctx.redirect('/login');
                                    }
                                )
                                .catch(err => console.log(err));
                        })
                    })



                }

            })

    }

});
router.post('/login', (ctx,next)=> {
         passport.authenticate('local', {
             session: false,
    successRedirect: '/dashboard',
    failureRedirect : '/login',
})(ctx,next);
});

app.use(router.routes()).use(router.allowedMethods());
router.get('/workspace.html', async ctx =>{
    await ctx.render('workspace.html');
});


////////socket ////////////
const server = http.createServer(app.callback());
const io =   socket(server);

io.on('connection', socket => {
    console.log('User connected');
    socket.on('join', (options, callback) => {
        const { error, user } = addUser({ id: socket.id, ...options });

        if (error) {
            return callback(error)
        }

        socket.join(user.workspace);

        socket.emit('message', generateMessage('Admin', 'Welcome!'));
        socket.broadcast.to(user.workspace).emit('message', generateMessage('Admin', `${user.username} has joined!`));
        io.to(user.workspace).emit('roomData', {
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