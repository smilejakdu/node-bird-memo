import * as express from 'express';
import * as bcrypt from 'bcrypt';
import * as passport from 'passport';
import Image from '../models/image';
import Post from '../models/post';
import User from '../models/user';

import { isLoggedIn } from './middleware';

const router = express.Router();

router.get('/', isLoggedIn, (req, res) => { // /api/user/
  const user = req.user!.toJSON() as User;
  delete user.password;
  return res.json(user);
});

router.post('/', async (req, res, next) => { // POST /api/user 회원가입
  try {
    const exUser = await User.findOne({
      where: {
        userId: req.body.userId,
      },
    });
    if (exUser) {
      return res.status(403).send('이미 사용중인 아이디입니다.');
    }
    const hashedPassword = await bcrypt.hash(req.body.password, 12); // salt는 10~13 사이로
    const newUser = await User.create({
      nickname: req.body.nickname,
      userId: req.body.userId,
      password: hashedPassword,
    });
    console.log(newUser);
    return res.status(200).json(newUser);
  } catch (e) {
    console.error(e);
    // 에러 처리를 여기서
    return next(e);
  }
});

interface IUser extends Partial<User> {
  PostCount: number;
  FollowingCount: number;
  FollowerCount: number;
}
router.get('/:id', async (req, res, next) => { // 남의 정보 가져오는 것 ex) /api/user/123
  try {
    const user = await User.findOne({
      where: { id: parseInt(req.params.id, 10) },
      include: [{
        model: Post,
        as: 'Posts',
        attributes: ['id'],
      }, {
        model: User,
        as: 'Followings',
        attributes: ['id'],
      }, {
        model: User,
        as: 'Followers',
        attributes: ['id'],
      }],
      attributes: ['id', 'nickname'],
    });
    if (!user) return res.status(404).send('no user');
    const jsonUser = user.toJSON() as IUser;
    jsonUser.PostCount = jsonUser.Posts ? jsonUser.Posts.length : 0;
    jsonUser.FollowingCount = jsonUser.Followings ? jsonUser.Followings.length : 0;
    jsonUser.FollowerCount = jsonUser.Followers ? jsonUser.Followers.length : 0;
    return res.json(jsonUser);
  } catch (e) {
    console.error(e);
    return next(e);
  }
});

router.post('/logout', (req, res) => { // /api/user/logout
  req.logout();
  if (req.session) {
    req.session.destroy((err) => {
      res.send('logout 성공');
    });
  } else {
    res.send('logout 성공');
  }
});

router.post('/login', (req, res, next) => { // POST /api/user/login
  passport.authenticate('local', (err, user, info) => {
    if (err) {
      console.error(err);
      return next(err);
    }
    if (info) {
      return res.status(401).send(info.reason);
    }
    return req.login(user, async (loginErr) => {
      try {
        if (loginErr) {
          return next(loginErr);
        }
        const fullUser = await User.findOne({
          where: { id: user.id },
          include: [{
            model: Post,
            as: 'Posts',
            attributes: ['id'],
          }, {
            model: User,
            as: 'Followings',
            attributes: ['id'],
          }, {
            model: User,
            as: 'Followers',
            attributes: ['id'],
          }],
          attributes: ['id', 'nickname', 'userId'],
        });
        console.log(fullUser);
        return res.json(fullUser);
      } catch (e) {
        return next(e);
      }
    });
  })(req, res, next);
});

router.get('/:id/followings', isLoggedIn, async (req, res, next) => { // /api/user/:id/followings
  try {
    const user = await User.findOne({
      where: { id: parseInt(req.params.id, 10) || (req.user && req.user.id) || 0 },
    });
    if (!user) return res.status(404).send('no user');
    const followers = await user.getFollowings({
      attributes: ['id', 'nickname'],
      limit: parseInt(req.query.limit, 10),
      offset: parseInt(req.query.offset, 10),
    });
    return res.json(followers);
  } catch (e) {
    console.error(e);
    return next(e);
  }
});

router.get('/:id/followers', isLoggedIn, async (req, res, next) => { // /api/user/:id/followers
  try {
    const user = await User.findOne({
      where: { id: parseInt(req.params.id, 10) || (req.user && req.user.id) || 0 },
    }); // req.params.id가 문자열 '0'
    if (!user) return res.status(404).send('no user');
    const followers = await user.getFollowers({
      attributes: ['id', 'nickname'],
      limit: parseInt(req.query.limit, 10),
      offset: parseInt(req.query.offset, 10),
    });
    return res.json(followers);
  } catch (e) {
    console.error(e);
    return next(e);
  }
});

router.delete('/:id/follower', isLoggedIn, async (req, res, next) => {
  try {
    const me = await User.findOne({
      where: { id: req.user!.id },
    });
    await me!.removeFollower(parseInt(req.params.id, 10));
    res.send(req.params.id);
  } catch (e) {
    console.error(e);
    next(e);
  }
});

router.post('/:id/follow', isLoggedIn, async (req, res, next) => {
  try {
    const me = await User.findOne({
      where: { id: req.user!.id },
    });
    await me!.addFollowing(parseInt(req.params.id, 10));
    res.send(req.params.id);
  } catch (e) {
    console.error(e);
    next(e);
  }
});

router.delete('/:id/follow', isLoggedIn, async (req, res, next) => {
  try {
    const me = await User.findOne({
      where: { id: req.user!.id },
    });
    await me!.removeFollowing(parseInt(req.params.id, 10));
    res.send(req.params.id);
  } catch (e) {
    console.error(e);
    next(e);
  }
});

router.get('/:id/posts', async (req, res, next) => {
  try {
    const posts = await Post.findAll({
      where: {
        UserId: parseInt(req.params.id, 10) || (req.user && req.user.id) || 0,
        RetweetId: null,
      },
      include: [{
        model: User,
        attributes: ['id', 'nickname'],
      }, {
        model: Image,
      }, {
        model: User,
        as: 'Likers',
        attributes: ['id'],
      }],
    });
    res.json(posts);
  } catch (e) {
    console.error(e);
    next(e);
  }
});

router.patch('/nickname', isLoggedIn, async (req, res, next) => {
  try {
    await User.update({
      nickname: req.body.nickname,
    }, {
      where: { id: req.user!.id },
    });
    res.send(req.body.nickname);
  } catch (e) {
    console.error(e);
    next(e);
  }
});

export default router;
