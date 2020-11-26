const express = require('express');
const { isLoggedIn, isNotLoggedIn } = require('./middlewares');
const { Post, User, Hashtag } = require('../models');


const router = express.Router();

router.use((req, res, next) => {
  res.locals.user = req.user;
  res.locals.followerCount = req.user ? req.user.Followers.length : 0;
  res.locals.followingCount = req.user ? req.user.Followings.length : 0;
  res.locals.followerIdList = req.user ? req.user.Followings.map(f => f.id) : [];
  next();
});

router.get('/profile', isLoggedIn, (req, res) => {
  res.render('profile', { title: '내 정보 - NodeBird' });
});

router.get('/loginpage', isLoggedIn, (req, res) => {
  res.render('signup', { title: '로그인 인증 페이지' });
});

router.get('/join', isNotLoggedIn, (req, res) => {
  res.render('join', { title: '회원가입 - NodeBird' });
});

// router.get(/signup/, async(req, res, next) => {
//   res.render('signup', { title : '이중 로그인 확인 절차'})
// });

router.get('/signup', async (req, res, next) => {
  //주소값을 잘라서 가져오는 방법을 찾아야 되고.
  try{
    res_token = req.query.token;
  const urluser = await User.findOne({where: {token: res_token}})
  console.log("exuser 이메일은  : " + urluser.email, urluser.token);
  console.log("글로벌 이메일은 이것입니다 : " + global.loginemail);
  if (urluser.email == global.loginemail){
    console.log('성공');
    res.redirect('/logout');
  }
  else{
    console.error(err);
    return next(err);
  }
  }catch (err) {
    console.error(err);
    return next(err);
  }
});

router.get('/', async (req, res, next) => {
  try {
    const posts = await Post.findAll({
      include: {
        model: User,
        attributes: ['id', 'nick'],
      },
      order: [['createdAt', 'DESC']],
    });
    console.log(posts);
    res.render('main', {
      title: 'NodeBird',
      twits: posts,
    });
  } catch (err) {
    console.error(err);
    next(err);
  }
});

router.get('/hashtag', async (req, res, next) => {
  const query = req.query.hashtag;
  if (!query) {
    return res.redirect('/');
  }
  try {
    const hashtag = await Hashtag.findOne({ where: { title: query } });
    let posts = [];
    if (hashtag) {
      posts = await hashtag.getPosts({ include: [{ model: User }] });
    }
    return res.render('main', {
      title: `${query} | NodeBird`,
      twits: posts,
    });
  } catch (error) {
    console.error(error);
    return next(error);
  }
});

module.exports = router;
// module.exports = () => global.loginemail;
