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

    var _modifiedMeshMap = {};

    var _running = false;

    var _self = this;

    ///////////////////////////////////////////////////////////////////////////
    // load callback
    //
    ///////////////////////////////////////////////////////////////////////////
    _self.load = function () {

        console.log("Autodesk.ADN.Viewing.Extension.Move loaded");

        viewer.addEventListener(
            Autodesk.Viewing.SELECTION_CHANGED_EVENT,
            onItemSelected);

        $(document).bind(
            'keyup',
            onKeyup);

        return true;
    };

    ///////////////////////////////////////////////////////////////////////////
    // unload callback
    //
    ///////////////////////////////////////////////////////////////////////////
    _self.unload = function () {

        console.log("Autodesk.ADN.Viewing.Extension.Move unloaded");

        viewer.removeEventListener(
            Autodesk.Viewing.SELECTION_CHANGED_EVENT,
            onItemSelected);

        $(document).unbind(
            'keyup',
            onKeyup);

        cancel();

        return true;
    };

    ///////////////////////////////////////////////////////////////////////////
    // keyup callback callback
    //
    ///////////////////////////////////////////////////////////////////////////
    function onKeyup(event) {

        if (event.keyCode == 27) {

            cancel();
        }
    }

    ///////////////////////////////////////////////////////////////////////////
    // cancel
    //
    ///////////////////////////////////////////////////////////////////////////
    function cancel() {

        $(viewer.container).unbind(
          "click",
          onMouseClickInit);

        $(viewer.container).unbind(
          "click",
          onMouseClickEnd);

        $(viewer.container).unbind(
          "mousemove",
          onMouseMove);

        restorePositions(_selectedMeshMap);

        _selectedMeshMap = {};

        _running = false;
    }

    ///////////////////////////////////////////////////////////////////////////
    // restore mesh position according to map
    //
    ///////////////////////////////////////////////////////////////////////////
    function restorePositions(meshMap) {

        for(var fragId in meshMap) {

            var fragProxy = viewer.impl.getFragmentProxy(
              viewer.model,
              fragId);

            fragProxy.updateAnimTransform();

            meshMap[fragId].proxy.position = fragProxy.position;

            meshMap[fragId].proxy.updateAnimTransform();
        }

        viewer.impl.sceneUpdated(true);
    }

    ///////////////////////////////////////////////////////////////////////////
    // item selected callback
    //
    ///////////////////////////////////////////////////////////////////////////
    function onItemSelected(event) {

        if(event.dbIdArray.length) {

            viewer.select([]);

            if (_running) {
                return;
            }

            $(viewer.container).bind(
              "mousemove",
              onMouseMove);

            $(viewer.container).bind(
              "click",
              onMouseClickInit);

            event.fragIdsArray.forEach(function (fragId) {

                if (!_modifiedMeshMap[fragId]) {

                    var fragProxy = viewer.impl.getFragmentProxy(
                      viewer.model,
                      fragId);

                    fragProxy.updateAnimTransform();

                    _modifiedMeshMap[fragId] = {
                        proxy: fragProxy,
                        offset: {x: 0, y: 0, z: 0}
                    };
                }

                _selectedMeshMap[fragId] =
                  _modifiedMeshMap[fragId];
            });
        }
    }

    ///////////////////////////////////////////////////////////////////////////
    // mouse click callback
    //
    ///////////////////////////////////////////////////////////////////////////
    function onMouseClickInit(event) {

        $(viewer.container).unbind(
          "click",
          onMouseClickInit);

        $(viewer.container).bind(
          "click",
          onMouseClickEnd);

        _running = true;

        var screenPoint = {
            x: event.clientX,
            y: event.clientY
        };

        var n = normalizeCoords(screenPoint);

        var hitPoint = viewer.utilities.getHitPoint(n.x, n.y);

        if (hitPoint) {

            var offset = null;

            for(var fragId in _selectedMeshMap) {

                var pos = _selectedMeshMap[fragId].proxy.position;

                if(offset === null) {

                    offset = {

                        x: hitPoint.x - pos.x,
                        y: hitPoint.y - pos.y,
                        z: hitPoint.z - pos.z
                    };

                    _selectedMeshMap[fragId].offset = offset;
                }
                else {

                    _selectedMeshMap[fragId].offset = {
                        x: 0, y: 0, z: 0
                    };
                }
            }
        }
    }

    function onMouseClickEnd(event) {

        $(viewer.container).unbind(
          "mousemove",
          onMouseMove);

        $(viewer.container).unbind(
          "click",
          onMouseClickEnd);

        _selectedMeshMap = {};

        _running = false;

        viewer.impl.invalidate(true);
    }

    ///////////////////////////////////////////////////////////////////////////
    // mouse move callback
    //
    ///////////////////////////////////////////////////////////////////////////
    function onMouseMove(event) {

        var pos = screenToWorld(event);

        for(var fragId in _selectedMeshMap) {

            var offset = _selectedMeshMap[fragId].offset;

            var pos = new THREE.Vector3(
                pos.x - offset.x,
                pos.y - offset.y,
                pos.z - offset.z);

            _selectedMeshMap[fragId].proxy.position = pos;

            _selectedMeshMap[fragId].proxy.updateAnimTransform();
        }

        viewer.impl.sceneUpdated(true);
    }

    ///////////////////////////////////////////////////////////////////////////
    // screen to world coordinates conversion
    //
    ///////////////////////////////////////////////////////////////////////////
    function screenToWorld(event) {

        var screenPoint = {
            x: event.clientX,
            y: event.clientY
        };

        var n = normalizeCoords(screenPoint);

        var worldPoint = viewer.navigation.
          getWorldPoint(n.x, n.y);

        return new THREE.Vector3(
          worldPoint.x,
          worldPoint.y,
          worldPoint.z);
    }

    ///////////////////////////////////////////////////////////////////////////
    // normalize screen coordinates
    //
    ///////////////////////////////////////////////////////////////////////////
    function normalizeCoords(screenPoint) {

        var vp = viewer.navigation.getScreenViewport();

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

