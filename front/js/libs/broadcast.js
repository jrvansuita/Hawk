class Broadcast {
  constructor (channel) {
    this.channel = channel
    this.socket = io.connect(window.location.origin)
    this.setUseDefaltId(true)
  }

  setUseDefaltId (use) {
    this.useDefaultId = use
    return this
  }

  setEmitData (data) {
    this.data = data
    return this
  }

  setMessageId (id) {
    this.messageId = !id || this.useDefaultId ? Util.id() : id
    return this
  }

  emit (data, messageId) {
    this.setMessageId(messageId)
    this.setEmitData(data || true)
    this.socket.emit(this.channel, this.messageId, data)
    return this
  }

  onReceive (onReceiveListener) {
    this.onReceiveListener = onReceiveListener

    if (this.onReceiveListener) {
      this.socket.on(this.channel, (senderId, data) => {
        data = data || senderId

        if (this.messageId) {
          if (senderId == this.messageId) {
            this.onReceiveListener(data)
          }
        } else {
          this.onReceiveListener(data)
        }
      })
    }

    return this
  }
}
