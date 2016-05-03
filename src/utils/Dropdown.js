/////////////////////////////////////////////////////////////
// Create dropwdown menu
//
/////////////////////////////////////////////////////////////
import EventsEmitter from 'EventsEmitter';

export default class Dropdown extends EventsEmitter {
  
  /////////////////////////////////////////////////////////////
  // opts = {
  //   container: viewer.container,
  //   title: 'Material',
  //   prompt: 'Select from list'
  //   pos: {
  //    top: 10,
  //    left: 10
  //   },
  //   selectedItemIdx: 2,
  //   menuItems: [
  //    {
  //      name: item1,
  //      handler: function(){}
  //    }
  //   ]
  // }
  //
  /////////////////////////////////////////////////////////////
  constructor(opts) {

    super();

    this.dropdownId = guid();

    this.buttonId = guid();

    this.labelId = guid();

    this.listId = guid();

    var html = `
      <div id="${this.dropdownId}" class="dropdown lmv-dropdown">
      <button id="${this.buttonId}" class="btn btn-default dropdown-toggle"
        type="button" 
        data-toggle="dropdown">
      <label id="${this.labelId}" class="label">${opts.title}</label>
      <span class="caret"></span>
      </button>
      <ul id="${this.listId}" class="dropdown-menu scrollable-menu">
      </ul>
      </div>
    `;

    $(opts.container).append(html);

    $('#' + this.dropdownId).css(opts.pos);


    var text = opts.prompt ||  opts.title + ': ' +
     opts.menuItems[opts.selectedItemIdx || 0].name;

    $('#' + this.labelId).text(text);

    opts.menuItems.forEach((menuItem)=> {

      var itemId = guid();

      var itemHtml = `
        <li id="${itemId}">
          <a href="">${menuItem.name}</a>
        </li>`;

      $('#' + this.listId).append(itemHtml);

      $('#' + itemId).click((event)=> {

        event.preventDefault();

        var eventResult = this.emit(
          'item.selected',
          menuItem);

        if(menuItem.handler)
          menuItem.handler();

        $('#' + this.labelId).text(
          opts.title + ': ' + menuItem.name);
      });
    });
  }
  
  /////////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////////
  setVisible(show) {
    
    $('#' + this.dropdownId).css({
      display: show ? 'block' : 'none'
    });
  }

  /////////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////////
  setPosition(pos) {

    $('#' + this.dropdownId).css(opts.pos);
  }

  /////////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////////
  open() {

    $('#' + this.dropdownId).addClass('open');
    $('#' + this.dropdownId).trigger('click.bs.dropdown');
  }
}

/////////////////////////////////////////////////////////////
//
//
/////////////////////////////////////////////////////////////
function guid(format='xxxx-xxxx-xxxx') {

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

/////////////////////////////////////////////////////////////
//
//
/////////////////////////////////////////////////////////////
var css = `

  .lmv-dropdown .btn {
     background-color: #3C3F40;
     height: 13px;
     line-height: 0;
     vertical-align: top;
  }

  .lmv-dropdown .label {
    font: normal 14px Times New Roman;
  }
  
  .scrollable-menu {
    height: auto;
    max-height: 250px;
    overflow-x: hidden;
    overflow-y: scroll;
  }

  .lmv-dropdown .caret{
    border-top:4px solid white;
  }
`;

$('<style type="text/css">' + css + '</style>').appendTo('head');