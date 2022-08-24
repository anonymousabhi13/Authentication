var express = require('express');
var router = express.Router();
const createrModel = require('./users');
const productSchema = require('./profile');
const passport = require('passport');
const localStrategy = require('passport-local').Strategy;
const multer = require('multer');
const Jimp = require('jimp');
const bcryptjs=require('bcryptjs');



passport.use(new localStrategy(createrModel.authenticate()));



const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, './public/images/upload')
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
    cb(null, uniqueSuffix + '-' + file.originalname)
  }
})

const upload = multer({ storage: storage })

router.get('/', function (req, res, next) {
  res.render('index');
});

router.get('/reset', function (req, res, next) {
  res.render('reset');
});



router.get('/delete/:id', function (req, res, next) {
  productSchema.findOneAndDelete({ _id: req.params.id })
    .then(function () {
      res.redirect('profile');
    })
});
router.get('/update/:id', function (req, res, next) {
  productSchema.findOneAndUpdate({ _id: req.params.id })
    .then(function (updateuser) {
      productSchema.create({
        product: req.body.productname,
        image: req.body.image,
      })
        .then(function (pwu) {
          loginuser.mypost.push(pwu._id)
          loginuser.save()
            .then(function (val) {
              res.redirect('/profile');
            })
        })
    })
});

router.post('/upload', upload.single('file'), function (req, res) {
  createrModel.findOne({ username: req.session.passport.user })
    .then(function (foundUser) {
      Jimp.read(`./public/images/upload/${req.file.filename}`, (err, file) => {
        if (err) throw err;
        file
          .resize(file.bitmap.width * .5, file.bitmap.height * .5)
          .quality(10)
          .write(`./public/images/upload/${req.file.filename}`);
      });
      foundUser.image = req.file.filename;
      foundUser.save()
        .then(function () {
          res.redirect(req.headers.referer);
        })
    })

});

router.get('/profile', isLoggedIn, function (req, res) {
  createrModel.findOne({ username: req.session.passport.user })
    .populate('mypost')
    .then(function (elem) {
      res.render('profile', { elem })
      console.log(elem);
    })

});

router.get('/Timeline', function (req, res) {
  productSchema.find()
    .then(function (gg) {
      res.render('timeline', { gg })

    })
});

router.post('/create', isLoggedIn, function (req, res) {
  createrModel.findOne({ username: req.session.passport.user })
    .then(function (loginuser) {
      productSchema.create({
        product: req.body.productname,
        image: req.body.image,
        userid: loginuser._id
      })
        .then(function (pwu) {
          loginuser.mypost.push(pwu._id)
          loginuser.save()
            .then(function (val) {
              res.redirect('/profile');
            })
        })
    })
})

router.get('/like/:id', isLoggedIn, function (req, res, next) {
  createrModel.findOne({ username: req.session.passport.user })
    .then(function (foundUser) {
      productSchema.findOne({ _id: req.params.id })
        .then(function (post) {
          var index = post.like.indexOf(foundUser._id);

          if (index === -1) {
            post.like.push((foundUser._id));
          } else {
            post.like.splice(index, 1);
          }
          post.save()
            .then(function (hh) {
              res.redirect(req.headers.referer);
              // console.log(hh);
            })
        })
    })
});

router.post('/register', function (req, res, next) {
  const newUser = new createrModel({
    user: req.body.user,
    username: req.body.username
  })
  createrModel.register(newUser, req.body.password)
    .then(function (createdUser) {
      passport.authenticate('local')(req, res, function () {
        res.redirect('/profile')
      })
    })
    .catch(function (err) {
      res.send(err);
    })
})

function isLoggedIn(req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  }
  else {
    res.redirect('/');
  }
}

function check(req, res, next) {
  if (!req.isAuthenticated()) {
    return next();
  }
  else {
    res.redirect('/profile');
  }
}

router.post('/login', passport.authenticate('local', {
  successRedirect: '/profile',
  failureRedirect: '/'
}), function (req, res, next) { });

router.get('/logout', function (req, res, next) {
  req.logOut();
  res.redirect('/');
})

module.exports = router;
