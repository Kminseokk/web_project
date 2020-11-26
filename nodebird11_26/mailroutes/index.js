const express = require('express');
const nodemailer = require('nodemailer');
const router = express.Router();
const dotenv = require('dotenv');
const User = require('../models/user');

const crypto = require('crypto');

dotenv.config(); //dotenv파일에서 콘피그함수 호출.

User.findOne()
  .then((user) => {
    const token = crypto.randomBytes(20).toString('hex');
    user.update({
      token : token
    })
   });


router.get('/post', function(req, res, next){
  //const email = req.body.email;

  const transporter = nodemailer.createTransport({
    service: 'gmail',
    port: 465,
    secure: true,
    auth: {
        user: process.env.NODEMAILER_USER,
        pass: process.env.NODEMAILER_PASS,
    }
  });

  const mailOptions = {
    from: process.env.NODEMAILER_USER,    // 발송 메일 주소
    to: req.user.email ,     // 수신 메일 주소
    subject: '인증 테스트',   // 제목
    html: '아래의 링크를 클릭해주세요 !\n'  +
      "http://localhost:8001/signup?token=" + req.user.token//여기 주소 변경1124
      //auth/?email="+ email + ${token}>인증하기</a>"
      // 내용123 456 789 
  };

  transporter.sendMail(mailOptions, function(error, info){
    if (error) {
      console.log(error);
    }
    else {
      User.findOne({
        where: { email : req.user.email }
      })
      .then((User) => {
        console.log('User: ', User.dataValues);
      });
      console.log('Email sent: ' + info.response);
    }
  });

  res.redirect("/");
})

module.exports = router