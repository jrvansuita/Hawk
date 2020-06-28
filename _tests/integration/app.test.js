const Initializer = require('../../src/_init/initializer.js')

describe('app initialization', () => {
  it('should try to start the app', async () => {
    return new Initializer().setJestMode(true).begin().then(data => expect(data).toBeUndefined())
  }, 100000)
})

describe('External APIs', () => {
  const MundiApi = require('../../src/mundipagg/mundi-api.js')

  test('Mundipagg API', done => {
    new MundiApi().sale('121043161').onError((e) => {
      done.fail(new Error(e))
    }).go((data) => {
      done()
    })
  })
})
