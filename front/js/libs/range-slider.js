class RangeSlider {
  constructor (holder) {
    this.dependencies = new FileLoader(holder[0].classList[0]).css('jquery-ui').js('jquery-ui.min').css('range-slider')
    this.holder = holder
  }

  setRange (min, max) {
    this.min = parseInt(min)
    this.max = parseInt(max)
    return this
  }

  setTitle (title) {
    this.title = $('<span>').addClass('range-title').text(title)
    return this
  }

  setOnSlide (onSlide) {
    this.onSlide = onSlide
    return this
  }

  setOnSlideStop (onStop) {
    this.setOnSlideStop = onStop
    return this
  }

  setPrefix (value) {
    this.prefix = value
    return this
  }

  loadValuesFromMemory (values) {
    this.fromMemory = values
    return this
  }

  _setValues (values) {
    this.minText.text((this.prefix || '') + values[0])
    this.maxText.text((this.prefix || '') + values[1])
    this.holder.attr('data-min', values[0])
    this.holder.attr('data-max', values[1])
  }

  _setOptions () {
    var values = this.fromMemory ? this.fromMemory : [this.min, this.max]

    var options = {
      range: true,
      min: this.min,
      max: this.max,
      values: values,
      slide: (event, ui) => {
        if (this.onSlide) this.onSlide(ui.values)
        this._setValues(ui.values)
      },
      stop: (event, ui) => {
        if (this.setOnSlideStop) this.setOnSlideStop(ui.values)
      },
      create: (event, ui) => {
        this._setValues(values)
      }
    }

    $(this.rangeDiv).slider(options)
  }

  _build () {
    this.minText = $('<span>').addClass('range-val min-value')
    this.maxText = $('<span>').addClass('range-val max-value')
    this.rangeDiv = $('<div>').addClass('range-slider')
    this.holder.addClass('range-slider-holder')

    this._setOptions()

    this.holder.append(this.title, this.rangeDiv, this.minText, this.maxText)
  }

  async build () {
    await this.dependencies.load()
    this._build()
  }
}
