"use strict";
exports.__esModule = true;
var express = require("express");
var morgan = require("morgan");
var cors = require("cors");
var cookieParser = require("cookie-parser");
var expressSession = require("express-session");
var dotenv = require("dotenv");
var passport = require("passport");
var hpp = require("hpp");
var helmet = require("helmet");
var passport_1 = require("./passport");
var models_1 = require("./models");
var user_1 = require("./routes/user");
var post_1 = require("./routes/post");
var posts_1 = require("./routes/posts");
var hashtag_1 = require("./routes/hashtag");
var prod = process.env.NODE_ENV === 'production';
dotenv.config();
var app = express();
models_1.sequelize.sync({ force: false })
    .then(function () {
    console.log('데이터베이스 연결 성공');
})["catch"](function (e) {
    console.error(e);
});
passport_1["default"]();
if (prod) {
    app.use(hpp());
    app.use(helmet());
    app.use(morgan('combined'));
    app.use(cors({
        origin: /nodebird\.com$/,
        credentials: true
    }));
}
else {
    app.use(morgan('dev'));
    app.use(cors({
        origin: true,
        credentials: true
    }));
}
app.use('/', express.static('uploads'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser(process.env.COOKIE_SECRET));
app.use(expressSession({
    resave: false,
    saveUninitialized: false,
    secret: process.env.COOKIE_SECRET,
    cookie: {
        httpOnly: true,
        secure: false,
        domain: prod ? '.nodebird.com' : undefined
    },
    name: 'rnbck'
}));
app.use(passport.initialize());
app.use(passport.session());
app.get('/', function (req, res) {
    res.send('react nodebird 백엔드 정상 동작!');
});
// API는 다른 서비스가 내 서비스의 기능을 실행할 수 있게 열어둔 창구
app.use('/api/user', user_1["default"]);
app.use('/api/post', post_1["default"]);
app.use('/api/posts', posts_1["default"]);
app.use('/api/hashtag', hashtag_1["default"]);
app.listen(prod ? process.env.PORT : 3065, function () {
    console.log("server is running on " + process.env.PORT);
});
