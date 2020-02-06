var editor;
var typeSelector;
var tooltips;

$(document).ready(()=>{

  new Tooltip('.active-circle', 'Template em uso')
  .autoHide(10000).load().then((data) => {
    tooltips = data;
  });

  new ComboBox($('#template-type'), types)
  .setAutoShowOptions()
  .setDisabledCaption('Nenhum disponível')
  .setOnItemBuild((type, index)=>{
    console.log(type);
    return {text : type.val.name, img : 'img/' + type.val.icon + '.png'};
  })
  .load().then((binder) => {
    typeSelector = binder;

    if (selected){
      typeSelector.selectByFilter((each)=>{
        return each.data.key == selected.type;
      });
    }
  });



  new TemplateEditor(heightForEditor)
  .useImageUploader()
  .load('#editor').then((_editor) => {
    editor = _editor;

    if (selected){
      editor.html.set(selected.content);
    }
  });


  $(".save").click(() => {
    saveClick();
  });


  $(".each-template-line").click(function (){
    window.location= 'email-templates?_id=' + $(this).data('id');
  });

  $(".icon-dots").click(function (e){
    openOptionsMenu(this, e);
  });


  $('.add-new').click(() => {
    window.location= 'email-templates';
  });


});





function saveClick(){
  if (checkFields()){
    save();
  }
}


function checkFields(){
  var c = checkMaterialInput($('#template-name'));
  c = checkMaterialInput($('#subject')) & c;

  return c;
}


function save() {
  var data = {
    _id: selected._id,
    name: $('#template-name').val(),
    subject: $('#subject').val(),
    content:  editor.html.get(),
    type: (typeSelector.getSelectedItem() && $('#template-type').val()) ? typeSelector.getSelectedItem().data.key : ''
  };

  _post('email-template', data , (id)=>{
    window.location= 'email-templates?_id=' + id;
  },(error, message)=>{
    console.log(error);
  });
}

function openOptionsMenu(line, e){
  var id = $(line).data('id');
  e.stopPropagation();
  new MaterialDropdown($(line))
  .addItem('../img/delete.png', 'Excluir', function(){
    if (checkCanDelete(id)){
      deleteTemplate(id);
    }
  }).show();
}

function checkCanDelete(id){
  var el = $(".each-template-line[data-id='"+id+"']").find('.using-template-circle');

  if (el.length){
    var tooltip = tooltips.find((e) => {
      return e.reference == el[0];
    })

    tooltip.show();

    return false;
  }

  return true;
}

function deleteTemplate(id){
  _post('/email-template-delete',{_id: id}, () => {
    var line = $(".each-template-line[data-id='"+id+"']");
    line.fadeOut(200, () => {
      line.remove();
    })
  });
}
