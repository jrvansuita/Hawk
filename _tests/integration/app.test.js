const Initializer = require('../../src/_init/initializer.js')

describe('app initialization', () => {
  it('should try to start the app', async () => {
    return new Initializer().setJestMode(true).begin().then(data => expect(data).toBeUndefined())
  }, 100000)
})
