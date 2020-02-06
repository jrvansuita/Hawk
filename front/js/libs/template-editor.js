/*jshint esversion: 8 */

class TemplateEditor{

  constructor(editorHeigth){
    this.dependencies = new FileLoader().css('template-editor')
    .css('froala-editor.min').js('froala-editor.min');

    this.height = editorHeigth;
  }

  useImageUploader(){
    this.activeImageUpload = true;
    return this;
  }


  getImageUploadOptions(){
    if (this.activeImageUpload){
      return {
        imageUploadParam: 'file',
        imageUploadURL: '/email-template-img-uploader',
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
      fullPage: true,
      useClasses: false,
      height: this.height,

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

    options = {...options,   ...this.getImageUploadOptions()}
    console.log(options);

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
