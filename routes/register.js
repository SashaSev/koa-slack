const User = require('../models/user');
const bcrypt = require('bcryptjs');

exports.get = async function (ctx) {
    await ctx.render('register');

    User.findAll()
        .then(user => {
            console.log(user);
        })
        .catch(err => console.log(err));
};
exports.post = async (ctx) => {
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

                    bcrypt.genSalt(10, (err, salt) => {
                        bcrypt.hash(newUser.password, salt, (err, hash) => {
                            if (err) throw err;
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
}
