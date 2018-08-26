module.exports = class Indicators {

  constructor() {
    this.groups = [];
  }

  addGroup(label) {
    var group = new Group(label);
    this.groups.push(group);
    return group;
  }

  getGroups() {
    return this.groups;
  }

};


class Group{

  constructor(label) {
    this.label = label;
    this.items = [];
  }

  addItem(label, value, color, tag){
    var item = new Indicator(this, label, value, color, tag);
    this.items.push(item);
    return item;
  }

  getItems(){
    return this.items;
  }

}

class Indicator {
  constructor(parent, label, value, color, tag) {
    this.parent = parent;
    this.label = label;
    this.value = value;
    this.color = color;
    this.tag = tag; //Not used Yet
  }

}
