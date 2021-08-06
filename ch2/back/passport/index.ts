import passport from 'passport';

import User from '../models/user';
import local from './local';

export default () => {
  passport.serializeUser<User, number>((user, done) => {
    done(null, user.id);
  });

  passport.deserializeUser<User, number>(async (id, done) => {
    try {
      // 메모리에 저장했던 사용자 아이디를 사용자 객체로 바꿔주는 함수
      // include 도 설정해야하지만 관계설정을 아직 안해서 적지 않는다.
      const user = await User.findOne({
        where: { id },
      });
      if (!user) {
        return done(new Error('no user'));
      }
      return done(null, user); // req.user
    } catch (err) {
      console.error(err);
      return done(err);
    }
  });

  local();
}
