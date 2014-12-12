///////////////////////////////////////////////////////////////////////////////
// RadialGraph viewer Extension
// by Philippe Leefsma, December 2014
//
///////////////////////////////////////////////////////////////////////////////
AutodeskNamespace("Autodesk.ADN.Viewing.Extension");

Autodesk.ADN.Viewing.Extension.RadialGraph = function (viewer, options) {

    // base constructor
    Autodesk.Viewing.Extension.call(this, viewer, options);

    ///////////////////////////////////////////////////////////////////////////
    // Private members
    //
    ///////////////////////////////////////////////////////////////////////////
    var _viewer = viewer;

    var _self = this;

    var _graph = null;

    var _data = {};

    var _id = 0;

    ///////////////////////////////////////////////////////////////////////////
    // load callback
    //
    ///////////////////////////////////////////////////////////////////////////
    _self.load = function () {

        $('#mainLayoutId').layout().show('east');

        _viewer.getObjectTree(function(rootComponent) {

            _data = _self.getGraphNodeRec(rootComponent);

            _graph = _self.loadGraph(_data);
        });

        _viewer.onResize = function() {

            _graph = _self.loadGraph(_data);
        }

        console.log("Autodesk.ADN.Viewing.Extension.RadialGraph loaded");

        return true;
    };

    ///////////////////////////////////////////////////////////////////////////
    // unload callback
    //
    ///////////////////////////////////////////////////////////////////////////
    _self.unload = function () {

        _viewer.onResize = null;

        $('#mainLayoutId').layout().hide('east');

        $('#center-container').remove();

        console.log("Autodesk.ADN.Viewing.Extension.RadialGraph unloaded");

        return true;
    };

    ///////////////////////////////////////////////////////////////////////////
    // get graph node data
    //
    ///////////////////////////////////////////////////////////////////////////
    _self.getGraphNodeRec = function (component) {

        var node = {
            id: component.dbId.toString() + '_' + _id++,
            name: component.name,
            children: []
        }

        if(component.children) {

            for (var i = 0; i < component.children.length; i++) {

                var child = component.children[i];

                node.children.push(_self.getGraphNodeRec(child));
            };
        }

        return node;
    }

    ///////////////////////////////////////////////////////////////////////////
    // load graph
    //
    ///////////////////////////////////////////////////////////////////////////
    _self.loadGraph = function(data){

        $('#center-container').remove();

        $('#eastLayoutId').
            append('<div id="center-container" style="width: 100%; height: 100%"></div>');

        $('#center-container').
            append('<div id="infovis" style="width: 100%; height: 100%"></div>');

        $('#infovis').css({
            'color':'#FFFFFF'
        });

        //init RGraph
        var rgraph = new $jit.RGraph({

            //Where to append the visualization
            injectInto: 'infovis',
            //Optional: create a background canvas that plots
            //concentric circles.
            background: {
                CanvasStyles: {
                    strokeStyle: '#555'
                }
            },
            //Add navigation capabilities:
            //zooming by scrolling and panning.
            Navigation: {
                enable: true,
                panning: true,
                zooming: 10
            },
            //Set Node and Edge styles.
            Node: {
                color: '#11eeff'
            },

            Edge: {
                color: '#C17878',
                lineWidth:1.5
            },

            onBeforeCompute: function(node){

                var dbId = parseInt(node.id.split('_')[0]);

                _viewer.isolateById(dbId);

                _viewer.fitToView(dbId);
            },

            //Add the name of the node in the correponding label
            //and a click handler to move the graph.
            //This method is called once, on label creation.
            onCreateLabel: function(domElement, node){
                domElement.innerHTML = node.name;
                domElement.onclick = function(){
                    rgraph.onClick(node.id, {
                        onComplete: function() {
                            //Log.write("done");
                        }
                    });
                };
            },

            //Change some label dom properties.
            //This method is called each time a label is plotted.
            onPlaceLabel: function(domElement, node){

                var style = domElement.style;

                style.cursor = 'pointer';

                if (node._depth <= 1) {

                    style.fontSize = "0.8em";
                    style.color = "#000000";

                } else if(node._depth == 2){

                    style.fontSize = "0.7em";
                    style.color = "#494949";

                } else {

                    style.display = 'none';
                }

                var left = parseInt(style.left);
                var w = domElement.offsetWidth;

                style.left = (left - w / 2) + 'px';
            }
        });

        //load JSON data
        rgraph.loadJSON(data);

        //trigger small animation
        rgraph.graph.eachNode(function(n) {
            var pos = n.getPos();
            pos.setc(-200, -200);
        });

        rgraph.compute('end');

        rgraph.fx.animate({
            modes:['polar'],
            duration: 2000
        });

        return rgraph;
    }
};

Autodesk.ADN.Viewing.Extension.RadialGraph.prototype =
    Object.create(Autodesk.Viewing.Extension.prototype);

Autodesk.ADN.Viewing.Extension.RadialGraph.prototype.constructor =
    Autodesk.ADN.Viewing.Extension.RadialGraph;

Autodesk.Viewing.theExtensionManager.registerExtension(
    'Autodesk.ADN.Viewing.Extension.RadialGraph',
    Autodesk.ADN.Viewing.Extension.RadialGraph);

