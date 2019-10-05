class Countdown{

  constructor(parent, secs){
    this.parent = parent;
    this.secs = secs;
  }

  /*
  Definir a valor de countdown também via css com

  .countdown-holder svg circle {
    animation: countdown 20s linear infinite forwards !important;
  }

  */

  setOnTerminate(callback){
    this.onTerminate = callback;
    return this;
  }

  render(){

    this.svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");

    var circle = document.createElementNS("http://www.w3.org/2000/svg", "circle");
    circle.setAttribute("cx", "20");
    circle.setAttribute("cy", "20");
    circle.setAttribute("r", "15");
    circle.setAttribute("id", "teste");

    this.svg.appendChild(circle);
    this.holder = $('<div>').addClass('countdown-holder');
    this.number = $('<div>').addClass('countdown-number');

    this.holder.append(this.number, this.svg);

    this.parent.append(this.holder);
  }

  remove(){
    clearInterval(this.intervalId);
    this.holder.remove();
  }

  show(callback){
    this.render();
    this.number.text(this.secs);

    this.intervalId = setInterval(()=>{
      this.secs = this.secs -1;

      if (this.secs == -1){
        this.remove();
        if (this.onTerminate){
          this.onTerminate();
        }
      }else{

        this.number.text(this.secs);
      }

    }, 1000);

  }

}
