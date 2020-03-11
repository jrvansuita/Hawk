var editor;
var usagesSelector;
var tooltips;

$(document).ready(()=>{

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
    window.location= 'templates?id=' + $(this).data('id');
  });

  $(".icon-dots").click(function (e){
    openOptionsMenu(this, e);
  });

  $('.add-new').click(() => {
    window.location= 'templates';
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
    id: selected.id,
    name: $('#template-name').val(),
    subject: $('#subject').val(),
    content:  editor.html.get(),
    usage: (usagesSelector.getSelectedItem() && $('#template-usage').val()) ? usagesSelector.getSelectedItem().data.key : ''
  };

  _post('template', data , (id)=>{
    window.location= 'templates?id=' + id;
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
  _post('/template-delete',{id: id}, () => {
    var line = $(".each-template-line[data-id='"+id+"']");
    line.fadeOut(200, () => {
      line.remove();
    })
  });
}

function duplicateTemplate(id){
  _post('/template-duplicate',{id: id}, (data) => {
    window.location= 'templates?id=' + data.id;
  });
}
