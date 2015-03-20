///////////////////////////////////////////////////////////////////////////////
// BoundingBox viewer extension
// by Philippe Leefsma, March 2015
//
///////////////////////////////////////////////////////////////////////////////
AutodeskNamespace("Autodesk.ADN.Viewing.Extension");

Autodesk.ADN.Viewing.Extension.BoundingBox = function (viewer, options) {

    Autodesk.Viewing.Extension.call(this, viewer, options);

    var _self = this;

    var _viewer = viewer;

    _self.load = function () {

        _viewer.addEventListener(
            Autodesk.Viewing.SELECTION_CHANGED_EVENT,
            _self.onItemSelected);

        console.log('Autodesk.ADN.Viewing.Extension.BoundingBox loaded');
        return true;
    };

    _self.unload = function () {

        _viewer.removeEventListener(
            Autodesk.Viewing.SELECTION_CHANGED_EVENT,
            _self.onItemSelected);

        console.log('Autodesk.ADN.Viewing.Extension.BoundingBox unloaded');
        return true;
    };

    _self.onItemSelected = function (event) {

        console.log(event);

        _viewer.select([]);

        event.nodeArray.forEach(function(node) {

            var bb = _self.getBoundingBox(node);

            drawBox(bb.min, bb.max);
        });
    }

    _self.getBoundingBox = function (node) {

        var fragIds = (Array.isArray(node.fragIds) ?
            node.fragIds :
            [node.fragIds]);

        var minPt = {
            x: Number.MAX_VALUE,
            y: Number.MAX_VALUE,
            z: Number.MAX_VALUE
        };

        var maxPt = {
            x: Number.MIN_VALUE,
            y: Number.MIN_VALUE,
            z: Number.MIN_VALUE
        };

        fragIds.forEach(function(fragId) {

            var mesh = _viewer.impl.getRenderProxy(
                _viewer,
                fragId);

            var bb = mesh.geometry.boundingBox;

            var fragMinPt = new THREE.Vector3(
                bb.min.x,
                bb.min.y,
                bb.min.z);

            var fragMaxPt = new THREE.Vector3(
                bb.max.x,
                bb.max.y,
                bb.max.z);

            fragMinPt.applyMatrix4(mesh.matrixWorld);
            fragMaxPt.applyMatrix4(mesh.matrixWorld);

            maxPt = max(maxPt, fragMaxPt);
            maxPt = max(maxPt, fragMinPt);

            minPt = min(minPt, fragMaxPt);
            minPt = min(minPt, fragMinPt);
        });

        return { min: minPt, max: maxPt };
    }

    function max(v1, v2) {

        return {
            x: Math.max(v1.x, v2.x),
            y: Math.max(v1.y, v2.y),
            z: Math.max(v1.z, v2.z)
        };
    }

    function min(v1, v2) {

        return {
            x: Math.min(v1.x, v2.x),
            y: Math.min(v1.y, v2.y),
            z: Math.min(v1.z, v2.z)
        };
    }

    function drawLines(coordsArray, material) {

        for (var i = 0; i < coordsArray.length; i+=2) {

            var start = coordsArray[i];
            var end = coordsArray[i+1];

            var geometry = new THREE.Geometry();

            geometry.vertices.push(new THREE.Vector3(
                start.x, start.y, start.z));

            geometry.vertices.push(new THREE.Vector3(
                end.x, end.y, end.z));

            geometry.computeLineDistances();

            var line = new THREE.Line(geometry, material);

            _viewer.impl.scene.add(line);
        }
    }

    function drawBox(min, max) {

        var material = new THREE.LineBasicMaterial({
            color: 0xffff00,
            //opacity: 1.0,
            linewidth: 5
        });

        _viewer.impl.matman().addMaterial(
            'ADN-Material-Line',
            material,
            true);

        drawLines([

            {x: min.x, y: min.y, z: min.z},
            {x: max.x, y: min.y, z: min.z},

            {x: max.x, y: min.y, z: min.z},
            {x: max.x, y: min.y, z: max.z},

            {x: max.x, y: min.y, z: max.z},
            {x: min.x, y: min.y, z: max.z},

            {x: min.x, y: min.y, z: max.z},
            {x: min.x, y: min.y, z: min.z},

            {x: min.x, y: max.y, z: max.z},
            {x: max.x, y: max.y, z: max.z},

            {x: max.x, y: max.y, z: max.z},
            {x: max.x, y: max.y, z: min.z},

            {x: max.x, y: max.y, z: min.z},
            {x: min.x, y: max.y, z: min.z},

            {x: min.x, y: max.y, z: min.z},
            {x: min.x, y: max.y, z: max.z},

            {x: min.x, y: min.y, z: min.z},
            {x: min.x, y: max.y, z: min.z},

            {x: max.x, y: min.y, z: min.z},
            {x: max.x, y: max.y, z: min.z},

            {x: max.x, y: min.y, z: max.z},
            {x: max.x, y: max.y, z: max.z},

            {x: min.x, y: min.y, z: max.z},
            {x: min.x, y: max.y, z: max.z}],

            material);

        _viewer.impl.invalidate(true);
    }
};

Autodesk.ADN.Viewing.Extension.BoundingBox.prototype =
    Object.create(Autodesk.Viewing.Extension.prototype);

Autodesk.ADN.Viewing.Extension.BoundingBox.prototype.constructor =
    Autodesk.ADN.Viewing.Extension.BoundingBox;

Autodesk.Viewing.theExtensionManager.registerExtension(
    'Autodesk.ADN.Viewing.Extension.BoundingBox',
    Autodesk.ADN.Viewing.Extension.BoundingBox);

