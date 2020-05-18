class Broadcast{
  constructor(channel){
    this.channel = channel;
    this.socket = io.connect(window.location.origin);
  }

  setEmitData(data){
    this.data = data;
    return this;
  }

  emit(data){
    this.socket.emit(this.channel, data || this.data || true);
    return this;
  }

  onReceive(onReceiveListener){
    this.onReceiveListener = onReceiveListener;

    if (this.onReceiveListener){
      this.socket.on(this.channel, (data)=>{
        this.onReceiveListener(data);
      });
    }

    return this;
  }
}
