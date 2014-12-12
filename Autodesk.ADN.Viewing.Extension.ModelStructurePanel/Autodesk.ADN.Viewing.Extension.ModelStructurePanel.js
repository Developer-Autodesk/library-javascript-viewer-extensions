///////////////////////////////////////////////////////////////////////////////
// PropertyPanel viewer Extension
// by Philippe Leefsma, October 2014
//
///////////////////////////////////////////////////////////////////////////////
AutodeskNamespace("Autodesk.ADN.Viewing.Extension");

/**
 * SampleModelStructurePanel is a simple model structure panel that on click, selects
 * the node, and on control-modifier + hover, isolates the node.
 */

Autodesk.ADN.Viewing.Extension.ModelStructurePanel = function (viewer, options) {

    // base constructor
    Autodesk.Viewing.Extension.call(this, viewer, options);

    var _viewer = viewer;

    var _self = this;

    var _panel = null;

    ///////////////////////////////////////////////////////////////////////////
    // load callback
    //
    ///////////////////////////////////////////////////////////////////////////
    _self.load = function () {

        Autodesk.ADN.Viewing.Extension.AdnModelStructurePanel =
            function (viewer, title, options) {

                _self = this;

                _self.viewer = viewer;

                Autodesk.Viewing.UI.ModelStructurePanel.call(
                    _self,
                    viewer.container,
                    'AdnModelStructurePanel',
                    title,
                    options);

                _self.isMac = (navigator.userAgent.search("Mac OS") !== -1);
            };

        Autodesk.ADN.Viewing.Extension.AdnModelStructurePanel.prototype =
            Object.create(Autodesk.Viewing.UI.ModelStructurePanel.prototype);

        Autodesk.ADN.Viewing.Extension.AdnModelStructurePanel.prototype.constructor =
            Autodesk.ADN.Viewing.Extension.AdnModelStructurePanel;

        /**
         * Override initialize to listen for the selection
         * changed event to update this panel automatically
         */
        Autodesk.ADN.Viewing.Extension.AdnModelStructurePanel.prototype.
            initialize = function () {

                Autodesk.Viewing.UI.ModelStructurePanel.prototype.initialize.call(_self);

                _self.viewer.addEventListener(
                    Autodesk.Viewing.SELECTION_CHANGED_EVENT,
                    function (event) {
                        _self.setSelection(event.nodeArray);
                    });
            }

        Autodesk.ADN.Viewing.Extension.AdnModelStructurePanel.prototype.
            ctrlDown = function (event) {

                return (_self.isMac && event.metaKey) ||
                    (!_self.isMac && event.ctrlKey);
            }

        /**
         * Override onHover to isolate the given node
         * when the control modifier is pressed
         */
        Autodesk.ADN.Viewing.Extension.AdnModelStructurePanel.prototype.
            onHover = function (node, event) {

                if (_self.ctrlDown(event)) {

                    _self.viewer.isolate([node]);
                }
            };

        /**
         * Override onClick to select the given node
         */
        Autodesk.ADN.Viewing.Extension.AdnModelStructurePanel.prototype.
            onClick = function (node, event) {

                _self.viewer.isolate([]);

                _self.viewer.select([node.dbId]);
            }

        _panel = new Autodesk.ADN.Viewing.Extension.AdnModelStructurePanel(
            _viewer);

        _viewer.setModelStructurePanel(_panel);

        console.log("Autodesk.ADN.Viewing.Extension.ModelStructurePanel loaded");

        return true;
    };

    ///////////////////////////////////////////////////////////////////////////
    // unload callback
    //
    ///////////////////////////////////////////////////////////////////////////
    _self.unload = function () {

        _viewer.setModelStructurePanel(null);

        console.log("Autodesk.ADN.Viewing.Extension.ModelStructurePanel unloaded");

        return true;
    };
};

Autodesk.ADN.Viewing.Extension.ModelStructurePanel.prototype =
    Object.create(Autodesk.Viewing.Extension.prototype);

Autodesk.ADN.Viewing.Extension.ModelStructurePanel.prototype.constructor =
    Autodesk.ADN.Viewing.Extension.ModelStructurePanel;

Autodesk.Viewing.theExtensionManager.registerExtension(
    'Autodesk.ADN.Viewing.Extension.ModelStructurePanel',
    Autodesk.ADN.Viewing.Extension.ModelStructurePanel);