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
  console.log("req.이메일 : " + req.body.email);
  console.log("req.비밀번호 : " + req.body.password); //암호화로 보내지는 비밀번호를 수정하면 된다.
  passport.authenticate('local', (authError, user, info) => {
    if (authError) {
      console.error(authError);
      return next(authError);
    }
    if (!user) {
      return res.redirect(`/?loginError=${info.message}`);
    }
    return req.login(user, (loginError) => {
      console.log("설마 이게 유전가? " + user.email_verified);
      global.loginemail = user.email;
      if (loginError) {
        console.error(loginError);
        return next(loginError);
      }
      if(user.seculogin == "on" && user.email_verified == false){
        console.log("이메일이 보내져야 한다.")
        const token = crypto.randomBytes(20).toString('hex');
        User.update(
          {token : token},
          {where: {email: user.email}}
          )
        res.redirect('/index/post');
      }
      else if (user.seculogin == "on" && user.email_verified == true){
        console.log("이메일 signup 완료");
        res.redirect('/');
      }
      else if (user.seculogin == "off"){
        console.log("이중 보안 설정 안했으면 여기로");
        return res.redirect('/');
      }
    });
  })(req, res, next); // 미들웨어 내의 미들웨어에는 (req, res, next)를 붙입니다.
});

router.get('/signup', async (req, res, next) => {
  try{
    res_token = req.query.token;
    console.log("글로벌 이메일은 이것입니다 : " + global.loginemail);
    User.findOne({
      where: { token : res_token }
    })
    .then((data) => {
      console.log('User: ', data.dataValues);
      if (data.email == global.loginemail){
        User.update({
          email_verified: true,
        }, {
          where: {email : global.loginemail},
        });
        console.log("익스유저의 이메일 베리파이드를 출력할 수 있나요? " + data.email_verified);
        res.locals.email = data.email
        res.locals.password = data.password //nunjucks이용한거. html파일에 변수로 사용가능해 진다.
        res.render('loginhtml')
      }
    });
  }catch (err) {
    console.error(err);
    return next(err);
  }
});



router.get('/logout', isLoggedIn, (req, res) => {
  console.log("사인업로그인은" + req.user.signuplogin);
  req.logout();
  req.session.destroy(); //세션값을 지움.
  res.redirect('/');
});

module.exports = router;
