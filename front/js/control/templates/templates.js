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
    type: (typeSelector.getSelectedItem() && $('#template-type').val()) ? typeSelector.getSelectedItem().data.key : ''
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
    window.location= 'templates?id=' + data.id;
  });
}
