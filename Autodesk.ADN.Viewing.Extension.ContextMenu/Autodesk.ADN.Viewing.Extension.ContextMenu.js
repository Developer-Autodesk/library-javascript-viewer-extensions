///////////////////////////////////////////////////////////////////////////////
// ContextMenu viewer extension
// by Philippe Leefsma, October 2014
//
// Usage Example:

/*
                //build context option 
                var contextMenuOption = {

                    //context menus when some elements are selected
                    nodeSpecificMenus : [
                        //menu item
                        {
                            title : " Write dbId to console",
                            handler : function(dbId){

                                console.log("Node-specific Menu Item clicked [dbId: " + dbId + "]");

                            }
                        },
                        //menu item
                        {
                            title : "alert dbId",
                            handler : function(dbId){
                                alert("Node-specific Menu Item clicked [dbId: " + dbId + "]");
                            }

                        } //,
                        // append your own menu item ....

                    ],
                    //context menus when nothing is selected
                    zeroSelectionMenus : [
                        //menu item
                        {
                            title : "zeroSelectionMenu Item 1",
                            handler : function(){
                                alert("zeroSelectionMenu Item 1 clicked.");
                            }
                        },
                        //menu item
                        {
                            title : "zeroSelectionMenu Item 2",
                            handler : function(){
                                alert("zeroSelectionMenu Item 2 clicked.");
                            }
                        }//,
                            // append your own menu item ....

                    ]

                };


                // load the ContextMenu extension
                viewer.loadExtension('Autodesk.ADN.Viewing.Extension.ContextMenu',contextMenuOption);





*/

///////////////////////////////////////////////////////////////////////////////
AutodeskNamespace("Autodesk.ADN.Viewing.Extension");


Autodesk.ADN.Viewing.Extension.ContextMenu = function (viewer, options) {

    Autodesk.Viewing.Extension.call(this, viewer, options);

    var contextMenuOption = options;

    var _self = this;

    var _viewer = viewer;

    var _selectedId = null;

    _self.load = function () {

        Autodesk.ADN.Viewing.Extension.AdnContextMenu = function (viewer) {
            Autodesk.Viewing.Extensions.ViewerObjectContextMenu.call(this, viewer);
        };

        Autodesk.ADN.Viewing.Extension.AdnContextMenu.prototype =
            Object.create(Autodesk.Viewing.Extensions.ViewerObjectContextMenu.prototype);

        Autodesk.ADN.Viewing.Extension.AdnContextMenu.prototype.constructor =
            Autodesk.ADN.Viewing.Extension.AdnContextMenu;

        Autodesk.ADN.Viewing.Extension.AdnContextMenu.prototype.buildMenu =

            function (event, status) {

                var menu =  Autodesk.Viewing.Extensions.ViewerObjectContextMenu.prototype.buildMenu.call(
                    this, event, status);

                if(_selectedId) {

                    for (var i = 0; i < contextMenuOption.nodeSpecificMenus.length; i++) {
                        var menuItem = contextMenuOption.nodeSpecificMenus[i];
                        
                             menu.push({
                                 title:  menuItem.title + "[dbId: " + _selectedId + "]",
                                 target: function (){
                                        menuItem.handler(_selectedId);
                                 }
                                 
                             });

                        
                    }
        
                }
                else {
                    for (var i = 0; i < contextMenuOption.zeroSelectionMenus.length; i++) {
                        var menuItem = contextMenuOption.zeroSelectionMenus[i];
                       
                             menu.push({
                                 title:  menuItem.title,
                                 target: menuItem.handler
                             });

                        
                    }

    
                }

                return menu;
            };

        _viewer.setContextMenu(
            new Autodesk.ADN.Viewing.Extension.AdnContextMenu(_viewer));

        _viewer.addEventListener(
            Autodesk.Viewing.SELECTION_CHANGED_EVENT,
            _self.onItemSelected);

        console.log('Autodesk.ADN.Viewing.Extension.ContextMenu loaded');

        return true;
    };

    _self.unload = function () {

        _viewer.setContextMenu(null);

        _viewer.removeEventListener(
            Autodesk.Viewing.SELECTION_CHANGED_EVENT,
            _self.onItemSelected);

        console.log('Autodesk.ADN.Viewing.Extension.ContextMenu unloaded');

        return true;
    };

    ///////////////////////////////////////////////////////////////////////////
    // item selected callback
    //
    ///////////////////////////////////////////////////////////////////////////
    _self.onItemSelected = function (event) {

        var dbId = event.dbIdArray[0];

        if (typeof dbId !== 'undefined') {

            _selectedId = dbId;
        }
        else  _selectedId = null;
    }
};

Autodesk.ADN.Viewing.Extension.ContextMenu.prototype =
    Object.create(Autodesk.Viewing.Extension.prototype);

Autodesk.ADN.Viewing.Extension.ContextMenu.prototype.constructor =
    Autodesk.ADN.Viewing.Extension.ContextMenu;

Autodesk.Viewing.theExtensionManager.registerExtension(
    'Autodesk.ADN.Viewing.Extension.ContextMenu',
    Autodesk.ADN.Viewing.Extension.ContextMenu);




