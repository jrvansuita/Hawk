
class BlockedPost{

  constructor(saleNumber, reason){
    this.saleNumber = saleNumber;
    this.reason = reason;
  }

  onError(callback){
    this.errorListener = callback;
  }

  call(){
    $.ajax({
      url: "/picking/toggle-block-sale",
      type: "post",
      data: {
        saleNumber: this.saleNumber,
        reason : this.reason
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
