class Pai {
  constructor() {

  }

  static getKey() {
    return "Not Defined";
  }

  teste() {
    console.log(this.constructor.getKey());
  }


}

class Filho extends Pai {
  constructor() {
    super();
  }

  static getKey() {
    return "Filho";
  }
}

//new Filho().teste();



function teste(val, def) {


  return ((val !== undefined) && (typeof(parseFloat(val)) === 'number')) ? val : (typeof(def) === 'number' ? def : 0);
}

console.log(teste(undefined));