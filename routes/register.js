
const user = require('../models/user');

exports.get = async function(ctx) {
  await ctx.render('register');

  user.findAll()
      .then(user => {
        console.log(user);
      })
      .catch(err=> console.log(err));
};
