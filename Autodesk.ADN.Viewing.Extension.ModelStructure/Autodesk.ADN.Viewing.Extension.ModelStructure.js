///////////////////////////////////////////////////////////////////////////////
// ModelStructure viewer extension
// by Philippe Leefsma, July 2015
//
///////////////////////////////////////////////////////////////////////////////
AutodeskNamespace("Autodesk.ADN.Viewing.Extension");

Autodesk.ADN.Viewing.Extension.ModelStructure = function (viewer, options) {

  Autodesk.Viewing.Extension.call(this, viewer, options);

  var _self = this;

  _self.load = function () {

    console.log('Autodesk.ADN.Viewing.Extension.ModelStructure loaded');

    getModelStructure("Root", function(root){

      console.log(root);
    });

    return true;
  };

  _self.unload = function () {

    console.log('Autodesk.ADN.Viewing.Extension.ModelStructure unloaded');
    return true;
  };

  function getModelStructureRec(node) {

    var children = [];

    if(node.children) {

      node.children.forEach(function (child) {

        children.push({
          name: child.name,
          nodeId: child.dbId,
          children: getModelStructureRec(child)
        });
      });
    }

    return children;
  }

  function getModelStructure(modelName, onSuccess) {

    var rootNode = {
      name: modelName,
      children: []
    }

    viewer.getObjectTree(function (rootComponent) {

      rootNode.children = getModelStructureRec(rootComponent.root);

      onSuccess(rootNode);
    });
  }
};

Autodesk.ADN.Viewing.Extension.ModelStructure.prototype =
  Object.create(Autodesk.Viewing.Extension.prototype);

Autodesk.ADN.Viewing.Extension.ModelStructure.prototype.constructor =
  Autodesk.ADN.Viewing.Extension.ModelStructure;

Autodesk.Viewing.theExtensionManager.registerExtension(
  'Autodesk.ADN.Viewing.Extension.ModelStructure',
  Autodesk.ADN.Viewing.Extension.ModelStructure);

