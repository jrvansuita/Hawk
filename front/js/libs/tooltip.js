/*jshint esversion: 8 */

class Tooltip{

  constructor(querySelector, initialText, createProps){
    this.querySelector = querySelector;
    this.createProps = createProps;

    this.defProps = {
      content: initialText,
      distance: 5,
      hideOnClick: true,
      theme: 'material'
    };

    this.dependencies = new FileLoader()
    .css('tooltip').js('popper.min').js('tippy-bundle.iife.min');
  }

  setDefaults(){
    this.currentHideDelay = this.defProps.autoHideDelay;

    if (this.defProps){
      this.instance.setProps(this.defProps);
    }

    if (this.createProps){
      this.instance.setProps(this.createProps);
    }
  }

  returnDefault(make){
    this.returnDefaultOnHide = make;
    return this;
  }

  hideDelay(delay){
    if (!this.defProps.autoHideDelay){
      this.defProps.autoHideDelay = delay;
    }

    this.currentHideDelay = delay;

    return this;
  }

  autoHide(delay){
    this.hideDelay(delay);

    var cardTooltipTimeout;

    this.defProps.onShow = () => {
      cardTooltipTimeout = setTimeout(() => {
        this.hide();
      }, this.currentHideDelay);
    };

    this.defProps.onHidden = () => {
      clearTimeout(cardTooltipTimeout);
      if (this.runAutoHideIfNeed && this.returnDefaultOnHide){
        this.setDefaults();
      }

      this.runAutoHideIfNeed = false;
    }

    return this;
  }

  setProps(data){
    this.instance.setProps(data);
    return this;
  }

  setContent(msg){
    this.instance.setContent(msg);
    return this;
  }

  setTheme(theme){
    return this.setProps({theme: theme});
  }

  showError(msg){
    this.setTheme('red').setContent(msg);
    this.show();
  }


  showSuccess(msg){
    this.setTheme('green').setContent(msg);
    this.show();
  }

  async load(){
    await this.dependencies.load();
    this.instance = tippy(document.querySelector(this.querySelector));
    this.setDefaults();
  }

  show(){
    this.runAutoHideIfNeed = true;

    this.instance.hide();
    this.instance.show();
  }

  hide(){
    this.instance.hide();
  }


}
