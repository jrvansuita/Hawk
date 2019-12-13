

module.exports = class Job extends DataAccess {

  constructor(id, tag, description, type, active, rule, lastExcecution) {
    super();
    this.id = Num.def(id, 0) || Util.id();
    this.tag = Str.def(tag);
    this.description = Str.def(description);
    this.type = Str.def(type);
    this.active = active ? true: false;
    this.lastExcecution = lastExcecution || 0;
    this.running = false;
    this.rule = rule || {};
  }


  static getKey() {
    return ['id'];
  }


  static refreshLastExecuted(job) {
    Job.upsert({id: job.id}, {lastExcecution: new Date()});
  }

};
