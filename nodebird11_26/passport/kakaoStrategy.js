const express = require('express');
const passport = require('passport');
const KakaoStrategy = require('passport-kakao').Strategy;
const User = require('../models/user');

  module.exports = () => {
    passport.use(new KakaoStrategy({
      clientID: process.env.KAKAO_ID,
      callbackURL: '/auth/kakao/callback',
    }, async (accessToken, refreshToken, profile, done) => {
     const user = await User.findOne({});
     const dbno = await user.id;
     try {
       User.update({
        kakaonick: profile.displayName,
        snsId: profile.id, 
        provider: 'kakao',
       },{
         where : { id : dbno }
       })
     } catch (error) {
       console.error(error);
       done(error);
     }
    })
    );
  }