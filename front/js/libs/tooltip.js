/* jshint esversion: 8 */

class Tooltip {
  constructor(data, initialText, createProps) {
    if (typeof data === 'string') {
      this.querySelector = data;
    } else {
      this.element = [data];
    }

    this.createProps = createProps;

    this.defProps = {
      content: initialText,
      distance: 5,
      hideOnClick: true,
      theme: 'material',
    };

    this.dependencies = new FileLoader().css('tooltip').js('popper.min').js('tippy-bundle.iife.min');
  }

  setInstancesProps(props) {
    this.instances.forEach(each => {
      each.setProps(props);
    });
  }

  setDefaults() {
    this.currentHideDelay = this.defProps.autoHideDelay;

    if (this.defProps) {
      this.setInstancesProps(this.defProps);
    }

    if (this.createProps) {
      this.setInstancesProps(this.createProps);
    }
  }

  returnDefault(make) {
    this.returnDefaultOnHide = make;
    return this;
  }

  hideDelay(delay) {
    if (!this.defProps.autoHideDelay) {
      this.defProps.autoHideDelay = delay;
    }

    this.currentHideDelay = delay;

    return this;
  }

  propsOnShow(listener) {
    this.propsOnShowListener = ref => {
      this.setProps(listener(ref));
    };
    return this;
  }

  autoHide(delay) {
    this.hideDelay(delay);

    var cardTooltipTimeout;

    this.defProps.onShow = el => {
      if (this.propsOnShowListener) {
        this.propsOnShowListener(el.reference);
      }

      cardTooltipTimeout = setTimeout(() => {
        this.hide();
      }, this.currentHideDelay);
    };

    this.defProps.onHidden = () => {
      clearTimeout(cardTooltipTimeout);
      if (this.runAutoHideIfNeed && this.returnDefaultOnHide) {
        this.setDefaults();
      }

      this.runAutoHideIfNeed = false;
    };

    return this;
  }

  setProps(data) {
    this.setInstancesProps(data);
    return this;
  }

  setContent(msg) {
    return this.setProps({ content: msg });
  }

  setTheme(theme) {
    return this.setProps({ theme: theme });
  }

  showError(msg) {
    this.setTheme('red').setContent(msg);
    this.show();
  }

  showSuccess(msg) {
    this.setTheme('green').setContent(msg);
    this.show();
  }

  showInfo(msg) {
    this.setTheme('blue').setContent(msg);
    this.show();
  }

  async load() {
    await this.dependencies.load().catch(e => {
      console.log(e);
    });
    this.instances = tippy(this.element ? this.element : document.querySelectorAll(this.querySelector));

    if (!this.instances.length) {
      this.instances = [this.instances];
    }

    this.setDefaults();

    return this.instances;
  }

  show() {
    this.runAutoHideIfNeed = true;

    this.instances[0].hide();
    this.instances[0].show();
  }

  hide() {
    this.instances[0].hide();
  }
}
