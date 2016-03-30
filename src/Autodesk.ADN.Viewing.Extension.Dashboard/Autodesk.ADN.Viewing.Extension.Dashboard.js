/////////////////////////////////////////////////////////////////////
// Autodesk.ADN.Viewing.Extension.Dashboard
// by Philippe Leefsma, May 2015
//
/////////////////////////////////////////////////////////////////////
AutodeskNamespace("Autodesk.ADN.Viewing.Extension");

Autodesk.ADN.Viewing.Extension.Dashboard = function (viewer, options) {

  Autodesk.Viewing.Extension.call(this, viewer, options);

  var _panel = null;

  /////////////////////////////////////////////////////////////////
  // Extension load callback
  //
  /////////////////////////////////////////////////////////////////
  this.load = function () {

    var baseUrl = 'uploads/extensions/Autodesk.ADN.Viewing.Extension.Dashboard';

    var dependencies = [
      baseUrl + "/d3.min.js",
      baseUrl + "/d3pie.min.js",
      baseUrl + "/onoff-switch.js"
    ];

    require(dependencies, function() {

      _panel = new Panel(
        viewer.container,
        guid());

      _panel.setVisible(true);

      //viewer.toolbar.setVisible(false);
    });

    console.log('Autodesk.ADN.Viewing.Extension.Dashboard loaded');

    return true;
  }

  /////////////////////////////////////////////////////////////////
  //  Extension unload callback
  //
  /////////////////////////////////////////////////////////////////
  this.unload = function () {

    _panel.setVisible(false);

    console.log('Autodesk.ADN.Viewing.Extension.Dashboard unloaded');

    return true;
  }

  /////////////////////////////////////////////////////////////////
  // Generates random guid to use as DOM id
  //
  /////////////////////////////////////////////////////////////////
  function guid() {

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

  /////////////////////////////////////////////////////////////////
  // The demo Panel
  //
  /////////////////////////////////////////////////////////////////
  var Panel = function(
    parentContainer, id) {

    var _thisPanel = this;

    _thisPanel.content = document.createElement('div');

    Autodesk.Viewing.UI.DockingPanel.call(
      this,
      parentContainer,
      id,
      'Dashboard',
      {shadow:true});

    $(_thisPanel.container).addClass('dashboard');

    /////////////////////////////////////////////////////////////
    // Custom html
    //
    /////////////////////////////////////////////////////////////
    var html = `

      <div class="tabs">
        <ul>
          <li>
            <a target="map-tab" class="tab-link active">Map Layers</a>
          </li>
          <li>
            <a target="pie-tab" class="tab-link">Pie</a>
          </li>
          <li>
            <a target="donut-tab" class="tab-link">Donut</a>
          </li>
          <li>
            <a target="bars-tab" class="tab-link">Bars</a>
          </li>
        </ul>

        <div id="map-tab" class="active" style="display:block;">
        </div>

        <div id="pie-tab">
        </div>

        <div id="donut-tab">
        </div>

        <div id="bars-tab">
        </div>

      </div>
    `;

    $(_thisPanel.container).append(html);

    /////////////////////////////////////////////////////////////
    // Initialize tab switching
    //
    /////////////////////////////////////////////////////////////
    $('.tab-link').click((e)=>{

      var targetDivId = $(e.target).attr('target');

      $('.tab-link').each((idx, element)=>{

        var tabDivId = $(element).attr('target');

        if(tabDivId != targetDivId){

          $(element).removeClass('active');
          $('#' + tabDivId).css('display', 'none');
        }
        else{

          $(element).addClass('active');
          $('#' + tabDivId).css('display', 'block');
        }
      });
    });

    /////////////////////////////////////////////////////////////
    // Initialize combo
    //
    /////////////////////////////////////////////////////////////
    getAllLeafComponents(function (components) {

      getAvailableProperties(components, function (properties) {

        var menuItems = properties.map((propName)=>{
          return{
            label: propName,
            handler: ()=>{

              $('.d3').remove();

              $('#map-tab').append(
                '<p class="d3 d3-map"></p>');

              $('#pie-tab').append(
                '<p class="d3 d3-pie"></p>');

              $('#donut-tab').append(
                '<p class="d3 d3-donut"></p>');

              $('#bars-tab').append(
                '<p class="d3 d3-bars"></p>');

              mapComponentsByPropName(propName, components, (map)=> {

                var groupedMap = groupMap(map, 'Other', 1.5);

                var data = [];

                for(var key in groupedMap) {
                  data.push({
                    label: key,
                    dbIds: groupedMap[key],
                    value: groupedMap[key].length
                  });
                }

                _thisPanel.loadMapLayers('.d3-map', data);
                _thisPanel.loadPieChart('.d3-pie', data);
                _thisPanel.loadBarChart('.d3-bars', data);
                _thisPanel.loadDonutChart('.d3-donut', data);
              });
            }
          }
        });

        _thisPanel.comboId = createDropdownMenu(
          _thisPanel.container,
          'Select Property',
          {top: 40, left: 4},
          menuItems, 0);
      });
    });

    /////////////////////////////////////////////////////////////
    // group map for small values
    //
    /////////////////////////////////////////////////////////////
    function groupMap(map, groupName, maxPercent){

      var stats = _.transform(map,  function(result, value) {

        result['total'] =  (result['total'] || 0) + value.length;
      });

      return _.transform(map,

        function(result, value, key) {

          if(value.length * 100 / stats['total'] < maxPercent){

            result[groupName] = (result[groupName] || []).concat(
              value);
          }
          else{

            result[key] = value;
          }
        });
    }

    /////////////////////////////////////////////////////////////
    // setVisible override (not used in that sample)
    //
    /////////////////////////////////////////////////////////////
    _thisPanel.setVisible = function(show) {

      Autodesk.Viewing.UI.DockingPanel.prototype.
        setVisible.call(this, show);
    }

    /////////////////////////////////////////////////////////////
    // initialize override
    //
    /////////////////////////////////////////////////////////////
    _thisPanel.initialize = function() {

      this.title = this.createTitleBar(
        this.titleLabel ||
        this.container.id);

      this.closer = this.createCloseButton();

      this.container.appendChild(this.title);
      this.title.appendChild(this.closer);
      this.container.appendChild(this.content);

      this.initializeMoveHandlers(this.title);
      this.initializeCloseHandler(this.closer);
    }

    /////////////////////////////////////////////////////////////
    // onTitleDoubleClick override
    //
    /////////////////////////////////////////////////////////////
    var _isMinimized = false;

    _thisPanel.onTitleDoubleClick = function (event) {

      _isMinimized = !_isMinimized;

      if(_isMinimized) {

        $(_thisPanel.container).addClass(
          'dashboard-minimized');
      }
      else {
        $(_thisPanel.container).removeClass(
          'dashboard-minimized');
      }
    }

    /////////////////////////////////////////////////////////////
    //
    //
    /////////////////////////////////////////////////////////////
    _thisPanel.loadBarChart = function(selector, data) {

      var margin = {
          top: 40,
          right: 40,
          bottom: 40,
          left: 40},

        width = 550 - margin.left - margin.right,

        height = 400 - margin.top - margin.bottom;

      var x = d3.scale.ordinal()
        .rangeRoundBands([0, width], .1);

      var y = d3.scale.linear()
        .range([height, 0]);

      var xAxis = d3.svg.axis()
        .scale(x)
        .orient("bottom");

      var yAxis = d3.svg.axis()
        .scale(y)
        .orient("left")
        .ticks(10, "%");

      var d3Container = d3.select(selector);

      var svg = d3Container.append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

      x.domain(data.map(function(d) { return d.label; }));

      y.domain([0, d3.max(data, function(d) { return d.value / 1000; })]);

      svg.append("g")
        .attr("class", "x axis")
        .attr("transform", "translate(0," + height + ")")
        .call(xAxis)
        .selectAll("text")
        .style("text-anchor", "end")
        .attr("dx", "-.8em")
        .attr("dy", ".15em")
        .attr("transform", function(d) {
          return "rotate(-20)"
        });

      svg.append("g")
        .attr("class", "y axis")
        .call(yAxis)
        .append("text")
        .attr("transform", "translate(60, -30)")
        .attr("y", 6)
        .attr("dy", ".71em")
        .style("text-anchor", "end")
        .text("Components (% Total)");

      var tooltip = d3.select(_thisPanel.container)
        .append('div')
        .style('display', 'none')
        .style('position','absolute')
        .style('padding','0 10px')
        .style('background','white')
        .style('opacity',0);

      var tempcolor = null;

      var colors = d3.scale.linear()
        .domain([0, data.length * .33, data.length * .66, data.length])
        .range(['#B58929','#C61C6F', '#268BD2', '#85992C']) //Orange to Green.

      svg.selectAll(".bar-item")
        .data(data)
        .enter().append("rect")
        .attr("class", "bar-item")
        .attr("x", function(d) { return x(d.label); })
        .attr("width", x.rangeBand())
        .attr("y", function(d) { return y(d.value / 1000); })
        .attr("height", function(d) { return height - y(d.value / 1000); })
        .style('fill',function(d, i){
          //return "#" + Math.floor(Math.random() * 16777215).toString(16)
          return colors(i);
        })
        .on('click', function(item){
            var dbIds = item.dbIds;
            viewer.fitToView(dbIds);
            viewer.isolate(dbIds);
          })
        .on('mouseover',function(props){

          tooltip.transition()
            .style('opacity',.9);

          var offset = $(_thisPanel.container).offset();

          var x = d3.event.pageX - offset.left;
          var y = d3.event.pageY - offset.top;

          tooltip.html(props.label + ': ' + props.value)
            .style('left', x - 20 + 'px')
            .style('top', y + 20 + 'px')
            .style('display', 'block')

          tempcolor = this.style.fill;

          d3.select(this)
            .style('fill','#6AB8E3')
            .style('opacity',.5);
        })
        .on('mouseout',function(d){

          d3.select(this)
            .style('opacity',1)
            .style('fill',tempcolor);

          tooltip.style('display', 'none');
        });

      function type(d) {
        d.value = +d.value;
        return d;
      }

      $(selector + ' > svg').css({
        'width':'520px',
        'height':'450px'
      });
    }

    /////////////////////////////////////////////////////////////
    //
    //
    /////////////////////////////////////////////////////////////
    _thisPanel.loadPieChart = function(selector, data) {

      var pie = new d3pie($(selector)[0], {

        //header: {
        //  title: {
        //    text: "Title"
        //  }
        //},

        size: {
          canvasHeight: 450,
          canvasWidth: 530
        },

        data: {
          content: data,
          sortOrder: "label-asc"
          //smallSegmentGrouping: {
          //  valueType: "percentage",
          //  label: "Other",
          //  enabled: true,
          //  value: 3
          //}
        },

        callbacks: {
          onClickSegment: function(event) {
            var dbIds = event.data.dbIds;
            viewer.fitToView(dbIds);
            viewer.isolate(dbIds);
          }
        }
      });

      //$('.d3 > svg').css('transform', 'translate(0px, 42px)');

      return pie;
    }

    /////////////////////////////////////////////////////////////
    //
    //
    /////////////////////////////////////////////////////////////
    _thisPanel.loadDonutChart = function(selector, data) {

      var pie = new d3pie($(selector)[0], {

        size: {
          pieInnerRadius: "50%",
          canvasHeight: 450,
          canvasWidth: 530
        },

        data: {
          content: data,
          sortOrder: "label-asc"
        },

        callbacks: {
          onClickSegment: function(event) {
            var dbIds = event.data.dbIds;
            viewer.fitToView(dbIds);
            viewer.isolate(dbIds);
          }
        }
      });

      return pie;
    }

    /////////////////////////////////////////////////////////////
    //
    //
    /////////////////////////////////////////////////////////////
    _thisPanel.loadMapLayers = function(selector, data) {

      data.map((item)=>{

        var html = `
          <p>
            ${item.label}:
          </p>
        `;

        $(selector).append(html);

        createSwitchButton(selector, true, (checked)=>{

          if(checked){

            viewer.show(item.dbIds);
          }
          else {

            viewer.hide(item.dbIds);
          }
        });

        $(selector).append('<hr class="hr-dashboard">');
      });
    }

    /////////////////////////////////////////////////////////////
    //
    //
    /////////////////////////////////////////////////////////////
    function createSwitchButton(parent, checked, onChanged) {

      var inputId = guid();

      var labelId = guid();

      var html = `
        <p class="onoffswitch">
          <input id="${inputId}" type="checkbox" name="onoffswitch"
            class="onoffswitch-checkbox" ${checked?"checked":""}>
          <label id="${labelId}" class="onoffswitch-label" for="myonoffswitch">
            <span class="onoffswitch-inner"></span>
            <span class="onoffswitch-switch"></span>
          </label>
        </p>
      `;

      $(parent).append(html);

      $('#' + labelId).click((e)=>{

        var input = $('#' + inputId)[0];

        input.checked = !input.checked;

        onChanged(input.checked);
      });
    }
  }

  /////////////////////////////////////////////////////////////
  // Set up JS inheritance
  //
  /////////////////////////////////////////////////////////////
  Panel.prototype = Object.create(
    Autodesk.Viewing.UI.DockingPanel.prototype);

  Panel.prototype.constructor = Panel;

  ///////////////////////////////////////////////////////////////////////////
  // Gets all existing properties from components list
  //
  ///////////////////////////////////////////////////////////////////////////
  function getAvailableProperties(components, onResult) {

    var propertiesMap = {};

    async.each(components,

      function (component, callback) {

        viewer.getProperties(component.dbId, function(result) {

          for (var i = 0; i < result.properties.length; i++) {

            var prop = result.properties[i];

            propertiesMap[prop.displayName] = {};
          }

          callback();
        });
      },
      function (err) {

        onResult(Object.keys(propertiesMap));
      });
  }

  ///////////////////////////////////////////////////////////////////////////
  // Get all leaf components
  //
  ///////////////////////////////////////////////////////////////////////////
  function getAllLeafComponents (callback) {

    function getLeafComponentsRec(parent) {

      var components = [];

      if (typeof parent.children !== "undefined") {

        var children = parent.children;

        for (var i = 0; i < children.length; i++) {

          var child = children[i];

          if (typeof child.children !== "undefined") {

            var subComps = getLeafComponentsRec(child);

            components.push.apply(components, subComps);
          }
          else {
            components.push(child);
          }
        }
      }

      return components;
    }

    viewer.getObjectTree(function (result) {

      var allLeafComponents = getLeafComponentsRec(result.root);

      callback(allLeafComponents);
    });
  }

  ///////////////////////////////////////////////////////////////////////////
  // Creates dropdown menu from input
  //
  ///////////////////////////////////////////////////////////////////////////
  function createDropdownMenu(parent, title, pos, menuItems, selectedItemIdx) {

    var labelId = guid();

    var menuId = guid();

    var listId = guid();

    var html = `
      <div id ="${menuId}" class="dropdown chart-dropdown">
        <button class="btn btn-default dropdown-toggle"
          type="button"
          data-toggle="dropdown">
            <label id="${labelId}" style="font: normal 14px Times New Roman">
              ${title}
            </label>
          <span class="caret"></span>
        </button>
        <ul id="${listId}"class="dropdown-menu scrollable-menu">
        </ul>
      </div>
    `;

    $(parent).append(html);

    $('#' + menuId).css({

      'top': pos.top + 'px',
      'left': pos.left + 'px'
    });

    $('#' + labelId).text(title + ': ');
    //$('#' + labelId).text(title + ': ' + menuItems[selectedItemIdx || 0].label);

    menuItems.forEach(function(menuItem){

      var itemId = guid();

      var itemHtml = '<li id="' + itemId + '"><a href="">' + menuItem.label + '</a></li>';

      $('#' + listId).append(itemHtml);

      $('#' + itemId).click(function(event) {

        event.preventDefault();

        menuItem.handler();

        $('#' + labelId).text(title + ': ' + menuItem.label);
      });
    });

    return menuId;
  }
  
  ///////////////////////////////////////////////////////////////////////////
  // Maps components by property
  //
  ///////////////////////////////////////////////////////////////////////////
  function mapComponentsByPropName(propName, components, onResult) {
    
    var componentsMap = {};
    
    async.each(components,
      
      function (component, callback) {
        
        getPropertyValue(component.dbId, propName, function (value) {
          
          if(propName === 'label') {
            value = value.split(':')[0];
          }
          
          if (!componentsMap[value]) {
            
            componentsMap[value] = [];
          }
          
          componentsMap[value].push(component.dbId);
          
          callback();
        });
      },
      function (err) {
        
        onResult(componentsMap);
      });
  }
  
  ///////////////////////////////////////////////////////////////////////////
  // Get property value from display name
  //
  ///////////////////////////////////////////////////////////////////////////
  function getPropertyValue (dbId, displayName, callback) {
    
    function _cb(result) {
      
      if (result.properties) {
        
        for (var i = 0; i < result.properties.length; i++) {
          
          var prop = result.properties[i];
          
          if (prop.displayName === displayName) {
            
            callback(prop.displayValue);
            return;
          }
        }
        
        callback('undefined');
      }
    }
    
    viewer.getProperties(dbId, _cb);
  }

  /////////////////////////////////////////////////////////////
  // Add needed CSS
  //
  /////////////////////////////////////////////////////////////
  var css = `

    div.dashboard {
      top: 0px;
      left: 0px;
      width: 550px;
      height: 588px;
      resize: auto;
      background-color:white;
    }

    div.dashboard:hover {
      background-color:white;
    }

    div.dashboard-minimized {
      height: 34px;
      min-height: 34px
    }

    .tabs{
      margin-right: 4px;
      margin-top: 50px;
      margin-left: 4px;
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
      display:block;
      padding:5px 10px;
      background-color: #EEE;
      color: #000;
      text-decoration: none;
      margin: 0 4px;
      border-top:1px solid #CCC;
      border-left:1px solid #DDD;
      border-right:1px solid #DDD;
      font:13px/18px verdana,arial,sans-serif;
      border-bottom:1px solid #CCC;
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
      background-color: #fff;
      display:none;
      height:450px;
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
      background-color: #FFFFFF;
      color: #000;
      text-decoration: none;
      margin: 0 4px;
      border-top:1px solid #CCC;
      border-left:1px solid #DDD;
      border-right:1px solid #DDD;
      font:13px/18px verdana,arial,sans-serif;
      border-bottom:1px solid #CCC;
    }

    .tabs a.active{
      background-color: #EEEEEE;
      border-bottom:1px solid #EEEEEE;
    }

    .tabs div{
      clear: both;
      border:1px solid #CCC;
      padding:5px;
      font-family:verdana;
      font-size:13px;
      background-color: #EEEEEE;
      display:none;
    }

    .bar-item:hover {
      fill: brown;
    }

    .axis {
      font: 10px sans-serif;
    }

    .axis path {
      fill: none;
      stroke: #000;
      shape-rendering: crispEdges;
    }

    .axis line {
      fill: none;
      stroke: #000;
      shape-rendering: crispEdges;
    }

    .x.axis path {
      display: none;
    }

    div.chart-dropdown {
      position: absolute;
    }

    .scrollable-menu {
      height: auto;
      max-height: 300px;
      overflow-x: hidden;
      overflow-y: scroll;
    }

    .hr-dashboard {
      margin-top: 15px;
      margin-left: 20px;
      margin-right: 20px;
      margin-bottom: 15px;
      border-top-color: #A9A9A9;
    }

    .d3-map {
      height: 460px;
      overflow-y: scroll;
    }
    `;

  $('<style type="text/css">' + css + '</style>').appendTo('head');
};

Autodesk.ADN.Viewing.Extension.Dashboard.prototype =
  Object.create(Autodesk.Viewing.Extension.prototype);

Autodesk.ADN.Viewing.Extension.Dashboard.prototype.constructor =
  Autodesk.ADN.Viewing.Extension.Dashboard;

Autodesk.Viewing.theExtensionManager.registerExtension(
  'Autodesk.ADN.Viewing.Extension.Dashboard',
  Autodesk.ADN.Viewing.Extension.Dashboard);