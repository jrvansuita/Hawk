class UserSelector{

  constructor(element){
    this.element = element;
  }

  setOnSelect(callback){
    this.callback = callback;
  }

  load(callback){
    $.ajax({
      url: '/profiles',
      type: "get",
      success: (response) =>{
        this.handle(response);
        this.build();

        if (callback){
          callback();
        }
      },
      error: (error, message, errorThrown) =>{
        console.log(error);
      }
    });
  }

  findUserByName(name){
    var arr = Object.keys(this.users);

    for(var i = 0; i < arr.length; i++){
      var user = this.users[arr[i]];

      if (user.name.trim() == name.trim()){
        return user;
      }
    }
  }

  findUserByAccess(access){
    var arr = Object.keys(this.users);

    for(var i = 0; i < arr.length; i++){
      var user = this.users[arr[i]];

      if (user.access.trim() == access.trim()){
        return user;
      }
    }
  }

  hasSelectedUser(){
    return this.element.val() ? true : false;
  }

  getSelectedUser(){
    if (this.hasSelectedUser()){
      return this.findUserByName(this.element.val());
    }
  }

  handle(users){
    this.users = users;

    this.selectorOptions = [];

    Object.keys(users).forEach((key)=>{
      if (users[key].avatar)
      this.selectorOptions[users[key].name] = users[key].avatar;
    });
  }

  build(){
    this.element.autocomplete({
      data: this.selectorOptions,
      limit: 5,
      onAutocomplete: this.callback
    });
  }
}
