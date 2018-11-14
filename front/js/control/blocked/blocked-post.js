
class BlockedPost{

  constructor(blockNumber, reason){
    this.blockNumber = blockNumber;
    this.reason = reason;
  }

  onError(callback){
    this.errorListener = callback;
  }

  call(){
    $.ajax({
      url: "/picking/toggle-block",
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
