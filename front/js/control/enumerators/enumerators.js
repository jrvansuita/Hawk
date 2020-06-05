$(document).ready(()=>{
  $(".save").click(() => {
    saveClick();
  });

  $(".each-line").click(function (){
    goTo($(this).data('id'));
  });

  $('.add-new').click(() => {
    goTo(null);
  });

  openOptionsMenu();
  initializeEnumItems();
});


function openOptionsMenu(line, e){
  $(".icon-dots").each((index, each) => {
    Dropdown.on(each)
    .item('../img/duplicate.png', 'Duplicar', (helper) => {
      duplicateItem(helper.data.id);
    })
    .item('../img/delete.png', 'Excluir', (helper) => {
      deleteItem(helper.data.id);
    });
  });
}

function deleteItem(id){
  _post('/enumerators-delete',{id: id}, () => {
    var line = $(".each-line[data-id='"+id+"']");
    line.fadeOut(200, () => {
      line.remove();
      $('.add-new').trigger('click');
    })
  });
}


function duplicateItem(id){
  _post('/enumerators-duplicate',{id: id}, (data) => {
    goTo(data.id);
  });
}



function saveClick(){
  if (checkFields()){
    save();
  }
}



function checkFields(){
  return checkMaterialInput($('#name')) && checkMaterialInput($('#tag'));
}

function save() {
  var data = {
    id: selected.id,
    name: $('#name').val(),
    explanation: $('#explanation').val(),
    tag: $('#tag').val(),
    items: getCurrentItems()
  };

  _post('/enumerators', data, (id)=>{
    goTo(id);
  },(error, message)=>{
    console.log(error);
  });
}


function initializeEnumItems(){
  addItem(null, -1, true)

  if (selected?.items?.length){
    selected.items.reverse().forEach((item, index) => {
      addItem(item, index, false);
    });
  }
}

function addItem(item, index, isIncludingLine){
  var tds = [];
  tds.push(buildCol(item, 'icon'));
  tds.push(buildCol(item, 'description'));
  tds.push(buildCol(item, 'name'));
  tds.push(buildCol(item, 'value', buildButton(index, isIncludingLine)));
  var line = $('<tr>').append(tds).addClass(isIncludingLine ? 'including' : '');

  if (isIncludingLine){
    $('.enum-items').append(line);
  }else{
    $('.enum-items tr:nth-child(2)').after(line);
  }
}

function buildCol(item, key, button){
  var el = $('<input>').attr('value', item?.[key]).attr('data-key', key)
  .addClass('simple-material-input');

  return $('<td>').append($('<span>').addClass('item-span').append(el, button));
}

function buildButton(index, isIncludingLine){
  var button = $('<img>').attr('src', isIncludingLine ? '/img/checked.png' :'/img/delete.png').attr('data-index', index).addClass('line-button')

  if (isIncludingLine){
    button.click(() => {
      var line = button.closest('tr');
      addItem(getLineItem(line));
      clearValues(line);
    });
  }else{
    button.click(function (){
      button.closest('tr').fadeOut(200, function() {
        $(this).remove();
      });
    });
  }

  return button;
}

var itemKeys = ['icon', 'description', 'name', 'value'];


function getCurrentItems(){
  return $('.enum-items tr').not('.title, .including').toArray().reduce((arr, line) => {
    arr.push(getLineItem(line));
    return arr;
  },[]);
}

function getLineItem(line){
  return itemKeys.reduce((object, key) => {
    object[key] = getInput(line, key).val();
    return object;
  }, {});
}

function getInput(line, key){
  return $(line).find('input[data-key="' + key + '"]');
}

function clearValues(line){
  itemKeys.forEach((key) => {
    getInput(line, key).val('');
  });
}

function goTo(id){
  window.location= location.pathname + (id ? '?id=' + id : '');
}
