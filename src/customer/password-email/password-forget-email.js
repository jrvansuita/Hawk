const EmailBuilder = require('../../email/email-builder.js')
const User = require('../../bean/user.js')

module.exports = class CustomerPasswordEmail {
  go (email, calback) {
    User.findOne({ email: email }, (_err, user) => {
      if (user) {
        this._sendEmail(user, () => {})
      }
    })
  }

  _sendEmail (data, callback) {
    new EmailBuilder()
      .template('FORGOT')
      .to(data.email)
      .setData({
        name: data.name,
        access: data.access,
        email: data.email,
        pass: data.pass
      })
      .send((res) => {})
  }
}
