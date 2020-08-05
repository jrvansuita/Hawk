class MenuController {
  constructor() {
    this.mainMenu = $('.main-menu-nav');
    this.subMenu = $('.sub-menu-nav');
    this.previewSubMenu = null;
    this.subMenuTimeout = 0;
    this.isHoveringSeenSubMenu = false;

    this.selectedMain = null;
    this.selectedSub = null;
  }

  buildCurrentSubMenuOptions(subMenuName, mainMenuItem) {
    this.previewSubMenu = $('<div>').load('/sub-menu?sub=' + subMenuName, () => {
      this.bindMenuItemClick({ menu: this.previewSubMenu, tag: this.getSubMenuTag(mainMenuItem), selMainItem: mainMenuItem });

      this.previewSubMenu.hover(
        () => {
          this.isHoveringSeenSubMenu = true;
        },
        () => {
          this.isHoveringSeenSubMenu = false;
          this.destroySubMenuOptions();
        }
      );
    });
  }

  getMainMenuTag() {
    return 'main-menu-nav';
  }

  getSubMenuTag(mainMenuItemSelected) {
    return 'sub' + mainMenuItemSelected.find('a').attr('href').split('/').join('-');
  }

  showPreviewSubMenuOptions(menuItem) {
    var subMenuName = menuItem.attr('sub');

    if (!!subMenuName && this.selectedMain.attr('sub') !== subMenuName) {
      this.destroySubMenuOptions();
      this.buildCurrentSubMenuOptions(subMenuName, menuItem);

      $('body').append(this.previewSubMenu);
    } else {
      this.destroySubMenuOptions();
    }
  }

  destroySubMenuOptions() {
    if (this.previewSubMenu) {
      this.previewSubMenu.remove();
    }
  }

  destroySubMenuOptionsWithDelay(delay) {
    this.subMenuTimeout = setTimeout(() => {
      if (!this.isHoveringSeenSubMenu) {
        this.destroySubMenuOptions();
      }
    }, delay);
  }

  bindMenuItemHover(menu) {
    menu.find('.menu-item').hover(this.onMenuItemHoverEnter(), this.onMenuItemHoverLeave());
  }

  onMenuItemHoverEnter() {
    var self = this;
    return function () {
      clearTimeout(self.subMenuTimeout);

      self.showPreviewSubMenuOptions($(this));
    };
  }

  onMenuItemHoverLeave() {
    var self = this;
    return function () {
      self.destroySubMenuOptionsWithDelay(1000);
    };
  }

  bindMenuItemClick({ menu, tag, selMainItem }) {
    menu.find('.menu-item').click(function () {
      console.log(tag + ': ' + $(this).find('a').attr('href'));
      Local.set(tag, $(this).find('a').attr('href'));
      if (selMainItem) selMainItem.trigger('click');
    });
  }

  markMenuItemAsSelected(getTag, menu) {
    var hrefPath = Local.getStr(getTag());

    let selected = menu.find('a[href*="' + hrefPath + '"]').parent('li');
    selected.addClass('active-menu');
    return selected;
  }

  bind() {
    this.selectedMain = this.markMenuItemAsSelected(this.getMainMenuTag.bind(this), this.mainMenu);
    this.selectedSub = this.markMenuItemAsSelected(() => {
      return this.getSubMenuTag(this.selectedMain);
    }, this.subMenu);

    this.bindMenuItemClick({ menu: this.mainMenu, tag: this.getMainMenuTag() });
    this.bindMenuItemClick({
      menu: this.subMenu,
      tag: this.getSubMenuTag(this.selectedMain),
      selMainItem: this.selectedMain,
    });

    this.bindMenuItemHover(this.mainMenu);
  }
}
