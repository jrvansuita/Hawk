class MenuController {
  constructor() {
    this.defaultMain = 'stock-menu';
    this.defaultSub = 'stock/product-board';

    this.mainMenuTag = 'main-menu';

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
      this.bindMenuItemClick({ menu: this.previewSubMenu, tag: mainMenuItem.attr('sub'), selMainItem: mainMenuItem });

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

  showPreviewSubMenuOptions(menuItem) {
    var subMenuName = menuItem.attr('sub');
    var hasSubMenu = !menuItem.hasClass('fixed-menu');

    if (!!subMenuName && hasSubMenu && this.selectedMain.attr('sub') !== subMenuName) {
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
      Local.set(tag, $(this).attr('sub') || $(this).find('a').attr('href'));
      if (selMainItem) selMainItem.trigger('click');
    });
  }

  markMenuItemAsSelected(tagName, menu, def) {
    var tagValue = Local.getStr(tagName) || def;

    const selected = menu == this.mainMenu ? menu.find('[sub="' + tagValue + '"]') : menu.find('a[href="' + tagValue + '"]').parent('li');
    selected.addClass('active-menu');
    return selected;
  }

  rewriteMainMenuItemsUrls() {
    this.mainMenu.find('.menu-item').each((i, each) => {
      var savedHref = Local.getStr($(each).attr('sub'));

      if (savedHref) {
        $(each).find('a').attr('href', savedHref);
      }
    });
  }

  bind() {
    this.selectedMain = this.markMenuItemAsSelected(this.mainMenuTag, this.mainMenu, this.defaultMain);
    this.selectedSub = this.markMenuItemAsSelected(this.selectedMain.attr('sub'), this.subMenu, this.defaultSub);

    this.bindMenuItemClick({ menu: this.mainMenu, tag: this.mainMenuTag });
    this.bindMenuItemClick({
      menu: this.subMenu,
      tag: this.selectedMain.attr('sub'),
      selMainItem: this.selectedMain,
    });

    this.bindMenuItemHover(this.mainMenu);
    this.rewriteMainMenuItemsUrls();
  }
}
