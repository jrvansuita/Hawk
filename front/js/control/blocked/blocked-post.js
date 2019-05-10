
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

  onError(callback){
    this.errorListener = callback;
    return this;
  }

  call(){
    $.ajax({
      url: this.url,
      type: "post",
      data: {
        blockNumber: this.blockNumber,
        reasonTag : this.reason ? this.reason.tag : null
      },
      success: function(response) {
        window.location.reload();
      },
      error: function(jqXHR, textStatus, errorThrown) {
        console.log(textStatus);
        this.errorListener();
        //onSimpleMaterialInputError( $('#blocked-rule-input'));
      }
    });
  }

}
