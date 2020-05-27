/*jshint esversion: 8 */

class TemplateEditor{

  constructor(){
    this.dependencies = new FileLoader().css('template-editor')
    .css('froala-editor.min').js('froala-editor.min');

    this.buttons = {};
    this.customButtons = [];

    this.showTextButtons(true);
    this.showParagraphButtons(true);
    this.showRichButtons(true);
    this.showMiscButtons(true);
  }

  useImageUploader(){
    this.activeImageUpload = true;
    return this;
  }

  useCharCounter(use){
    this._useCharCounter = use;
    return this;
  }

  useQuickInsert(use){
    this._useQuickInsert = use;
    return this;
  }

  useUnicodeEmoticons(use){
    this._useUnicodeEmoticons = use;
    return this;
  }

  toggleButtonGroup(show, groupName, buttons, props){
    if (show){
      this.buttons[groupName] = {
        'buttons': [].concat(buttons),
        ...props
      }
    }else{
      delete this.buttons[groupName];
    }

    return this;
  }

  showTextButtons(show){
    var all = ['bold', 'italic', 'underline', 'strikeThrough', 'subscript', 'superscript', 'fontFamily', 'fontSize', 'textColor', 'backgroundColor', 'inlineClass', 'inlineStyle', 'clearFormatting'];
    return this.toggleButtonGroup(show, 'moreText', all);
  }

  showParagraphButtons(show){
    var all = ['alignLeft', 'alignCenter', 'formatOLSimple', 'alignRight', 'alignJustify', 'formatOL', 'formatUL', 'paragraphFormat', 'paragraphStyle', 'lineHeight', 'outdent', 'indent', 'quote'];
    return this.toggleButtonGroup(show, 'moreParagraph', all);
  }

  showRichButtons(show){
    var all = ['insertLink', 'insertImage', 'insertVideo', 'insertTable', 'emoticons', 'fontAwesome', 'specialCharacters', 'embedly', 'insertFile', 'insertHR'];
    return this.toggleButtonGroup(show, 'moreRich', all);
  }


  showMiscButtons(show){
    var all = ['undo', 'redo', 'fullscreen', 'print', 'getPDF', 'spellChecker', 'selectAll', 'html', 'help'];
    return this.toggleButtonGroup(show, 'moreMisc', all, {'align': 'right', 'buttonsVisible': 2});
  }

  getAllButtons(){

    this.showTextButtons();
    this.showParagraphButtons();
    this.showRichButtons();
    this.showRichButtons();

    return this.buttons;
  }

  addMiscCustomButton(icon, name, title, callback){
    this.customButtons.push({icon: icon, name: name, title: title, click: callback});
    return this;
  }

  getCustomButtons(){
    this.customButtons.forEach((eachButton) => {
      FroalaEditor.DefineIcon(eachButton.name, {NAME: 'teste', SVG_KEY: eachButton.icon});
      FroalaEditor.RegisterCommand(eachButton.name, {
        title: eachButton.title,
        focus: false,
        undo: true,
        refreshAfterCallback: true,
        callback: function () {
          if (eachButton.click)
          eachButton.click(this);

          this.events.focus();
        }
      });
    });

    return this.customButtons.map((e) => {
      return e.name;
    });
  }

  getImageUploadOptions(){
    if (this.activeImageUpload){
      return {
        imageUploadParam: 'file',
        imageUploadURL: '/template-img-uploader',
        imageUploadMethod: 'POST',
        imageMaxSize: 5 * 1024 * 1024,
        imageAllowedTypes: ['jpeg', 'jpg', 'png'],
        events: {
          'image.uploaded': function (response) {
            console.log('image.uploaded');
            console.log(response);
          },
          'image.inserted': function ($img, response) {
            console.log('image.inserted');
            console.log(response);
          },
          'image.replaced': function ($img, response) {
            console.log('image.replaced');
            console.log(response);
          },
          'image.error': function (error, response) {
            console.log(error);
          }
        }
      };
    }else{
      return {};
    }
  }


  getDefultOptions(){

    var options = {
      fullPage: false,
      useClasses: false,
      height: "auto",
      charCounterCount: this._useCharCounter,
      toolbarButtons: this.buttons,
      iframe: false,
      listAdvancedTypes: true,

      // Define new inline styles.
      inlineClasses: {
        'fr-class-code': 'Code',
        'fr-class-variable': 'Variável',
        'fr-class-highlighted': 'Highlighted',
        'fr-class-transparency': 'Transparent'
      },

      tableStyles: {
        "fr-dashed-borders":"Dashed Borders",
        "fr-alternate-rows":"Alternate Rows",
        "fr-rounded-borders": "Rounded Borders",
        "fr-no-border" : "No Borders"
      }
    };

    if (!this._useQuickInsert){
      options.quickInsertTags = [];
    }

    if (!this._useUnicodeEmoticons){
      options.emoticonsUseImage = false;
    }

    if (this.customButtons.length){
      this.buttons.moreMisc.buttons = this.buttons.moreMisc.buttons.concat(this.getCustomButtons());
    }

    options = {...options,   ...this.getImageUploadOptions()}

    return options;
  }

  async load(selector){
    await this.dependencies.load();
    return new Promise((resolve, reject) => {
      this.editor = new FroalaEditor(selector,  this.getDefultOptions(), () => {
        resolve(this.editor);
      });
    });

  }

  hide(){

  }
}
