import express from 'express';
import morgan from 'morgan';
import cors from 'cors'; // Access-Control-Allow-Origin
import cookieParser from 'cookie-parser';
import expressSession from 'express-session';
import dotenv from 'dotenv';
import hpp from 'hpp';
import helmet from 'helmet';

import passport from 'passport';
import passportConfig from './passport';

import { sequelize } from './models';
import userRouter from './routes/user';
import postRouter from './routes/post'
import postsRouter from './routes/posts'
import hashtagRouter from './routes/hashtag'

dotenv.config();
const app = express();
const prod: boolean = process.env.NODE_ENV === 'production';

app.set('port', prod ? process.env.PORT : 3065);
sequelize.sync({ force: false })
  .then(() => {
    console.log('데이터베이스 연결 성공');
  })
  .catch((err: Error) => {
    console.error(err);
  });
passportConfig();
if (prod) {
  app.use(hpp());
  app.use(helmet());
  app.use(morgan('combined'));
  // cors 를 모두 허용해주면 위험하다
  // 테스트할때나 개발할때는 모르겠지만 나중에 배포하게 될땐 모두허용하게 되면 안된다.
  app.use(cors({
    origin: /nodebird\.com$/,
    credentials: true,
  }));
} else {
  app.use(morgan('dev'));
  app.use(cors({
    origin: true, // 지금은 테스트니깐 origin : true
    credentials: true, // 
  }))
}

app.use('/', express.static('uploads'));
// 프론트에서 json 형태로 데이터를 보냈을때 json 형태 데이터를 req.body 로넣어준다.
app.use(express.json());
// form submit 을 했을때 , urlencoded 방식으로 데이터가 넘어온다.
// 그래서 form 했을때 데이터를 처리해준다.
app.use(express.urlencoded({ extended: true })); 
app.use(cookieParser(process.env.COOKIE_SECRET));
app.use(expressSession({
  resave: false,
  saveUninitialized: false,
  secret: process.env.COOKIE_SECRET!,
  cookie: {
    httpOnly: true,
    secure: false, // https -> true
    domain: prod ? '.nodebird.com' : undefined,
  },
  name: 'rnbck',
}));
app.use(passport.initialize());
app.use(passport.session());
app.use('/user', userRouter);
app.use('/post', postRouter);
app.use('/posts', postsRouter);
app.use('/hashtag', hashtagRouter);

app.get('/', (req, res, next) => {
  res.send('react nodebird 백엔드 정상 동작!');
});

app.listen(app.get('port'), () => {
  console.log(`server is running on ${app.get('port')}`);
});
