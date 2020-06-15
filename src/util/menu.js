// Class helper for Menu Options Showing
var Menu = {

  has (user, menuName) {
    try {
      if (user.full) {
        return true
      }

      return user.menus ? user.menus.includes(menuName.toLowerCase()) : false
    } catch (e) {
      return false
    }
  }
}

if (typeof module !== 'undefined') { module.exports = Menu }
