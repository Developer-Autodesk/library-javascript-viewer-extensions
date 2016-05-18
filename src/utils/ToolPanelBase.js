/////////////////////////////////////////////////////////////////
//
//
/////////////////////////////////////////////////////////////////

const defaultOptions = {
  shadow: true,
  movable: true,
  closable: true
}

export default class ToolPanelBase extends
  Autodesk.Viewing.UI.DockingPanel {

  ///////////////////////////////////////////////////////////////////
  //
  //
  ///////////////////////////////////////////////////////////////////
  static guid(format = 'xxxxxxxxxx') {

    var d = new Date().getTime();

    var guid = format.replace(
      /[xy]/g,
      function (c) {
        var r = (d + Math.random() * 16) % 16 | 0;
        d = Math.floor(d / 16);
        return (c == 'x' ? r : (r & 0x7 | 0x8)).toString(16);
      });

    return guid;
  }

  ///////////////////////////////////////////////////////////////////
  //
  //
  ///////////////////////////////////////////////////////////////////
  constructor(container, title, options = {}) {

    super(container,
      ToolPanelBase.guid(),
      title,
      Object.assign(defaultOptions, options));

    this._dialogResult = 'CANCEL';

    this._events = {};

    this._isVisible = false;
    this._isMinimized = false;

    this._btnElement = options.buttonElement;
  }

  /////////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////////
  htmlContent(id) {

    return '<div>';
  }

  /////////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////////
  unload() {

    this.setVisible(false);

    $(this.container).remove();
  }

  /////////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////////
  isVisible() {

    return this._isVisible;
  }

  /////////////////////////////////////////////////////////////
  // setVisible override
  //
  /////////////////////////////////////////////////////////////
  setVisible(show = false) {

    if(show !== this._isVisible){

      if(typeof this._events !== 'undefined') {

        this.emit((show ? 'open' : 'close'), {
          result: this._dialogResult
        });
      }
    }

    this._isVisible = show;

    if(this._btnElement) {

      if(show)
        this._btnElement.classList.add('active');
      else
        this._btnElement.classList.remove('active');
    }

    super.setVisible(show);
  }

  /////////////////////////////////////////////////////////////
  // Toggles panel visibility
  //
  /////////////////////////////////////////////////////////////
  toggleVisibility () {

    this.setVisible(!this._isVisible);
  }

  /////////////////////////////////////////////////////////////
  // initialize override
  //
  /////////////////////////////////////////////////////////////
  initialize() {

    this.title = this.createTitleBar(
      this.titleLabel || this.container.id);

    this.container.appendChild(this.title);

    this.setTitle(
      this.titleLabel || this.container.id,
      this.options);

    if(this.options.movable) {
      this.initializeMoveHandlers(this.title);
    }

    if(this.options.closable){
      this.closer = this.createCloseButton();
      this.container.appendChild(this.closer);
    }

    var $content = $(this.htmlContent(
      this.container.id));

    this.content = $content[0];

    $(this.container).append($content);
  }

  /////////////////////////////////////////////////////////////
  // onTitleDoubleClick override
  //
  /////////////////////////////////////////////////////////////
  onTitleDoubleClick(event) {

    this._isMinimized = !this._isMinimized;

    if(this._isMinimized) {

      this._height = $(this.container).css('height');

      $(this.container).css({
        'height':'34px',
        'min-height':'34px'
      });
    }
    else {

      $(this.container).css({
        'height':this._height,
        'min-height':'100px'
      });
    }
  }

  ///////////////////////////////////////////////////////////////////
  //
  //
  ///////////////////////////////////////////////////////////////////
  on(event, fct) {

    this._events[event] = this._events[event]	|| [];
    this._events[event].push(fct);
    return fct;
  }

  ///////////////////////////////////////////////////////////////////
  //
  //
  ///////////////////////////////////////////////////////////////////
  off(event, fct) {

    if(event in this._events === false)
      return;

    this._events[event].splice(
      this._events[event].indexOf(fct), 1);
  }

  ///////////////////////////////////////////////////////////////////
  //
  //
  ///////////////////////////////////////////////////////////////////
  emit(event /* , args... */) {

    if(this._events[event] === undefined)
      return;

    var tmpArray = this._events[event].slice();

    for(var i = 0; i < tmpArray.length; ++i) {
      var result	= tmpArray[i].apply(this,
        Array.prototype.slice.call(arguments, 1));

      if(result !== undefined )
        return result;
    }

    return undefined;
  }
}