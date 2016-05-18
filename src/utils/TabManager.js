/////////////////////////////////////////////////////////////
// TabManager
// By Philippe Leefsma, April 2016
//
/////////////////////////////////////////////////////////////
import EventsEmitter from 'EventsEmitter'

export default class TabManager extends EventsEmitter {

  ///////////////////////////////////////////////////////////////////
  //
  //
  ///////////////////////////////////////////////////////////////////
  constructor(container) {

    super();

    this.class = this.guid();
    this.containerId = this.guid();
    this.tabsHeaderId = this.guid();

    var html = `
      <div id="${this.containerId}" class="c${this.class} tabs">
        <ul id="${this.tabsHeaderId}">
        </ul>
      </div>
    `;

    $(container).append(html);
  }

  ///////////////////////////////////////////////////////////////////
  //
  //
  ///////////////////////////////////////////////////////////////////
  addTab(tabInfo) {

    var tabHeaderId = this.guid();

    var tabId = this.guid();

    var tabHtml = `

      <li>
        <a id="${tabHeaderId}" target="${tabId}" class="tab-link">${tabInfo.name}</a>
      </li>
    `;

    $('#' + this.tabsHeaderId).append(tabHtml);

    var containerHtml = `

      <div id="${tabId}">
        ${tabInfo.html}
      </div>
    `;

    $('#' + this.containerId).append(containerHtml);

    if(tabInfo.active)
      this.setActiveTab(tabId);

    $('#' + tabHeaderId).click((e)=>{

      var id = $(e.target).attr('target');

      this.setActiveTab(id);
    });

    return tabId;
  }

  ///////////////////////////////////////////////////////////////////
  //
  //
  ///////////////////////////////////////////////////////////////////
  setActiveTab(tabId){

    var _this = this;

    $(`.c${this.class} .tab-link`).each((idx, element)=>{

      var id = $(element).attr('target');

      if(id != tabId){

        $(element).removeClass('active');
        $('#' + id).css('display', 'none');

        _this.emit('tab.visible', {
          id: id,
          name: $(element).text()
        });
      }
      else{

        $(element).addClass('active');
        $('#' + id).css('display', 'block');
      }
    });
  }
}

var css = `

  .tabs{
    overflow:hidden;
    height: 100%;
    clear:both;
  }

  .tabs ul{
    list-style-type:none;
    bottom: -1px;
    position:relative;
  }

  .tabs li{
    float:left;
  }

  .tabs a.active{
    background-color: #fff;
    border-bottom:1px solid #fff;
  }

  .tabs div{
    clear: both;
    border:1px solid #CCC;
    padding:5px;
    font-family:verdana;
    font-size:13px;
    background-color: #E8E8E8;
    display:none;
    height: calc(100% - 42px);
    border-radius: 5px;
    overflow: hidden;
  }

  .tabs{
    overflow:hidden;
    clear:both;
  }

  .tabs ul{
    list-style-type:none;
    bottom: -1px;
    position:relative;
  }

  .tabs li{
    float:left;
  }

  .tabs a{
    cursor: pointer;
    display:block;
    padding:5px 10px;
    background-color: #ADADAD;
    color: #000;
    text-decoration: none;
    margin: 0 4px;
    border-top:1px solid #CCC;
    border-left:1px solid #DDD;
    border-right:1px solid #DDD;
    font:13px/18px verdana,arial,sans-serif;
    border-bottom:1px solid #EEE;
    border-top-left-radius: 5px;
    border-top-right-radius: 5px;
  }

  .tabs a.active{
    background-color: #E8E8E8;
    border-bottom:1px solid #E8E8E8;
  }
`;

$('<style type="text/css">' + css + '</style>').appendTo('head');