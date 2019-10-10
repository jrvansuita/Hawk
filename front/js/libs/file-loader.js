/*------ Excluir --------*/
function loadCssFile(link) {
  $('<link>')
  .appendTo('head')
  .attr({
    type: 'text/css',
    rel: 'stylesheet',
    href: link
  });
}

function loadJsFile(link, callback) {
  $.getScript(link, callback);
}

/*------ Excluir --------*/

class FileLoader{

  constructor(){
    this.path = '/front/?/libs/';
    this.cssList = [];
    this.jsList = [];
  }

  _buildPaths(arr, type){
    var getPath = (each)=>{return this.path.replace('?', type) + each + '.' + type};
    return arr.map(i=>{return getPath(i);});
  }

  bindJs(scripts) {

    var load = function(scripts, callback) {
      var progress = 0;
      var _getScript = function() {
        if (progress == scripts.length) { return callback(); }
        $.getScript(scripts[progress], function() {
          progress++;
          _getScript();
        });
      };

      _getScript();
    };


    return new Promise((resolve, reject)=>{
      load(scripts, ()=>{
        resolve();
      });
    });
  }

  css(name){
    this.cssList.push(name);
    return this;
  }

  js(name){
    this.jsList.push(name);
    return this;
  }

  load(){
    return this.bindFiles();
  }

  bindFiles(){
    this.cssList = this._buildPaths(this.cssList, 'css');
    this.jsList = this._buildPaths(this.jsList, 'js');

    this.cssList.forEach((each)=>{
      this.bindCss(each);
    });

    return this.bindJs(this.jsList);
  }

  bindCss(link){
    $('<link>').appendTo('head').attr({
      type: 'text/css',
      rel: 'stylesheet',
      href: link
    });
  }

}
