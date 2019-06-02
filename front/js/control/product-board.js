$(document).ready(()=>{
  $('.line-item.clickable, .box-item.clickable').click(function(){
    var attrValue = {};
    attrValue[$(this).data('attr')] = $(this).data('value').toString().replace(/\,/g, '|');

    _post('/product-list',{
      query:
      {attrs:
        attrValue
      }
    },()=>{
      window.location.href = '/product-list';
    });

  });
});
