const Initializer = require('../../src/_init/initializer.js')

describe('app initialization', () => {
  it('should try to start the app', async () => {
    return new Initializer().setJestMode(true).begin().then(data => expect(data).toBeUndefined())
  }, 100000)
})

// describe('external apis', () => {
//   const MundiApi = require('../../src/mundipagg/mundi-api.js')

//   it('should connet with Mundipagg', () => {
//     new MundiApi().sale('121043161').go((data) => {
//       console.log(data)

//       expect(data).toBeDefined()
//     })
//   })
// })
