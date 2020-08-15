/* jshint esversion: 8 */

class RangeDatePicker {
  constructor() {
    this.count = 0;
    this.dependencies = new FileLoader().js('date-picker').js('dropdown').css('dropdown').css('material-input');
  }

  holder(holder, bindOnClick) {
    this.holderEl = $(holder);

    if (bindOnClick) {
      this.holderEl.click(() => {
        this.fromPicker.open();
      });
    }

    return this;
  }

  setOnRangeChange(callback) {
    this.onRangeChange = callback;
    return this;
  }

  setTitles(beginTitle, endTitle) {
    this.beginTitle = beginTitle;
    this.endTitle = endTitle;
    return this;
  }

  menuOptions(showMenu = true) {
    this.menuOptions = showMenu;
    return this;
  }

  getDates() {
    return { from: new Date(this.from).getTime(), to: new Date(this.to).getTime() };
  }

  // setDates(from, to) {
  //   this.from = from ? new Date(from) : new Date();
  //   this.to = to ? new Date(to) : new Date();
  //   return this;
  // }

  setPos(leftPicker = -185, rightPicker = -50) {
    this.leftPickerPos = leftPicker;
    this.rightPickerPos = rightPicker;
    return this;
  }

  showInputs(showInputs = true) {
    this.showInputs = showInputs;
    return this;
  }

  showArrows(showArrows = true) {
    this.showArrows = showArrows;
    return this;
  }

  setDates(from, to) {
    this.from = from ? new Date(from) : new Date();
    this.to = to ? new Date(to) : new Date();

    // change interface
    if (this.dateInputBegin && this.dateInputEnd) {
      this.dateInputBegin.val(Dat.format(this.from));
      this.dateInputEnd.val(Dat.format(this.to));
      this.dateInputBegin.data('begin', this.from.getTime());
      this.dateInputEnd.data('end', this.to.getTime());
    }
    return this;
  }

  _build() {
    this.holderEl.addClass('date-picker');
    this.beginHolder = $('<div>').addClass('material-input-holder');
    this.endHolder = $('<div>').addClass('material-input-holder');

    this.dateInputBegin = $('<input>').attr('id', 'date-begin').attr(this._setOptionsForInput(this.beginTitle, this.from)).css('z-index', '9');
    this.dateInputEnd = $('<input>').attr('id', 'date-end').attr(this._setOptionsForInput(this.endTitle, this.to)).css('z-index', '9');

    this.span = $('<span>').addClass('bar');
    this.label = $('<label>');

    this.beginHolder.append(this.dateInputBegin, this.span, this.label.text(this.beginTitle));
    this.endHolder.append(this.dateInputEnd, $(this.span).clone(), $(this.label).clone().text(this.endTitle));

    this.holderEl.append(this.beginHolder, this.endHolder);

    if (!this.showInputs) {
      $(this.dateInputBegin).hide();
      $(this.dateInputEnd).hide();
      this.beginHolder.removeClass('material-input-holder');
      this.endHolder.removeClass('material-input-holder');
    }

    if (this.menuOptions) this._createMenuOptions();

    if (this.showArrows) this._arrowsDate();

    this.setDates(this.from, this.to);
  }

  _setOptionsForInput(title, dateValue) {
    var options = { required: 'required', title: title, maxlength: 8, value: Dat.format(new Date(dateValue)) || Dat.format(Dat.today()) };
    return options;
  }

  _arrowsDate() {
    var $leftArrow = $('<img>').addClass('date-arrow left-arrow').attr('src', '/img/left.png');
    var $rightArrow = $('<img>').addClass('date-arrow right-arrow').attr('src', '/img/right.png');

    $leftArrow.click(() => {
      this.setDates(Dat.rollDay(this.from, -1), Dat.rollDay(this.to, -1));
    });
    $rightArrow.click(() => {
      this.setDates(Dat.rollDay(this.from, 1), Dat.rollDay(this.to, 1));
    });

    this.holderEl.prepend($leftArrow).append($rightArrow);
  }

  setToday() {
    return this.setDates(Dat.today(), Dat.today());
  }

  setYesterday() {
    return this.setDates(Dat.yesterday(), Dat.yesterday());
  }

  setThisWeek() {
    return this.setDates(Dat.firstDayCurrentWeek(), Dat.lastDayCurrentWeek());
  }

  setLastWeek() {
    return this.setDates(Dat.firstDayLastWeek(), Dat.lastDayLastWeek());
  }

  setThisMonth() {
    return this.setDates(Dat.firstDayOfMonth(), Dat.lastDayOfMonth());
  }

  setLastMonth() {
    return this.setDates(Dat.firstDayOfLastMonth(), Dat.lastDayOfLastMonth());
  }

  _createMenuOptions() {
    this.dateMenu = $('<div>').addClass('date-menu-dots');

    Dropdown.on(this.dateMenu)
      .item(null, 'Hoje', () => {
        this.setToday();
      })
      .item(null, 'Ontem', () => {
        this.setYesterday();
      })
      .item(null, 'Essa Semana', () => {
        this.setThisWeek();
      })
      .item(null, 'Última Semana', () => {
        this.setLastWeek();
      })
      .item(null, 'Este Mês', () => {
        this.setThisMonth();
      })
      .item(null, 'Último Mês', () => {
        this.setLastMonth();
      });

    this.holderEl.append(this.dateMenu);
  }

  async load() {
    await this.dependencies.load();
    this._build();

    new DatePicker()
      .left(this.leftPickerPos)
      .showButtons(false)
      .holder(this.beginHolder, true)
      .setOnSelect((s, date) => {
        this.from = date;
      })
      .setOnOpen(() => {
        if ($('.gj-picker').last().css('display') === 'none') {
          this.toPicker.open();
        }
      })
      .load()
      .then((binder) => {
        this.fromPicker = binder;
        this.onFinishedLoadingEachDatePicker();
      });

    new DatePicker()
      .left(this.rightPickerPos)
      .holder(this.endHolder, true)
      .setOnChange((s, date) => {
        this.to = date;
        if (this.onRangeChange) {
          this.onRangeChange(this.from, this.to);
        }
        this.setDates(this.from, this.to);
      })
      .setOnOpen(() => {
        if ($('.gj-picker').first().css('display') === 'none') {
          this.fromPicker.open();
        }
      })
      .setOnClose(() => {
        this.fromPicker.close();
      })
      .load()
      .then((binder) => {
        this.toPicker = binder;
        this.onFinishedLoadingEachDatePicker();
      });

    return this;
  }

  onFinishedLoadingEachDatePicker() {}
}
