// Class helper for Settings
var Sett = {
  get(user, settNum, userType) {
    return user?.setts?.[settNum?.toString()] && (userType > -1 ? user?.type === userType : true);
  },

  every(user, setts) {
    if (user) {
      if (setts instanceof Array) {
        return setts.every((each) => {
          return this.get(user, each);
        });
      }
    }
  },

  some(user, setts) {
    if (user) {
      if (setts instanceof Array) {
        return setts.some((each) => {
          return this.get(user, each);
        });
      }
    }
  },
};

if (typeof module !== 'undefined') {
  module.exports = Sett;
}
