///////////////////////////////////////////////////////////////////////////////
// Connect viewer extension
// by Philippe Leefsma, October 2014
//
///////////////////////////////////////////////////////////////////////////////
AutodeskNamespace("Autodesk.ADN.Viewing.Extension");

Autodesk.ADN.Viewing.Extension.Connect = function (viewer, options) {

    Autodesk.Viewing.Extension.call(this, viewer, options);

    var _connectedExtensionsMap = {};

    var _self = this;

    _self.guid = guid();
        
    _self.connectId = 'Autodesk.ADN.Viewing.Extension.Connect';
    
    /////////////////////////////////////////////
    //
    //
    /////////////////////////////////////////////
    _self.load = function () {

        options.connect(_self);

        console.log('Autodesk.ADN.Viewing.Extension.Connect loaded');

        return true;
    };

    /////////////////////////////////////////////
    //
    //
    /////////////////////////////////////////////
    _self.unload = function () {

        options.disconnect(_self);

        console.log('Autodesk.ADN.Viewing.Extension.Connect unloaded');

        return true;
    };

    /////////////////////////////////////////////
    //
    //
    /////////////////////////////////////////////
    _self.onConnect = function (extension) {

        _connectedExtensionsMap[extension.guid] = extension;

        console.log('Connect Request from: ' + extension.guid);
    };

    /////////////////////////////////////////////
    //
    //
    /////////////////////////////////////////////
    _self.onDisconnect = function (extension) {

        delete _connectedExtensionsMap[extension.guid];

        console.log('Disconnect Request from: ' + extension.guid);
    };

    /////////////////////////////////////////////
    //
    //
    /////////////////////////////////////////////
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
    };
};

Autodesk.ADN.Viewing.Extension.Connect.prototype =
    Object.create(Autodesk.Viewing.Extension.prototype);

Autodesk.ADN.Viewing.Extension.Connect.prototype.constructor =
    Autodesk.ADN.Viewing.Extension.Connect;

Autodesk.Viewing.theExtensionManager.registerExtension(
    'Autodesk.ADN.Viewing.Extension.Connect',
    Autodesk.ADN.Viewing.Extension.Connect);

