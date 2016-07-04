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

    super()

    this.tabsHeaderId = this.guid()
    this.containerId = this.guid()
    this.class = this.guid()
    this.nbTabs = 0

    var html = `
      <div id="${this.containerId}" class="c${this.class} tabs">
        <ul id="${this.tabsHeaderId}" class="headers">
        </ul>
      </div>
    `

    $(container).append(html)
  }

  ///////////////////////////////////////////////////////////////////
  //
  //
  ///////////////////////////////////////////////////////////////////
  addTab(tabInfo) {

    this.nbTabs ++

    var tabHeaderLinkId = this.guid();
    var tabHeaderId = this.guid();

    var tabId = this.guid();

    var tabHtml = `
      <li id="${tabHeaderId}" tabId="${tabId}">
        <a id="${tabHeaderLinkId}" tabId="${tabId}"
           class="tab-link">${tabInfo.name}
        </a>
      </li>
    `;

    $('#' + this.tabsHeaderId).append(tabHtml);

    var nbTabs = this.nbTabs

    $(`#${this.tabsHeaderId} > li`).each(function(idx){

      $(this).css({
        width: `calc(${100/nbTabs}% - ${nbTabs>1?'12px':'40px'})`,
        left: `calc(${idx * (100/nbTabs)}% - ${idx * 16}px`
      })
    })

    var containerHtml = `

      <div id="${tabId}">
        ${tabInfo.html}
      </div>
    `;

    $('#' + this.containerId).append(containerHtml);

    if(tabInfo.active)
      this.setActiveTab(tabId);

    $('#' + tabHeaderLinkId).click((e)=>{

      var id = $(e.target).attr('tabId');

      this.setActiveTab(id);
    });

    return tabId;
  }

  ///////////////////////////////////////////////////////////////////
  //
  //
  ///////////////////////////////////////////////////////////////////
  setActiveTab(tabId) {

    var _this = this;

    $(`.c${this.class} .tab-link`).each((idx, element)=>{

      var id = $(element).attr('tabId');

      if(id != tabId) {

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

  ///////////////////////////////////////////////////////////////////
  //
  //
  ///////////////////////////////////////////////////////////////////
  clear() {

    $(`#${this.tabsHeaderId} > li`).remove();
    $(`#${this.containerId} > div`).remove();

    this.nbTabs = 0
  }
}

var css = `

  .tabs {
    overflow:hidden;
    height: 100%;
    clear:both;
  }

  .tabs ul {
    list-style-type:none;
    bottom: -1px;
    position:relative;
  }

  .tabs a.active{
    background-color: #fff;
    border-bottom:1px solid #fff;
  }

  .tabs > div {
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
    position: relative;
    z-index: 1;
  }

  .tabs .headers {
    width:100%;
    margin-bottom: 30px;
    z-index: 0;
  }

  .tabs ul{
    list-style-type:none;
    bottom: -1px;
    position:relative;
  }

  .tabs li {
    position: absolute;
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
    color: #000;
    text-decoration: none;
  }
`;

$('<style type="text/css">' + css + '</style>').appendTo('head');