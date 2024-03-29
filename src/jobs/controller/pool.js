const Jobs = require('../../bean/job.js')
const schedule = require('node-schedule')
const File = require('../../file/file.js')

global.jobsPoll = []
var availableJobs = null

module.exports = {

  get (id) {
    return global.jobsPoll.find(each => { return each.id == id })
  },

  runForce (id) {
    this.fireJob(this.get(id))
  },

  getAvailableScripts () {
    if (!availableJobs) {
      availableJobs = {}
      var file = new File(__dirname).folderBack()

      file.getFolderFiles('.js', (fullPath, instance) => {
        availableJobs[fullPath.replace('.js', '')] = instance.getName()
      })
    }

    return availableJobs
  },

  fireJob (job) {
    if (job) {
      var CurrentJob = require('../../jobs/' + job.type + '.js')
      new CurrentJob(job).setOnStart(() => {
        job.lastExcecution = new Date()
        job.running = true
        Jobs.refreshLastExecuted(job)
      }).setOnTerminate(() => {
        job.running = false
      }).setOnError(() => {
        job.running = false
      }).run()
    }
  },

  attach (job) {
    if (job.active) {
      var fireFunction = (fireDate) => {
        console.log('Chamado o Job: ' + job.description + ' em ' + fireDate)
        this.fireJob(this.get(job.id))
      }

      var scheduleObject = schedule.scheduleJob(buildRecurrenceRule(job), fireFunction)

      job.schedule = scheduleObject

      if (scheduleObject) {
        console.log('[Job] Atachou: ' + job.description)
      } else {
        console.log('[Job] Não Atachou: ' + job.description)
      }
    }

    global.jobsPoll.push(job)
  },

  deattach (id) {
    var job = this.get(id)

    if (job) {
      if (job.schedule) {
        console.log('Desatachou: ' + job.description)
        job.schedule.cancel()
      }

      global.jobsPoll.splice(global.jobsPoll.findIndex((job) => {
        return job.id === id
      }), 1)
    }
  },

  initialize (callback) {
    Jobs.findAll((_error, jobs) => {
      jobs.forEach((each) => {
        this.attach(each.toObject())
      })

      if (callback) {
        callback(global.jobsPoll)
      }
    })
  }

}

function buildRecurrenceRule (job) {
  var rule = new schedule.RecurrenceRule()

  if (job.rule.dayOfWeek.length) {
    rule.dayOfWeek = job.rule.dayOfWeek
  }

  if (job.rule.date) {
    rule.date = job.rule.date || null
  }

  rule.hour = job.rule.hour
  rule.minute = job.rule.minute
  rule.second = 0

  return rule
}
