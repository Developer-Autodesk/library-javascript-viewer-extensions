//This extension applies view and data API v1.2.3 


'use strict';

AutodeskNamespace("Autodesk.ADN.Viewing.Extension");

Autodesk.ADN.Viewing.Extension.ToolbarExt = function (viewer, options) {

	//
    Autodesk.Viewing.Extension.call(this, viewer, options);


    ////////////////////////////
    // 
    // private variables
    //
    ////////////////////////////
    var _viewer = viewer;

    var _self = this;

    var _divToolbar = null;
    var _orangeButton = null;

    var _mainViewerSubToolbar = null;

    var _canvasToolbar = null;
    
    var toolbarConfiguration = null;
 




    _self.load = function () {

        if (!options || !options.toolbars) {
            console.error('toolbarConfiguration is not found, exiting...');
            return false;

        }



    	//create the toolbars
        _self.createToolbar();

        //add toolbars to UI


        console.log('Autodesk.ADN.Viewing.Extension.ToolbarExt loaded');

        return true;
    };


    _self.createToolbar = function() {

       toolbarConfiguration = options;

   
       //Create each toolbars in toolbar configuration
       for (var i = 0; i < toolbarConfiguration.toolbars.length; i++) {
          
            //get the toolbar config item
            var toolbarItemCfg = toolbarConfiguration.toolbars[i];

            // create a new subToolbar as part of the standard viewer's toolbars.  We will use
            // transparent images for the tool buttons to match the standard style.

            if (toolbarItemCfg.toolbar_type == 'viewer_subToolbar') {
              
                // get the main toolbar from the viewer
                var mainToolbar = _viewer.getToolbar(true);     

                console.assert(mainToolbar != null);

                var  mainViewerSubToolbar = new Autodesk.Viewing.UI.ControlGroup(toolbarItemCfg.id);
        
                // create buttons and add to toolbar
                _self.createButtons(toolbarItemCfg,mainViewerSubToolbar);
                   
               
                mainToolbar.addControl(mainViewerSubToolbar);



            }
            // create toolbar in viewer canvas

            else if(toolbarItemCfg.toolbar_type == 'viewer_canvas'){

                var canvasToolbar = new Autodesk.Viewing.UI.ToolBar(toolbarItemCfg.id);

                if (typeof toolbarItemCfg.style_class !== 'undefined' || 
                    toolbarItemCfg.style_class !== ''
                    ) {
                    // we need to add a class to this container so we can reposition where we want (see CSS class above)
                    canvasToolbar.addClass(toolbarItemCfg.style_class);   
                }
                else
                {
                    //set default class to this container for the toolbar
                    canvasToolbar.style = 'display: block; position: absolute; left: 0px; top: 0px;';
                }
                

                // create buttons and add to toolbar
                _self.createButtons(toolbarItemCfg, canvasToolbar);

                var html = '<div id="adnextensions_toolbar_canvas_div" ';
                html = html + 'style="position: absolute; top: 10px; left: 0px; z-index: 200;"></div>';
                var htmlDivContainer = $(html)[0];

                htmlDivContainer.appendChild(canvasToolbar.container);

                _viewer.container.appendChild(htmlDivContainer);
 

            }
            //create toolbar in a custom div container

            else if(toolbarItemCfg.toolbar_type == 'custom_container'){

                
                if (!toolbarItemCfg.toolbar_container ){
                    var errMsg = 'toolbar_container is not found. \n';
                    errMsg = errMsg + 'For toolbar_type=custom_container, you must difine a container on ';
                    errMsg = errMsg + 'you web page, and specifiy the id of this container to ';
                    errMsg = errMsg + 'toolbar_container property of toolbar configuration';
                    console.error(errMsg);
                    
                    return false;
                }

                //the container div

                var toolbarContainer = document.getElementById(toolbarItemCfg.toolbar_container);
                if (!toolbarContainer) {
                    var errMsg = 'the toolbar container element with id "'
                    +toolbarItemCfg.toolbar_container+'" is not found in web page.';
                    console.error(errMsg);
                    return false;

                }


                var divToolbar = new Autodesk.Viewing.UI.ToolBar(toolbarItemCfg.id);

                if (typeof toolbarItemCfg.style_class !== 'undefined' || 
                    toolbarItemCfg.style_class !== ''
                    ) {
                    // we need to add a class to this container so we can reposition where we want (see CSS class above)
                    divToolbar.addClass(toolbarItemCfg.style_class);   
                }
                else
                {
                    //set default class to this container for the toolbar
                    divToolbar.style = 'display: block; position: absolute; left: 0px; top: 0px;';
                }
                

                // create buttons and add to toolbar
                _self.createButtons(toolbarItemCfg, divToolbar);

                var html = '<div id="adnextensions_toolbar_canvas_div" ';
                html = html + 'style="position: absolute; top: 10px; left: 0px; z-index: 200;"></div>';
                var htmlDivContainer = $(html)[0];

                htmlDivContainer.appendChild(divToolbar.container);

                //append to the toolbar container
                toolbarContainer.appendChild(htmlDivContainer);
 

            }
            else{
            console.error('unsupported toolbar type.');
            }


       }

        

        
    };

    _self.createButtons = function(toolbarItemCfg, toobar){

        for (var j = 0; j < toolbarItemCfg.buttons.length; j++) {
            var buttonCfg = toolbarItemCfg.buttons[j];

            var buttonId = buttonCfg.id ? buttonCfg.id : 'viewer_toolbar_button_' + j;
            var button1 = new Autodesk.Viewing.UI.Button(buttonId);
            

            //set backgroud image
            if (typeof buttonCfg.backgroundImage !== 'undefined'){
                button1.icon.style.backgroundImage = 'url('+ buttonCfg.backgroundImage +')';
            }

            //set button tooltip
            if (typeof buttonCfg.tooltip !== 'undefined'){
                button1.setToolTip(buttonCfg.tooltip);
            }

            //set button style class
            if (typeof buttonCfg.style_class !== 'undefined'){
                button1.addClass(buttonCfg.style_class);
            }

            //set botton visiblity status
            if (typeof buttonCfg.visible !== 'undefined'){
                button1.setVisible(buttonCfg.visible);
            }

            button1.onClick = buttonCfg.onClick;

            toobar.addControl(button1);

        }
    };



    _self.removeToolbar = function(){

        toolbarConfiguration = options.toolbarConfiguration;

       

       for (var i = 0; i < toolbarConfiguration.toolbars.length; i++) {
          
            var toolbarItemCfg = toolbarConfiguration.toolbars[i];

            if (toolbarItemCfg.toolbar_type == 'viewer_subToolbar') {
              
                // get the main toolbar from the viewer
                var mainToolbar = _viewer.getToolbar(true);     

                console.assert(mainToolbar != null);

                // this will remove the entire group and take out the corresponding HTML
                mainToolbar.removeControl(toolbarItemCfg.id);   



            }
            //
            else if(toolbarItemCfg.toolbar_type == 'viewer_canvas'){

                $('#adnextensions_toolbar_canvas_div').remove();
            }
            //
            else if(toolbarItemCfg.toolbar_type == 'custom_container'){

                var id = toolbarItemCfg.toolbar_container;
                $('#'+id).remove();

            }
            else{
            console.error('unsupported toolbar type when unloading.');
            }

          
        

       }
    };


    _self.unload = function () {

       // Remove boolbars from UI
        _self.removeToolbar();

        console.log('Autodesk.ADN.Viewing.Extension.ToolbarExt unloaded');

        return true;
    };


};

Autodesk.ADN.Viewing.Extension.ToolbarExt.prototype =
    Object.create(Autodesk.Viewing.Extension.prototype);

Autodesk.ADN.Viewing.Extension.ToolbarExt.prototype.constructor =
    Autodesk.ADN.Viewing.Extension.ToolbarExt;

Autodesk.Viewing.theExtensionManager.registerExtension(
    'Autodesk.ADN.Viewing.Extension.ToolbarExt',  //extension id
    Autodesk.ADN.Viewing.Extension.ToolbarExt);

