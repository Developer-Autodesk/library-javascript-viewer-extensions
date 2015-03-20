///////////////////////////////////////////////////////////////////////////////
// Material viewer Extension
// by Philippe Leefsma, October 2014
//
///////////////////////////////////////////////////////////////////////////////
AutodeskNamespace("Autodesk.ADN.Viewing.Extension");

Autodesk.ADN.Viewing.Extension.Material = function (viewer, options) {

    // base constructor
    Autodesk.Viewing.Extension.call(this, viewer, options);

    ///////////////////////////////////////////////////////////////////////////
    // Private members
    //
    ///////////////////////////////////////////////////////////////////////////
    var _materialMap = {};

    var _material = null;

    var _viewer = viewer;

    var _self = this;

    var _texMaterials = [];

    ///////////////////////////////////////////////////////////////////////////
    // load callback
    //
    ///////////////////////////////////////////////////////////////////////////
    _self.load = function () {

        console.log("Autodesk.ADN.Viewing.Extension.Material loaded");

        _viewer = _self.viewer;

        _material = _self.addMaterial(0xf571d6);

        _texMaterials.push(_self.addTexMaterial("public/images/textures/wood.jpg"));
        _texMaterials.push(_self.addTexMaterial("public/images/textures/steel.jpg"));
        _texMaterials.push(_self.addTexMaterial("public/images/textures/brick.jpg"));

        _viewer.addEventListener(
            Autodesk.Viewing.SELECTION_CHANGED_EVENT,
            _self.onItemSelected);

        $('<div/>').
            attr('id', 'colorPickerDivId').
            append('<input type="text" class="spectrum"/>').
            appendTo('#' + _viewer.container.id);

        $('#colorPickerDivId').css({

            'right': '25%',
            'top': '5%',
            'position':'absolute',
            'visibility':'visible',
            'z-index':'100'
        });

        $('<div/>').
            attr('id', 'tex1DivId').
            append('<a href=""><img width="30" height="30" src="public/images/textures/wood.jpg"/></a>').
            appendTo('#' + _viewer.container.id);

        $('#tex1DivId').css({

            'right': '22%',
            'top': '5%',
            'position':'absolute',
            'visibility':'visible',
            'z-index':'100'
        });

        $('#tex1DivId').click(function(e) {
                e.preventDefault();
                _material = _texMaterials[0];
            }
        );

        $('<div/>').
            attr('id', 'tex2DivId').
            append('<a href=""><img width="30" height="30" src="public/images/textures/steel.jpg"/></a>').
            appendTo('#' + _viewer.container.id);

        $('#tex2DivId').css({

            'right': '19%',
            'top': '5%',
            'position':'absolute',
            'visibility':'visible',
            'z-index':'100'
        });

        $('#tex2DivId').click(function(e) {
                e.preventDefault();
                _material = _texMaterials[1];
            }
        );

        $('<div/>').
            attr('id', 'tex3DivId').
            append('<a href=""><img width="30" height="30" src="public/images/textures/brick.jpg"/></a>').
            appendTo('#' + _viewer.container.id);

        $('#tex3DivId').css({

            'right': '16%',
            'top': '5%',
            'position':'absolute',
            'visibility':'visible',
            'z-index':'100'
        });

        $('#tex3DivId').click(function(e) {
                e.preventDefault();
                _material = _texMaterials[2];
            }
        );

        $(".spectrum").spectrum({
            color: "#f571d6",
            change: function(color) {

                var colorHexStr = color.toHexString().
                    replace('#', '0x');

                var value = parseInt(colorHexStr, 16);

                _material = _self.addMaterial(value);
            }
        });

        return true;
    };

    ///////////////////////////////////////////////////////////////////////////
    // unload callback
    //
    ///////////////////////////////////////////////////////////////////////////
    _self.unload = function () {

        console.log("Autodesk.ADN.Viewing.Extension.Material unloaded");

        _viewer.removeEventListener(
            Autodesk.Viewing.SELECTION_CHANGED_EVENT,
            _self.onItemSelected);

        $('#colorPickerDivId').remove();

        $('#tex1DivId').remove();
        $('#tex2DivId').remove();
        $('#tex3DivId').remove();

        //_self.restoreMaterials();

        return true;
    };

    ///////////////////////////////////////////////////////////////////////////
    // item selected callback
    //
    ///////////////////////////////////////////////////////////////////////////
    _self.onItemSelected = function (event) {

        _viewer.select([]);

        var fragId = event.fragIdsArray[0];

        if(typeof fragId !== 'undefined') {

            var fragIdsArray = (Array.isArray(fragId) ?
                fragId :
                [fragId]);

            fragIdsArray.forEach(function(subFragId) {

                var mesh = _viewer.impl.getRenderProxy(
                    _viewer,
                    subFragId);

                _self.setMaterial(subFragId, mesh, _material);
            });
        }
    }

    ///////////////////////////////////////////////////////////////////////////
    // set material
    //
    ///////////////////////////////////////////////////////////////////////////
    _self.setMaterial = function (fragId, mesh, material) {

        if(!_materialMap[fragId]) {

            _materialMap[fragId] = {

                material: mesh.material
            };
        }

        mesh.material = material;

        _viewer.impl.invalidate(true);
    }

    ///////////////////////////////////////////////////////////////////////////
    // add new material
    //
    ///////////////////////////////////////////////////////////////////////////
    _self.addMaterial = function (color) {

        var material = new THREE.MeshPhongMaterial({color: color});

        _viewer.impl.matman().addMaterial(
            'ADN-Material-' + newGuid(),
            material,
            true);

        return material;
    }

    _self.addTexMaterial = function(texture) {

        var tex = THREE.ImageUtils.loadTexture(
            texture);

        tex.wrapS  = THREE.RepeatWrapping;
        tex.wrapT = THREE.RepeatWrapping;

        var material = new THREE.MeshPhongMaterial({
            map: tex
        });

        _viewer.impl.matman().addMaterial(
            'adn-tex-Material-' + newGuid(),
            material,
            true);

        return material;
    }

    function newGuid () {

        var d = new Date().getTime();

        var guid = 'xxxx-xxxx-xxxx-xxxx'.replace(
            /[xy]/g,
            function (c) {
                var r = (d + Math.random() * 16) % 16 | 0;
                d = Math.floor(d / 16);
                return (c == 'x' ? r : (r & 0x7 | 0x8)).toString(16);
            });

        return guid;
    };

    ///////////////////////////////////////////////////////////////////////////
    // restore initial materials
    //
    ///////////////////////////////////////////////////////////////////////////
    _self.restoreMaterials = function () {

        for (var fragId in _materialMap) {

            var mesh = _viewer.impl.getRenderProxy(
                _viewer,
                fragId);

            mesh.material = _materialMap[fragId].material;
        };

        _materialMap = {};

        _viewer.impl.invalidate(true);
    }
};

Autodesk.ADN.Viewing.Extension.Material.prototype =
    Object.create(Autodesk.Viewing.Extension.prototype);

Autodesk.ADN.Viewing.Extension.Material.prototype.constructor =
    Autodesk.ADN.Viewing.Extension.Material;

Autodesk.Viewing.theExtensionManager.registerExtension(
    'Autodesk.ADN.Viewing.Extension.Material',
    Autodesk.ADN.Viewing.Extension.Material);

