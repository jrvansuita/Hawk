const Job = require('../bean/job.js')
const JobsPool = require('../jobs/controller/pool.js')

module.exports = class {
  static storeFromScreen (params, callback) {
    var attachedJob = null

    if (params.editingId) {
      attachedJob = JobsPool.get(parseInt(params.editingId))
    }

    var job = new Job(
      parseInt(params.editingId),
      params.tag,
      params.description,
      params.jobType,
      params.active !== undefined,
      buildRules(params),
      attachedJob ? attachedJob.lastExcecution : 0
    )

    job.upsert((_err, doc) => {
      JobsPool.deattach(doc.id)
      JobsPool.attach(doc)

      callback(doc ? doc.id : 0)
    })
  }

  static delete (id) {
    Job.findOne({ id: id }, (_err, item) => {
      item.remove()
    })
  }
}

function buildRules (params) {
  var addDayOfWeek = (day, index) => {
    if (params[day] !== undefined) {
      dayOfWeek.push(index)
    }
  }

  var dayOfWeek = []
  addDayOfWeek('sunday', 0)
  addDayOfWeek('monday', 1)
  addDayOfWeek('tuesday', 2)
  addDayOfWeek('wednesday', 3)
  addDayOfWeek('thursday', 4)
  addDayOfWeek('friday', 5)
  addDayOfWeek('saturday', 6)

  return {
    dayOfWeek: dayOfWeek,
    hour: params.time.split(':')[0],
    minute: params.time.split(':')[1]
  }
}
