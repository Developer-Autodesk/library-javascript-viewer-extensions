/////////////////////////////////////////////////////////////////
//
//
/////////////////////////////////////////////////////////////////
import PointTracker from 'PointTracker';
import EventsEmitter from 'EventsEmitter';

export default class GraphicMarker extends EventsEmitter {

  ///////////////////////////////////////////////////////////////////
  //
  //
  ///////////////////////////////////////////////////////////////////
  constructor(parent, size = {x: 32, y: 32}) {

    super();

    this._markerId = this.guid();

    var htmlMarker = `
      <div id="${this._markerId}"
      </div>
    `;

    $(parent).append(htmlMarker);

    $(`#${this._markerId}`).css({
      'pointer-events': 'none',
      'width': `${size.x}px`,
      'height': `${size.y}px`,
      'position': 'absolute',
      'overflow': 'visible',
      'display': 'none'
    });
  }

  ///////////////////////////////////////////////////////////////////
  //
  //
  ///////////////////////////////////////////////////////////////////
  setContent(html) {

    $(`#${this._markerId}`).append(html);
  }

  ///////////////////////////////////////////////////////////////////
  //
  //
  ///////////////////////////////////////////////////////////////////
  setSelectable(selectable) {

    var _this = this;

    function _click(e) {

      if(e.target.id == _this._markerId){

        _this.emit('_click', e);
      }
    }

    if(selectable){

      $(`#${this._markerId}`).css({
        'cursor': 'pointer',
        'pointer-events': 'auto'
      });

      $(`#${this._markerId}`).on(
        'click', _click);
    }
    else {

      $(`#${this._markerId}`).css({
        'cursor': 'auto',
        'pointer-events': 'none'
      });

      $(`#${this._markerId}`).off(
        'click', _click);
    }
  }

  ///////////////////////////////////////////////////////////////////
  //
  //
  ///////////////////////////////////////////////////////////////////
  activateLock3d(viewer) {

    this._tracker = new PointTracker(
      viewer, (screenPoint)=> {

        var $container = $(`#${this._markerId}`);

        $container.css({
          'left': screenPoint.x - $container.width()/2,
          'top': screenPoint.y -  $container.height()/2
        });
      });

    this._tracker.activate();
  }

  ///////////////////////////////////////////////////////////////////
  //
  //
  ///////////////////////////////////////////////////////////////////
  setPosition2d(position) {

    $(`#${this._markerId}`).css({
      'left': position.x,
      'top': position.y
    });
  }

  ///////////////////////////////////////////////////////////////////
  //
  //
  ///////////////////////////////////////////////////////////////////
  getPosition2d() {

    return {
      x: $(`#${this._markerId}`).left(),
      y: $(`#${this._markerId}`).top()
    };
  }

  ///////////////////////////////////////////////////////////////////
  //
  //
  ///////////////////////////////////////////////////////////////////
  setPosition3d(position) {

    if(this._tracker) {
      this._tracker.setWorldPoint(position);
    }
  }

  ///////////////////////////////////////////////////////////////////
  //
  //
  ///////////////////////////////////////////////////////////////////
  setVisible(show) {

    $(`#${this._markerId}`).css({
      display: (show ? 'block' : 'none')
    });
  }

  ///////////////////////////////////////////////////////////////////
  //
  //
  ///////////////////////////////////////////////////////////////////
  guid() {

    var d = new Date().getTime();

    var guid = 'xxxx-xxxx-xxxx-xxxx'.replace(
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
  remove() {

    $(`#${this._markerId}`).remove();
  }
}
