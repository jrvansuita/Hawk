
var users;

$(document).ready(()=>{

  _get('/profiles', null, (allUsers)=>{
    users = allUsers;
    loadUsersAutoComplete($('#user-search'), allUsers);

    onInit();
  });

});


function onInit(){

  var panel = $('.main-panel');
  var list = $('.histories-list');

  panel.unbind('scroll').bind('scroll', function() {
    if (!stop){
      if ((panel.scrollTop() + panel.height()) + 100 >= list.height()) {
        nextPage();
      }
    }
  });


  search();

  $('.search-button').click(()=>{
    search();
  });


  $('.delete-button').click(()=>{
    _post('/history-delete',{ query: getQuery()});
  });

  $('.search-input').keypress(function(e){
    if(e.which == 13){
      $('.search-button').trigger('click');
    }
  });
}

function initSearch(){
  currentPage = 0;
  stop = false;

  $('.histories-list').empty();
}

function search(){
  initSearch();
  nextPage();
}

function getQuery(){
  var query = {};
  query.title = $('#title-search').val();
  query.message = $('#message-search').val();
  query.tag = $('#tag-search').val();

  if ($('#user-search').val()){
    var user = Util.findUserInListByName($('#user-search').val(), users);
    if (user){
      query.userId = user.id;
    }
  }

  return query;
}

var currentPage;
var stop;

function nextPage(){
  var query  = getQuery();
  currentPage++;
  stop = true;

  _get("/history-page",{
    page: currentPage,
    query: query
  }, (response)=>{
    console.log(query);
    stop = response.length == 0;

    if (currentPage == 1 && stop){
      showEmptyList();
    }else{
      loadHistoriesItems(response);
    }
  },(error)=>{
    console.log(error);
  });
}

function loadHistoriesItems(items){
  var list = $('.histories-list');

  items.forEach((item, index)=>{
    list.append(getLine(item));
  });
}

function getLine(item){
  var $holder = $('<div>').addClass('history-item');
  $holder.append(getAvatar(item), getMainItem(item));

  return $holder;
}

function getMainItem(item){
  var $holder = $('<div>').addClass('history-main-item');
  $holder.append(getTitle(item), getMessage(item));

  return $holder;
}

function getAvatar(item){
  item.user.name = item.user.id != 404 ? item.user.name.split(" ")[0] : "Sistema";

  var $typeIcon = $('<img>').addClass('history-icon circle shadow')
  .attr('src','img/' + Util.historyIcon(item.type) + '.png');

  var $avatarImg = $('<img>').addClass('circle shadow avatar-img')
  .attr('title', item.user.name)
  .attr('data-src',item.user.avatar)
  .attr('src', item.user.id == 404 ? "img/system.png" : item.user.avatar)
  .attr('data-userId', item.user.id);


  var $avatarName = $('<span>').addClass('label shadow avatar-name').text(item.user.name);

  var $holder = $('<div>').addClass('avatar-holder');
  $holder.append($typeIcon, $avatarImg, $avatarName);

  return $holder;
}

function getTitle(item){
  var $date = $('<label>').addClass('history-date').text(Dat.formatwTime(new Date(item.date)));
  var $tag = $('<label>').addClass('history-tag').css('background-color', Util.historyTagColor(item.tag)).text(item.tag);

  var $superiorLine = $('<div>').addClass('title-line');
  $superiorLine.append($date, $tag);

  var $title = $('<label>').addClass('history-title').text(item.title);

  var $infoHolder = $('<div>').addClass('history-info');
  $infoHolder.append($superiorLine, $title);

  return $infoHolder;
}


function getMessage(item){
  var $title = $('<label>').addClass('history-message').text(item.message);

  var $holder = $('<div>').addClass('history-message-holder');
  $holder.append($title);

  return $holder;
}


function showEmptyList(){
  $('.histories-list').append($('<label>').addClass('hint').text('Nenhum histórico encontrado.'));
}
