///////////////////////////////////////////////////////////////////////////////
// Annotation viewer Extension
// by Philippe Leefsma, March 2015
//
///////////////////////////////////////////////////////////////////////////////
AutodeskNamespace("Autodesk.ADN.Viewing.Extension");

Autodesk.ADN.Viewing.Extension.Annotation = function (viewer, options) {

    // base constructor
    Autodesk.Viewing.Extension.call(this, viewer, options);

    ///////////////////////////////////////////////////////////////////////////
    // Private members
    //
    ///////////////////////////////////////////////////////////////////////////
    var ModeEnum = {

        kModeIddle: 0,
        kModeInitDrag: 1,
        kModeDrag: 2
    };

    var _mode = ModeEnum.kModeIddle;

    var _selectedMarkUpId = null;

    var _currentMarkUp = null;

    var _propComboId = null;

    var _markUps = {};

    var _self = this;

    var _propName = '';

    ///////////////////////////////////////////////////////////////////////////
    // load callback
    //
    ///////////////////////////////////////////////////////////////////////////
    _self.load = function () {

        var dependencies = [
            "uploads/extensions/Autodesk.ADN.Viewing.Extension.Annotation/raphael-min.js"
          ];

        require(dependencies, function() {

            function activateAnnotate() {

                $(viewer.container).
                    bind("click", _self.onMouseClick);

                viewer.addEventListener(
                    Autodesk.Viewing.SELECTION_CHANGED_EVENT,
                    _self.onItemSelected);

                viewer.setPropertyPanel(null);
            }

            // context menu stuff

            Autodesk.ADN.Viewing.Extension.MarkUpContextMenu = function (viewer) {

                Autodesk.Viewing.Extensions.ViewerObjectContextMenu.call(
                    this, viewer);
            };

            Autodesk.ADN.Viewing.Extension.MarkUpContextMenu.prototype =
                Object.create(Autodesk.Viewing.Extensions.ViewerObjectContextMenu.prototype);

            Autodesk.ADN.Viewing.Extension.MarkUpContextMenu.prototype.constructor =
                Autodesk.ADN.Viewing.Extension.MarkUpContextMenu;

            Autodesk.ADN.Viewing.Extension.MarkUpContextMenu.prototype.buildMenu =

                function (event, status) {

                    if(typeof event.markUp !== 'undefined') {

                        var menu = [{

                            title: "Delete annotation",
                            target: function () {
                                deleteMarkUp(event.markUp);
                            }
                        }];

                        return menu;
                    }
                    else {

                        var menu =  Autodesk.Viewing.Extensions.ViewerObjectContextMenu.
                            prototype.buildMenu.call(
                            this, event, status);

                        return menu;
                    }
                };

            _self.viewer.setContextMenu(
                new Autodesk.ADN.Viewing.Extension.MarkUpContextMenu(
                    _self.viewer));

            viewer.addEventListener(
                Autodesk.Viewing.EXPLODE_CHANGE_EVENT,
                _self.onExplode);

            _self.createOverlay(function(overlay) {
                _self.overlay = overlay;
            });

            activateAnnotate();

            getAllLeafComponents(function (components) {

                getAvailableProperties(components, function (properties) {

                    var menuItems = [];

                    var labelIdx = 0;

                    properties.forEach(function (property, idx) {

                        var lproperty = property.toLowerCase();

                        if (lproperty === 'label' || lproperty === 'name') {
                            labelIdx = idx;
                            _propName = property;
                        }

                        menuItems.push({
                            label: property,
                            handler: function () {
                                _propName = property;
                            }
                        })
                    });

                    _propComboId = createDropdownMenu(
                      'Annotation Property',
                      {top: 10, left: 10},
                      menuItems,
                      labelIdx);
                });
            });

            console.log("Autodesk.ADN.Viewing.Extension.Annotation loaded");
        });

        return true;
    };

    ///////////////////////////////////////////////////////////////////////////
    // unload callback
    //
    ///////////////////////////////////////////////////////////////////////////
    _self.unload = function () {

        $(viewer.container).
          unbind("click", _self.onMouseClick);

        viewer.removeEventListener(
          Autodesk.Viewing.SELECTION_CHANGED_EVENT,
          _self.onItemSelected);

        // keep custom context menu loaded for delete annotation
        //viewer.setContextMenu(
        //  new Autodesk.Viewing.Extensions.ViewerObjectContextMenu(viewer));

        var panel = new Autodesk.Viewing.Extensions.ViewerPropertyPanel(
            viewer);

        viewer.setPropertyPanel(panel);

        $('#' +  _propComboId).remove();

        console.log("Autodesk.ADN.Viewing.Extension.Annotation unloaded");

        return true;
    };

    ///////////////////////////////////////////////////////////////////////////
    // creates new markup
    //
    ///////////////////////////////////////////////////////////////////////////
    function newMarkUp(dbId, fragId) {

        var divId = guid();

        $(viewer.container).append(
          '<div id="' +  divId + '"></div>');

        $('#' + divId).css({

            'position':'absolute',
            'font-family':'arial',
            'color':'#ED1111',
            'font-size':'20px',
            'visibility':'hidden',
            'pointer-events':'none'
        });

        var path = _self.overlay.path(
            "M 0,0 L 0,0");

        path.attr({
            'stroke-width': '2',
            'opacity': '1'
        });

        var connector = _self.overlay.circle(
            0, 0, 5.0);

        connector.attr("fill", "red");

        var markUp = {

            dbId: dbId,
            fragId: fragId,
            line: path,
            divId: divId,
            textPos: null,
            connector: connector,
            attachmentPoint: null,
            position: _self.getMeshPosition(fragId)
        };

        $('#' + divId).hover(function(){

                _selectedMarkUpId  = this.id;
            },
            function(){

                _selectedMarkUpId = null;
            });

        $('#' + divId).on('contextmenu',
            function (e) {

                e.preventDefault();

                e.markUp = _markUps[_selectedMarkUpId];

                if(e.markUp.screenPoint.y - e.markUp.textPos.y < 0){

                    e.clientX = $('#' + divId).offset().left;
                    e.clientY = $('#' + divId).offset().top + 25;
                }
                else {

                    e.clientX = $('#' + divId).offset().left;
                    e.clientY = $('#' + divId).offset().top - 25;
                }

                viewer.contextMenu.show(e);
            });

        return markUp;
    }

    ///////////////////////////////////////////////////////////////////////////
    // delete a markUp
    //
    ///////////////////////////////////////////////////////////////////////////
    function deleteMarkUp(markUp) {

        $('#' + markUp.divId).remove();

        markUp.connector.remove();

        markUp.line.remove();

        delete _markUps[markUp.divId];
    }

    ///////////////////////////////////////////////////////////////////////////
    // item selected callback
    //
    ///////////////////////////////////////////////////////////////////////////
    _self.onItemSelected = function (event) {

        if(event.dbIdArray.length) {

            viewer.select([]);

            var dbId = event.dbIdArray[0];

            var fragId = event.fragIdsArray[0];

            switch (_mode) {

                case ModeEnum.kModeIddle:

                    _mode = ModeEnum.kModeInitDrag;

                    if (Array.isArray(fragId))
                        fragId = fragId[0];

                    _currentMarkUp =
                        newMarkUp(dbId, fragId);

                    _markUps[_currentMarkUp.divId] =
                        _currentMarkUp;

                default:
                    break;
            }
        }
    }

    ///////////////////////////////////////////////////////////////////////////
    // mouse click callback
    //
    ///////////////////////////////////////////////////////////////////////////
    _self.onMouseClick = function(event) {

        var screenPoint = {
            x: event.clientX,
            y: event.clientY
        };

        switch (_mode) {

            case ModeEnum.kModeInitDrag:

                var n = _self.normalizeCoords(screenPoint);

                var hitPoint = viewer.utilities.getHitPoint(
                    n.x,
                    n.y);

                if (hitPoint) {

                    var markUp = _currentMarkUp;

                    markUp.attachmentPoint = hitPoint;

                    markUp.textPos = screenPoint;

                    _self.updateMarkUp(markUp);

                    $(viewer.container).
                        bind("mousemove", _self.onMouseMove);

                    viewer.addEventListener(
                        Autodesk.Viewing.CAMERA_CHANGE_EVENT,
                        _self.onCameraChanged);

                    _mode = ModeEnum.kModeDrag;

                    viewer.getProperties(markUp.dbId, function(result) {

                        if (result.properties) {

                            var properties = result.properties.filter(
                              function(prop) {

                              return (prop.displayName === _propName);
                            });

                            var value = 'undefined';

                            if(properties.length) {

                                value = properties[0].displayValue;
                            }

                            $('#' + markUp.divId).text(value);

                            $('#' + markUp.divId).css(
                            {
                                'visibility': 'visible'
                            });
                        }
                    });
                }

                break;

            case ModeEnum.kModeDrag:

                $(viewer.container).
                    unbind("mousemove", _self.onMouseMove);

                var markUp = _currentMarkUp;

                $('#' + markUp.divId).css({

                    'pointer-events':'auto'
                });

                _mode = ModeEnum.kModeIddle;

                _currentMarkUp = null;

            default: break;
        }
    }

    ///////////////////////////////////////////////////////////////////////////
    // normalize screen coordinates
    //
    ///////////////////////////////////////////////////////////////////////////
    _self.normalizeCoords = function(screenPoint) {

        var viewport =
            viewer.navigation.getScreenViewport();

        var n = {
            x: (screenPoint.x - viewport.left) / viewport.width,
            y: (screenPoint.y - viewport.top) / viewport.height
        };

        return n;
    }

    ///////////////////////////////////////////////////////////////////////////
    // mouse move callback
    //
    ///////////////////////////////////////////////////////////////////////////
    _self.onMouseMove = function(event) {

        var screenPoint = {
            x: event.clientX,
            y: event.clientY
        };

        var markUp = _currentMarkUp;

        markUp.textPos = screenPoint;

        _self.updateMarkUp(markUp);
    }

    ///////////////////////////////////////////////////////////////////////////
    // world -> screen coords conversion
    //
    ///////////////////////////////////////////////////////////////////////////
    _self.worldToScreen = function(worldPoint, camera) {

        var p = new THREE.Vector4();

        p.x = worldPoint.x;
        p.y = worldPoint.y;
        p.z = worldPoint.z;
        p.w = 1;

        p.applyMatrix4(camera.matrixWorldInverse);
        p.applyMatrix4(camera.projectionMatrix);

        // Don't want to mirror values with negative z (behind camera)
        // if camera is inside the bounding box,
        // better to throw markers to the screen sides.
        if (p.w > 0)
        {
            p.x /= p.w;
            p.y /= p.w;
            p.z /= p.w;
        }

        // This one is multiplying by width/2 and â€“height/2,
        // and offsetting by canvas location
        var point = viewer.impl.viewportToClient(p.x, p.y);

        // snap to the center of the pixel
        point.x = Math.floor(point.x) + 0.5;
        point.y = Math.floor(point.y) + 0.5;

        return point;
    }

    ///////////////////////////////////////////////////////////////////////////
    // screen to world coordinates conversion
    //
    ///////////////////////////////////////////////////////////////////////////
    _self.screenToWorld = function(event) {

        var screenPoint = {
            x: event.clientX,
            y: event.clientY
        };

        var viewport =
            viewer.navigation.getScreenViewport();

        var n = {
            x: (screenPoint.x - viewport.left) / viewport.width,
            y: (screenPoint.y - viewport.top) / viewport.height
        };

        return viewer.navigation.getWorldPoint(n.x, n.y);
    }

    ///////////////////////////////////////////////////////////////////////////
    // camera changed callback
    //
    ///////////////////////////////////////////////////////////////////////////
    _self.onCameraChanged = function(event) {

        _self.updateMarkUps();
    };

    ///////////////////////////////////////////////////////////////////////////
    // explode changed callback
    //
    ///////////////////////////////////////////////////////////////////////////
    _self.onExplode = function(event) {

        _self.updateMarkUps();
    };

    ///////////////////////////////////////////////////////////////////////////
    // update markUp graphics
    //
    ///////////////////////////////////////////////////////////////////////////
    _self.updateMarkUp = function(markUp) {

        var pos = _self.getMeshPosition(
            markUp.fragId);

        var translation = {

            x: pos.x - markUp.position.x,
            y: pos.y - markUp.position.y,
            z: pos.z - markUp.position.z
        }

        var attachmentPoint = {

            x: markUp.attachmentPoint.x + translation.x,
            y: markUp.attachmentPoint.y + translation.y,
            z: markUp.attachmentPoint.z + translation.z
        }

        var screenPoint = _self.worldToScreen(
            attachmentPoint,
            viewer.getCamera());

        var offset = getClientOffset(
          viewer.container);

        markUp.screenPoint = screenPoint;

        markUp.connector.attr({
            cx: screenPoint.x,
            cy: screenPoint.y
        });

        markUp.line.attr({
            path:
            "M" + (screenPoint.x) +
            "," + (screenPoint.y) +
            "L" + (markUp.textPos.x - offset.x) +
            "," + (markUp.textPos.y - offset.y)
        });

        var divYOffset = 30;

        if(screenPoint.y - markUp.textPos.y < 0)
            divYOffset = 0;

        var w = $('#' + markUp.divId).width();

        $('#' + markUp.divId).css({
            'left': (markUp.textPos.x - offset.x - w * 0.25).toString() + "px",
            'top':(markUp.textPos.y - divYOffset - offset.y).toString() + "px"
        });
    };

    _self.updateMarkUps = function() {

        for(var key in _markUps){

            _self.updateMarkUp(_markUps[key]);
        }
    }

    ///////////////////////////////////////////////////////////////////////////
    // create overlay 2d canvas
    //
    ///////////////////////////////////////////////////////////////////////////
    _self.createOverlay = function (callback) {

        if (typeof Raphael === 'undefined') {
            callback(null);
        }

        var overlayDiv = document.createElement("div");

        overlayDiv.id = 'overlayDivId';

        viewer.container.appendChild(
            overlayDiv);

        overlayDiv.style.top = "0";
        overlayDiv.style.left = "0";
        overlayDiv.style.right = "0";
        overlayDiv.style.bottom = "0";
        overlayDiv.style.position = "absolute";
        overlayDiv.style.pointerEvents = "none";

        var overlay = new Raphael(
            overlayDiv,
            overlayDiv.clientWidth,
            overlayDiv.clientHeight);

        callback(overlay);
    }

    ///////////////////////////////////////////////////////////////////////////
    // get mesh postion
    //
    ///////////////////////////////////////////////////////////////////////////
    _self.getMeshPosition = function(fragId) {

        var mesh = viewer.impl.getRenderProxy(
          viewer.model,
          fragId);

        var pos = new THREE.Vector3();

        pos.setFromMatrixPosition(mesh.matrixWorld);

        return pos;
    }

    ///////////////////////////////////////////////////////////////////////////
    // return mouse position
    //
    ///////////////////////////////////////////////////////////////////////////
    function getClientOffset(element) {

        var x = 0;
        var y = 0;

        while (element) {

            x += element.offsetLeft -
            element.scrollLeft +
            element.clientLeft;

            y += element.offsetTop -
            element.scrollTop +
            element.clientTop;

            element = element.offsetParent;
        }

        return { x: x, y: y };
    }

    ///////////////////////////////////////////////////////////////////////////
    // Generate GUID
    //
    ///////////////////////////////////////////////////////////////////////////
    function guid() {

        var d = new Date().getTime();

        var guid = 'xxxx-xxxx-xxxx-xxxx-xxxx'.replace(
            /[xy]/g,
            function (c) {
                var r = (d + Math.random() * 16) % 16 | 0;
                d = Math.floor(d / 16);
                return (c == 'x' ? r : (r & 0x7 | 0x8)).toString(16);
            });

        return guid;
    }

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
    function createDropdownMenu(title, pos, menuItems, selectedItemIdx) {

        var labelId = guid();

        var menuId = guid();

        var listId = guid();

        var html = [
            '<div id ="' + menuId + '" class="dropdown chart-dropdown">',
            '<button class="btn btn-default dropdown-toggle" type="button" data-toggle="dropdown">',
            '<label id="' + labelId +'" style="font: normal 14px Times New Roman">' + title + '</label>',
            '<span class="caret"></span>',
            '</button>',
            '<ul id="' + listId + '"class="dropdown-menu scrollable-menu" >',
            '</ul>',
            '</div>'
        ].join('\n');

        $(viewer.container).append(html);

        $('#' + menuId).css({

            'top': pos.top + 'px',
            'left': pos.left + 'px'
        });

        $('#' + labelId).text(title + ': ' + menuItems[selectedItemIdx || 0].label);

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
    // dynamic css styles
    //
    ///////////////////////////////////////////////////////////////////////////
    var css = [

        'canvas.graph {',
        'top:10px;',
        'left:30px;',
        'width:300px;',
        'height:300px;',
        'position:absolute;',
        'overflow:hidden;',
        '}',

        'div.chart-dropdown {',
        'position: absolute;',
        '}',

        '.scrollable-menu {',
        'height: auto;',
        'max-height: 300px;',
        'overflow-x: hidden;',
        'overflow-y: scroll;',
        '}',

    ].join('\n');

    $('<style type="text/css">' + css + '</style>').appendTo('head');
};

Autodesk.ADN.Viewing.Extension.Annotation.prototype =
    Object.create(Autodesk.Viewing.Extension.prototype);

Autodesk.ADN.Viewing.Extension.Annotation.prototype.constructor =
    Autodesk.ADN.Viewing.Extension.Annotation;

Autodesk.Viewing.theExtensionManager.registerExtension(
    'Autodesk.ADN.Viewing.Extension.Annotation',
    Autodesk.ADN.Viewing.Extension.Annotation);