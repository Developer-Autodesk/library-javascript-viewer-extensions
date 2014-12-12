///////////////////////////////////////////////////////////////////////////////
// Move viewer Extension
// by Philippe Leefsma, October 2014
//
///////////////////////////////////////////////////////////////////////////////
AutodeskNamespace("Autodesk.ADN.Viewing.Extension");

Autodesk.ADN.Viewing.Extension.Move = function (viewer, options) {

    // base constructor
    Autodesk.Viewing.Extension.call(this, viewer, options);

    ///////////////////////////////////////////////////////////////////////////
    // Private members
    //
    ///////////////////////////////////////////////////////////////////////////
    var _selectedMeshMap = {};

    var _initialMeshMap = {};

    var _running = false;

    var _viewer = viewer;

    var _self = this;

    ///////////////////////////////////////////////////////////////////////////
    // load callback
    //
    ///////////////////////////////////////////////////////////////////////////
    _self.load = function () {

        console.log("Autodesk.ADN.Viewing.Extension.Move loaded");

        _viewer.addEventListener(
            Autodesk.Viewing.SELECTION_CHANGED_EVENT,
            _self.onItemSelected);

        $(document).bind(
            'keyup', _self.onKeyup);

        return true;
    };

    ///////////////////////////////////////////////////////////////////////////
    // unload callback
    //
    ///////////////////////////////////////////////////////////////////////////
    _self.unload = function () {

        console.log("Autodesk.ADN.Viewing.Extension.Move unloaded");

        _viewer.removeEventListener(
            Autodesk.Viewing.SELECTION_CHANGED_EVENT,
            _self.onItemSelected);

        $(document).unbind(
            'keyup', _self.onKeyup);

        _self.cancel();

        return true;
    };

    ///////////////////////////////////////////////////////////////////////////
    // keyup callback callback
    //
    ///////////////////////////////////////////////////////////////////////////
    _self.onKeyup = function(event){

        if (event.keyCode == 27) {

            _self.cancel();
        }
    }

    ///////////////////////////////////////////////////////////////////////////
    // cancel
    //
    ///////////////////////////////////////////////////////////////////////////
    _self.cancel = function(){

        $("#" + _viewer.clientContainer.id).
            unbind("click", _self.onMouseClickInit);

        $("#" + _viewer.clientContainer.id).
            unbind("click", _self.onMouseClickEnd);

        $("#" + _viewer.clientContainer.id).
            unbind("mousemove", _self.onMouseMouse);

        _self.restorePositions(_selectedMeshMap);

        _selectedMeshMap = {};

        _running = false;
    }

    ///////////////////////////////////////////////////////////////////////////
    // restore mesh position according to map
    //
    ///////////////////////////////////////////////////////////////////////////
    _self.restorePositions = function(meshMap) {

        for(var fragId in meshMap) {

            var mesh = _viewer.impl.getRenderProxy(
                _viewer,
                fragId);

            var pos = meshMap[fragId].position;

            mesh.matrixWorld.setPosition(pos);
        }

        _viewer.impl.invalidate(true);
    }

    ///////////////////////////////////////////////////////////////////////////
    // item selected callback
    //
    ///////////////////////////////////////////////////////////////////////////
    _self.onItemSelected = function (event) {

        _viewer.select([]);

        if(_running) {
            return;
        }

        var fragId = event.fragIdsArray[0];

        if(typeof fragId !== 'undefined') {

            _self.previousPos = null;

            $("#" + _viewer.clientContainer.id).
                bind("mousemove", _self.onMouseMove);

            $("#" + _viewer.clientContainer.id).
                bind("click", _self.onMouseClickInit);

            var fragIdsArray = (Array.isArray(fragId) ?
                fragId :
                [fragId]);

            fragIdsArray.forEach(function(subFragId){

                var mesh = _viewer.impl.getRenderProxy(
                    _viewer,
                    subFragId);

                _selectedMeshMap[subFragId] = {

                    position: _self.getMeshPosition(mesh)
                }

                if(!_initialMeshMap[subFragId]) {

                    _initialMeshMap[subFragId] = {

                        position: _self.getMeshPosition(mesh)
                    }
                }
            });
        }
    }

    ///////////////////////////////////////////////////////////////////////////
    // return mesh position
    //
    ///////////////////////////////////////////////////////////////////////////
    _self.getMeshPosition = function (mesh) {

        var pos = new THREE.Vector3();

        pos.setFromMatrixPosition(mesh.matrixWorld);

        return pos;
    }

    ///////////////////////////////////////////////////////////////////////////
    // mouse click callback
    //
    ///////////////////////////////////////////////////////////////////////////
    _self.onMouseClickInit = function(event) {

        $("#" + _viewer.clientContainer.id).
            unbind("click", _self.onMouseClickInit);

        $("#" + _viewer.clientContainer.id).
            bind("click", _self.onMouseClickEnd);

        _running = true;

        var screenPoint = {
            x: event.clientX,
            y: event.clientY
        };

        var n = _self.normalizeCoords(screenPoint);

        var hitPoint = _viewer.utilities.getHitPoint(
            n.x,
            n.y);

        if (hitPoint) {

            for(var fragId in _selectedMeshMap) {

                console.log("FragId: " + fragId);

                var mesh = _viewer.impl.getRenderProxy(
                    _viewer,
                    fragId);

                var pos = _self.getMeshPosition(mesh);

                var offset = {

                    x: hitPoint.x - pos.x,
                    y: hitPoint.y - pos.y,
                    z: hitPoint.z - pos.z
                }

                _selectedMeshMap[fragId].offset = offset;

                console.log(offset);
            }
        }
    }

    _self.onMouseClickEnd = function(event) {

        _self.previousPos = _self.screenToWorld(event);

        $("#" + _viewer.clientContainer.id).
            unbind("mousemove", _self.onMouseMove);

        $("#" + _viewer.clientContainer.id).
            unbind("click", _self.onMouseClickEnd);

        _selectedMeshMap = {};

        _running = false;
    }

    ///////////////////////////////////////////////////////////////////////////
    // mouse move callback
    //
    ///////////////////////////////////////////////////////////////////////////
    _self.onMouseMove = function(event) {

        var pos = _self.screenToWorld(event);

        for(var fragId in _selectedMeshMap) {

            var mesh = _viewer.impl.getRenderProxy(
                _viewer,
                fragId);

            var offset = _selectedMeshMap[fragId].offset;

            //var offset = { x: 0, y: 0, z: 0 };

            console.log(offset);

            pos = {
                x: pos.x - offset.x,
                y: pos.y - offset.y,
                z: pos.z - offset.z
            };

            mesh.matrixWorld.setPosition(pos);
        }

        _viewer.impl.invalidate(true);
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

        var n = _self.normalizeCoords(screenPoint);

        return _viewer.navigation.getWorldPoint(n.x, n.y);
    }

    ///////////////////////////////////////////////////////////////////////////
    // normalize screen coordinates
    //
    ///////////////////////////////////////////////////////////////////////////
    _self.normalizeCoords = function(screenPoint) {

        var vp = _viewer.navigation.getScreenViewport();

        var n = {
            x: (screenPoint.x - vp.left) / vp.width,
            y: (screenPoint.y - vp.top) / vp.height
        };

        return n;
    }
};

Autodesk.ADN.Viewing.Extension.Move.prototype =
    Object.create(Autodesk.Viewing.Extension.prototype);

Autodesk.ADN.Viewing.Extension.Move.prototype.constructor =
    Autodesk.ADN.Viewing.Extension.Move;

Autodesk.Viewing.theExtensionManager.registerExtension(
    'Autodesk.ADN.Viewing.Extension.Move',
    Autodesk.ADN.Viewing.Extension.Move);

