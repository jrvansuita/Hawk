
class BlockedPost{

  constructor(blockNumber, reason){
    this.blockNumber = blockNumber;
    this.reason = reason;
    this.url = "/picking/toggle-block";
  }

  isPending(){
    this.url = "/picking/block-pending";
    return this;
  }

  setUserId(userId){
    this.userId = userId;
    return this;
  }


  onError(callback){
    this.errorListener = callback;
    return this;
  }

  onSuccess(callback){
    this.successListener = callback;
    return this;
  }

  call(){
    $.ajax({
      url: this.url,
      type: "post",
      data: {
        blockNumber: this.blockNumber,
        reasonTag : this.reason ? this.reason.tag : null,
        userId :this.userId
      },
      success: (response) => {
        if(this.successListener){
          this.successListener();
        }else{
          window.location.reload();
        }
      },
      error: (jqXHR, textStatus, errorThrown)=> {
        console.log(textStatus);
        this.errorListener();
      }
    });
  }

}
