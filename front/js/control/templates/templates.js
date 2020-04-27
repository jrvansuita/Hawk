var editor;
var usagesSelector;
var tooltips;

$(document).ready(()=>{

  if (templateType == 'block'){
    dayUse();
  }


  if (templateType == 'email'){
    new Tooltip('.active-circle', 'Template em uso')
    .autoHide(10000).load().then((data) => {
      tooltips = data;
    });

    new ComboBox($('#template-usage'), usages)
    .setAutoShowOptions()
    .setDisabledCaption('Nenhum disponível')
    .setOnItemBuild((o, index)=>{
      return {text : o.val.name, img : 'img/' + o.val.icon + '.png'};
    })
    .load().then((binder) => {
      usagesSelector = binder;

      if (selected){
        usagesSelector.selectByFilter((each)=>{
          return each.data.key == selected.usage;
        });
      }
    });
  }



  new TemplateEditor()
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
    goToTemplate($(this).data('id'));
  });

  $(".icon-dots").click(function (e){
    openOptionsMenu(this, e);
  });

  $('.add-new').click(() => {
    goToTemplate(null);
  });
});



function saveClick(){
  if (checkFields()){
    save();
  }
}


function checkFields(){
  return checkMaterialInput($('#template-name'));
}


function getUsage(){
  return (usagesSelector && usagesSelector.getSelectedItem() && $('#template-usage').val()) ? usagesSelector.getSelectedItem().data.key : '';
}

function save() {
  var data = {
    id: selected.id,
    name: $('#template-name').val(),
    subject: $('#subject').val(),
    content:  editor.html.get(),
    usage: getUsage(),
    type: templateType
  };

  _post('template', data , (id)=>{
    goToTemplate(id);
  },(error, message)=>{
    console.log(error);
  });
}

function openOptionsMenu(line, e){
  var id = $(line).data('id');
  e.stopPropagation();
  new MaterialDropdown($(line), e, false, true)

  .addItem('../img/not-visible.png', 'Visualizar', function(){
    window.open('templates-viewer?id=' + id, '_blank');
  })
  .addItem('../img/duplicate.png', 'Duplicar', function(){
    duplicateTemplate(id);
  })
  .addItem('../img/delete.png', 'Excluir', function(){
    if (checkCanDelete(id)){
      deleteTemplate(id);
    }
  })
  .show();
}

function checkCanDelete(id){
  var el = $(".each-template-line[data-id='"+id+"']").find('.active-circle');

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
  _post('/template-delete',{id: id}, () => {
    var line = $(".each-template-line[data-id='"+id+"']");
    line.fadeOut(200, () => {
      line.remove();
    })
  });
}

function duplicateTemplate(id){
  _post('/template-duplicate',{id: id}, (data) => {
    goToTemplate(data.id);
  });
}


function goToTemplate(id){
  window.location= location.pathname + (id ? '?id=' + id : '');
}
function dayUse(){
  var atual = new Date();
  var past = new Date(selected.updated)
  var dife = Math.abs(atual.getTime() - past.getTime());
  var days = Math.ceil(dife / (1000 * 60 * 60 * 24));

  if( days < 30){
    var div = $('<div>').addClass('active-circle');

    $('.each-template-line').prepend(div);
  }
}
