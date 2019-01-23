class Broadcast{
  constructor(channel){
    this.socket = io.connect('http://' + window.location.host);


    this.socket.on(channel, (data)=>{
      if (this.onReceiveListener){
        this.onReceiveListener(data);
      }
    });
  }


  onReceive(onReceiveListener){
    this.onReceiveListener = onReceiveListener;
    return this;
  }
}
