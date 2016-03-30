///////////////////////////////////////////////////////////////////////////////
// GithubDemo viewer Extension
// by Philippe Leefsma, March 2015
//
///////////////////////////////////////////////////////////////////////////////
AutodeskNamespace("Autodesk.ADN.Viewing.Extension");

Autodesk.ADN.Viewing.Extension.GithubDemo = function (viewer, options) {

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

    var _viewer = viewer;

    var _markUps = {};

    var _this = this;

    ///////////////////////////////////////////////////////
    // Checks if css is loaded
    //
    ///////////////////////////////////////////////////////
    function isCssLoaded(name) {

        for(var i=0; i < document.styleSheets.length; ++i){

            var styleSheet = document.styleSheets[i];

            if(styleSheet.href && styleSheet.href.indexOf(name) > -1)
                return true;
        };

        return false;
    }

    ///////////////////////////////////////////////////////////////////////////
    // load callback
    //
    ///////////////////////////////////////////////////////////////////////////
    _this.load = function () {

        var dependencies = [
            "uploads/extensions/_Autodesk.ADN.Viewing.Extension.GithubDemo/raphael-min.js"
        ];

        require(dependencies, function() {

            _this.tool = new AnimationTool(viewer);

            viewer.toolController.registerTool(_this.tool);

            // loads bootstrap css if needed
            if(!isCssLoaded("bootstrap.css") && !isCssLoaded("bootstrap.min.css")) {

                $('<link rel="stylesheet" type="text/css" href="http://netdna.bootstrapcdn.com/bootstrap/3.1.1/css/bootstrap.css"/>').appendTo('head');
            }

            var rotate = false;
            var explode = false;
            var annotate = false;

            $('<div/>').
                attr('id', 'buttonsDivId').
                append('<button class="btn btn-info" style="width:50px" id="rotateBtn">Rotate</button>').
                append('&nbsp;').
                append('<button class="btn btn-info" style="width:50px; top:10px" id="explodeBtn" type="button">Explode</button>').
                append('&nbsp;').
                append('<button class="btn btn-info" style="width:50px" id="annotateBtn" type="button">Annotate</button>').
                appendTo(_viewer.container);

            $('#buttonsDivId').css({
                'bottom': '5%',
                'left': '15%',
                'z-index':'100',
                'position':'absolute'
            });

            $('#rotateBtn').click(function(){

                rotate = !rotate;

                if(rotate) {

                    viewer.toolController.activateTool(_this.tool.getName());

                    var worldUp = viewer.navigation.getWorldUpVector();

                    _this.tool.startRotateMotion(0.3,
                      {
                          x:worldUp.x,
                          y:worldUp.y,
                          z:worldUp.z
                      });

                    $('#rotateBtn').addClass('btn-success');
                    $('#rotateBtn').removeClass('btn-info');
                }
                else {

                    _this.tool.stopRotateMotion();

                    $('#rotateBtn').removeClass('btn-success');
                    $('#rotateBtn').addClass('btn-info');
                }
            });

            $('#explodeBtn').click(function(){

                explode = !explode;

                if(explode) {

                    viewer.toolController.activateTool(_this.tool.getName());

                    _this.tool.startExplodeMotion(0.2, 0.1, 1.5);

                    $('#explodeBtn').addClass('btn-success');
                    $('#explodeBtn').removeClass('btn-info');
                }
                else {

                    _this.tool.stopExplodeMotion();

                    $('#explodeBtn').removeClass('btn-success');
                    $('#explodeBtn').addClass('btn-info');
                }
            });

            $('#annotateBtn').click(function(){

                annotate = !annotate;

                if(annotate) {

                    activateAnnotate();
                }
                else {

                    deActivateAnnotate();
                }
            });


            function activateAnnotate() {

                $('#annotateBtn').addClass('btn-success');
                $('#annotateBtn').removeClass('btn-info');

                $(_viewer.container).
                    bind("click", _this.onMouseClick);

                _viewer.addEventListener(
                    Autodesk.Viewing.SELECTION_CHANGED_EVENT,
                    _this.onItemSelected);
            }

            function deActivateAnnotate() {

                $('#annotateBtn').removeClass('btn-success');
                $('#annotateBtn').addClass('btn-info');

                $(_viewer.container).
                    unbind("click", _this.onMouseClick);

                _viewer.removeEventListener(
                    Autodesk.Viewing.SELECTION_CHANGED_EVENT,
                    _this.onItemSelected);
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

            _this.viewer.setContextMenu(
                new Autodesk.ADN.Viewing.Extension.MarkUpContextMenu(
                    _this.viewer));

            _viewer.addEventListener(
                Autodesk.Viewing.EXPLODE_CHANGE_EVENT,
                _this.onExplode);

            _this.createOverlay(function(overlay) {
                _this.overlay = overlay;
            });

            console.log("Autodesk.ADN.Viewing.Extension.GithubDemo loaded");
        });

        return true;
    };

    ///////////////////////////////////////////////////////////////////////////
    // unload callback
    //
    ///////////////////////////////////////////////////////////////////////////
    _this.unload = function () {

        _viewer.setContextMenu(
          new Autodesk.Viewing.Extensions.ViewerObjectContextMenu(viewer)
        );

        $('#buttonsDivId').remove();

        console.log("Autodesk.ADN.Viewing.Extension.GithubDemo unloaded");

        return true;
    };

    ///////////////////////////////////////////////////////////////////////////
    // creates new markup
    //
    ///////////////////////////////////////////////////////////////////////////
    function newMarkUp(dbId, fragId) {

        var divId = newGuid();

        $(_viewer.container).append(
          '<div id="' +  divId + '"></div>');

        $('#' + divId).css({

            'position':'absolute',
            'font-family':'arial',
            'color':'#ED1111',
            'font-size':'20px',
            'visibility':'hidden',
            'z-index':'999',
            'pointer-events':'none'
        });

        var path = _this.overlay.path(
            "M 0,0 L 0,0");

        path.attr({
            'stroke-width': '2',
            'opacity': '1'
        });

        var connector = _this.overlay.circle(
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
            position: _this.getMeshPosition(fragId)
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

                _viewer.contextMenu.show(e);
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
    _this.onItemSelected = function (event) {

        var dbId = event.dbIdArray[0];

        var fragId = event.fragIdsArray[0];

        if (typeof dbId !== 'undefined') {

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
    _this.onMouseClick = function(event) {

        var screenPoint = {
            x: event.clientX,
            y: event.clientY
        };

        switch (_mode) {

            case ModeEnum.kModeInitDrag:

                var n = _this.normalizeCoords(screenPoint);

                var hitPoint = _viewer.utilities.getHitPoint(
                    n.x,
                    n.y);

                if (hitPoint) {

                    var markUp = _currentMarkUp;

                    markUp.attachmentPoint = hitPoint;

                    markUp.textPos = screenPoint;

                    _this.updateMarkUp(markUp);

                    $(_viewer.container).
                        bind("mousemove", _this.onMouseMove);

                    _viewer.addEventListener(
                        Autodesk.Viewing.CAMERA_CHANGE_EVENT,
                        _this.onCameraChanged);

                    _mode = ModeEnum.kModeDrag;

                    _this.getPropertyValue(markUp.dbId, 'label',

                        function (value) {

                            $('#' + markUp.divId).text(value);

                            $('#' + markUp.divId).css(
                                {'visibility': 'visible'}
                            );
                        });
                }

                break;

            case ModeEnum.kModeDrag:

                $(_viewer.container).
                    unbind("mousemove", _this.onMouseMove);

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
    _this.normalizeCoords = function(screenPoint) {

        var viewport =
            _viewer.navigation.getScreenViewport();

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
    _this.onMouseMove = function(event) {

        var screenPoint = {
            x: event.clientX,
            y: event.clientY
        };

        var markUp = _currentMarkUp;

        markUp.textPos = screenPoint;

        _this.updateMarkUp(markUp);
    }

    ///////////////////////////////////////////////////////////////////////////
    // world -> screen coords conversion
    //
    ///////////////////////////////////////////////////////////////////////////
    _this.worldToScreen = function(worldPoint, camera) {

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
        var point = _viewer.impl.viewportToClient(p.x, p.y);

        // snap to the center of the pixel
        point.x = Math.floor(point.x) + 0.5;
        point.y = Math.floor(point.y) + 0.5;

        return point;
    }

    ///////////////////////////////////////////////////////////////////////////
    // screen to world coordinates conversion
    //
    ///////////////////////////////////////////////////////////////////////////
    _this.screenToWorld = function(event) {

        var screenPoint = {
            x: event.clientX,
            y: event.clientY
        };

        var viewport =
            _viewer.navigation.getScreenViewport();

        var n = {
            x: (screenPoint.x - viewport.left) / viewport.width,
            y: (screenPoint.y - viewport.top) / viewport.height
        };

        return _viewer.navigation.getWorldPoint(n.x, n.y);
    }

    ///////////////////////////////////////////////////////////////////////////
    // Get Property Value
    //
    ///////////////////////////////////////////////////////////////////////////
    _this.getPropertyValue = function (dbId, displayName, callback) {

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

        _viewer.getProperties(dbId, _cb);
    };

    ///////////////////////////////////////////////////////////////////////////
    // camera changed callback
    //
    ///////////////////////////////////////////////////////////////////////////
    _this.onCameraChanged = function(event) {

        _this.updateMarkUps();
    };

    ///////////////////////////////////////////////////////////////////////////
    // explode changed callback
    //
    ///////////////////////////////////////////////////////////////////////////
    _this.onExplode = function(event) {

        _this.updateMarkUps();
    };

    ///////////////////////////////////////////////////////////////////////////
    // update markUp graphics
    //
    ///////////////////////////////////////////////////////////////////////////
    _this.updateMarkUp = function(markUp) {

        var pos = _this.getMeshPosition(
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

        var screenPoint = _this.worldToScreen(
          attachmentPoint,
          _viewer.getCamera());

        var offset = getClientOffset(
          _viewer.container);

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

    _this.updateMarkUps = function() {

        for(var key in _markUps){

            _this.updateMarkUp(_markUps[key]);
        }
    }

    ///////////////////////////////////////////////////////////////////////////
    // create overlay 2d canvas
    //
    ///////////////////////////////////////////////////////////////////////////
    _this.createOverlay = function (callback) {

        if (typeof Raphael === 'undefined') {
            callback(null);
        }

        var overlayDiv = document.createElement("div");

        overlayDiv.id = 'overlayDivId';

        _viewer.container.appendChild(
            overlayDiv);

        overlayDiv.style.top = "0";
        overlayDiv.style.left = "0";
        overlayDiv.style.right = "0";
        overlayDiv.style.bottom = "0";
        overlayDiv.style.zIndex = "999";
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
    _this.getMeshPosition = function(fragId) {

        var mesh = _viewer.impl.getRenderProxy(
            _viewer.model,
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
    function newGuid() {

        var d = new Date().getTime();

        var guid = 'xxxx-xxxx-xxxx-xxxx-xxxx'.replace(
            /[xy]/g,
            function (c) {
                var r = (d + Math.random() * 16) % 16 | 0;
                d = Math.floor(d / 16);
                return (c == 'x' ? r : (r & 0x7 | 0x8)).toString(16);
            });

        return guid;
    };


    /////////////////////////////////////////////////////////////////
    // The animation tool
    //
    /////////////////////////////////////////////////////////////////
    function AnimationTool(viewer) {

        var _tool = this;

        _tool.motionCallbacks = {};

        this.getNames = function() {

            return ["Autodesk.ADN.Viewing.Tool.AnimationTool"];
        };

        this.getName = function() {

            return "Autodesk.ADN.Viewing.Tool.AnimationTool";
        };

        /////////////////////////////////////////////////////////////
        // called when tool is activated
        //
        /////////////////////////////////////////////////////////////
        this.activate = function(name) {

            _tool.initialState = {
                scale: viewer.getExplodeScale(),
                position: viewer.navigation.getPosition()
            }

            _tool.lastTime = -1;
        };

        /////////////////////////////////////////////////////////////
        // called when tool is deactivated
        //
        /////////////////////////////////////////////////////////////
        this.deactivate = function(name) {

            viewer.explode(_tool.initialState.scale);

            viewer.navigation.setPosition(
              new THREE.Vector3(
                _tool.initialState.position.x,
                _tool.initialState.position.y,
                _tool.initialState.position.z
              ));

            _tool.motionCallbacks = {};
        };

        /////////////////////////////////////////////////////////////
        // update is called by the framework
        // t: time elapsed since tool activated in ms
        /////////////////////////////////////////////////////////////
        this.update = function(t) {

            var dt = elapsed(t);

            for(var motionId in  _tool.motionCallbacks){

                _tool.motionCallbacks[motionId](dt);
            }

            return false;
        };

        /////////////////////////////////////////////////////////////
        //
        //
        /////////////////////////////////////////////////////////////
        function elapsed(t) {

            if(_tool.lastTime < 0) {
                _tool.lastTime = t;
            }

            var elapsed = t - _tool.lastTime;

            _tool.lastTime = t;

            return elapsed;
        }

        /////////////////////////////////////////////////////////////
        //
        //
        /////////////////////////////////////////////////////////////
        this.startExplodeMotion = function(speed, min, max) {

            var scale = min;

            _tool.motionCallbacks['explode'] = function (elapsed) {

                scale += speed * 0.001 * elapsed;

                if (scale > max) {

                    scale = max;
                    speed = -speed;
                }

                else if (scale < min) {

                    scale = min;
                    speed = -speed;
                }

                viewer.explode(scale);
            }
        }

        this.stopExplodeMotion = function() {

            delete _tool.motionCallbacks['explode'];
        }

        /////////////////////////////////////////////////////////////
        //
        //
        /////////////////////////////////////////////////////////////
        this.startRotateMotion = function (speed, axis) {

            _tool.motionCallbacks['rotate'] = function (elapsed) {

                var pos = viewer.navigation.getPosition();

                var position = new THREE.Vector3(
                  pos.x,
                  pos.y,
                  pos.z
                );

                var rAxis = new THREE.Vector3(
                  axis.x, axis.y, axis.z
                );

                var matrix = new THREE.Matrix4().makeRotationAxis(
                  rAxis,
                  speed * 0.001 * elapsed);

                position.applyMatrix4(matrix);

                viewer.navigation.setPosition(position);
            };
        }

        this.stopRotateMotion = function () {

            delete _tool.motionCallbacks['rotate'];
        }
    }
};

Autodesk.ADN.Viewing.Extension.GithubDemo.prototype =
    Object.create(Autodesk.Viewing.Extension.prototype);

Autodesk.ADN.Viewing.Extension.GithubDemo.prototype.constructor =
    Autodesk.ADN.Viewing.Extension.GithubDemo;

Autodesk.Viewing.theExtensionManager.registerExtension(
    '_Autodesk.ADN.Viewing.Extension.GithubDemo',
    Autodesk.ADN.Viewing.Extension.GithubDemo);