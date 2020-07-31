class InputDialog {
  constructor (title, placeholder) {
    this.dependencies = new FileLoader().css('material-selector-dialog')
    this.titleText = title
    this.inputPlaceholder = placeholder
    this.checkChangeBeforePositiveClick = false
    this.setFocusOnInputField = false

    this._initialize()
  }

  _initialize () {
    this.buttons = []
  }

  _build () {
    this.modal = $('<div>').addClass('ms-modal')
    this.holder = $('<div>').addClass('ms-holder')

    var $title = $('<label>').addClass('ms-title').text(this.titleText)

    var $inputHolder = $('<div>').addClass('material-input-holder')
    var $input = $('<input>').attr('type', 'text').attr('required', '').addClass('ms-input')
    this.input = $input

    this.input.change((e) => {
      if (this.onChangeListener) {
        this.onChangeListener(this.input, this.input.val())
      }
    }
    )

    var $subTitle

    if (this.subTitle) {
      $subTitle = $('<span>').addClass('info-value no-wrap sub-title').html(this.subTitle)
    }

    if (this.setFocusOnInputField) {
      this.input.attr('autofocus', '')
    }

    var $bar = $('<span>').addClass('bar')
    var $label = $('<label>').text(this.inputPlaceholder)

    $inputHolder.append($input, $bar, $label)

    this.holder.append($title, $subTitle, $inputHolder)
    this.modal.append(this.holder)

    this.buttonsHolder = $('<div>').addClass('ms-buttons-holder')
    this.holder.append(this.buttonsHolder)

    this.buttons.forEach((each) => {
      this.buttonsHolder.append(each)
    })
  }

  addSubTitle (html) {
    this.subTitle = html
    return this
  }

  onChangeListener (listener) {
    this.onChangeListener = listener
    return this
  }

  checkEmptyInputSubmit (check) {
    this.isCheckEmptyInputSubmit = check
    return this
  }

  // focus no input
  setAutoFocusOnInput (value) {
    this.setFocusOnInputField = value
    return this
  }

  checkBeforePositive () {
    if (this.isCheckEmptyInputSubmit) {
      if (this.input.val().trim().length == 0) {
        onInputError(this.input)
        return false
      }
    } else if (this.onChangeListener) {
      return this.onChangeListener(this.input, this.input.val())
    }

    return true
  }

  onNegativeButton (label, callback) {
    this.buttons.push($('<label>').addClass('ms-button material-ripple').text(label).click(() => {
      this.modal.remove()

      if (callback) {
        callback()
      }
    }))

    return this
  }

  onPositiveButton (label, callback) {
    this.buttons.push($('<label>').addClass('ms-button material-ripple').text(label).click(() => {
      if (this.checkBeforePositive()) {
        if (callback) {
          callback(this.input.val())
        }

        this.modal.remove()
      }
    }))

    return this
  }

  _show () {
    $('body').append(this.modal)
    this.modal.fadeIn(400)
  }

  async show (callback) {
    await this.dependencies.load()

    this._build()
    this._show()

    if (callback) {
      callback()
    }
  }
}
