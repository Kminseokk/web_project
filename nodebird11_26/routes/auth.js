const express = require('express');
const passport = require('passport');
const bcrypt = require('bcrypt');
const { isLoggedIn, isNotLoggedIn } = require('./middlewares');
const User = require('../models/user');

const crypto = require('crypto');

const router = express.Router();


router.post('/join', isNotLoggedIn, async (req, res, next) => {
  const { email, nick, password ,seculogin} = req.body;
  try {
    const exUser = await User.findOne({ where: { email } });
    if (exUser) {
      return res.redirect('/join?error=exist');
    }
    const hash = await bcrypt.hash(password, 12);
    await User.create({
      email,
      nick,
      password: hash,
      seculogin,
    });
    return res.redirect('/');
  } catch (error) {
    console.error(error);
    return next(error);
  }
});

router.post('/login', isNotLoggedIn, (req, res, next) => {
  passport.authenticate('local', (authError, user, info) => {
    if (authError) {
      console.error(authError);
      return next(authError);
    }
    if (!user) {
      return res.redirect(`/?loginError=${info.message}`);
    }
    return req.login(user, (loginError) => {
      if (loginError) {
        console.error(loginError);
        return next(loginError);
      }
      if(user.seculogin == "on"){
        const token = crypto.randomBytes(20).toString('hex');
        User.update(
          {token : token},
          {where: {email: user.email}}
          )
        global.loginemail = user.email;
        res.redirect('/index/post');
        //res.redirect('/loginpage');
      }
      else if (user.seculogin == "off"){
        return res.redirect('/');
      }
    });
  })(req, res, next); // 미들웨어 내의 미들웨어에는 (req, res, next)를 붙입니다.
});


router.get('/logout', isLoggedIn, (req, res) => {
  console.log("이메일은 이것입니다. " + req.user)
  req.logout();
  req.session.destroy(); //세션값을 지움.
  res.redirect('/');
});

module.exports = router;