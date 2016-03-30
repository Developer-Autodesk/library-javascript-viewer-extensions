

export default class ViewerToolkit {

  ///////////////////////////////////////////////////////////////////
  //
  //
  ///////////////////////////////////////////////////////////////////
  static guid(format = 'xxxx-xxxx-xxxx') {

    var d = new Date().getTime();

    var guid = format.replace(
      /[xy]/g,
      function (c) {
        var r = (d + Math.random() * 16) % 16 | 0;
        d = Math.floor(d / 16);
        return (c == 'x' ? r : (r & 0x7 | 0x8)).toString(16);
      });

    return guid;
  }

  /////////////////////////////////////////////
  //mobile detection
  //
  /////////////////////////////////////////////
  static get mobile() {

    return {

      getUserAgent: function () {
        return navigator.userAgent;
      },
      isAndroid: function () {
        return this.getUserAgent().match(/Android/i);
      },
      isBlackBerry: function () {
        return this.getUserAgent().match(/BlackBerry/i);
      },
      isIOS: function () {
        return this.getUserAgent().match(/iPhone|iPad|iPod/i);
      },
      isOpera: function () {
        return this.getUserAgent().match(/Opera Mini/i);
      },
      isWindows: function () {
        return this.isWindowsDesktop() || this.isWindowsMobile();
      },
      isWindowsMobile: function () {
        return this.getUserAgent().match(/IEMobile/i);
      },
      isWindowsDesktop: function () {
        return this.getUserAgent().match(/WPDesktop/i);
      },
      isAny: function () {

        return this.isAndroid() ||
          this.isBlackBerry() ||
          this.isIOS() ||
          this.isWindowsMobile();
      }
    }
  }

  /////////////////////////////////////////////////////////////////
  // Toolbar button
  //
  /////////////////////////////////////////////////////////////////
  static createButton(id, className, tooltip, handler) {

    var button = new Autodesk.Viewing.UI.Button(id);

    button.icon.style.fontSize = "24px";

    button.icon.className = className;

    button.setToolTip(tooltip);

    button.onClick = handler;

    return button;
  }

  /////////////////////////////////////////////////////////////////
  // Control group
  //
  /////////////////////////////////////////////////////////////////
  static createControlGroup(viewer, ctrlGroupName) {

    var viewerToolbar = viewer.getToolbar(true);

    if(viewerToolbar){

      var ctrlGroup =  new Autodesk.Viewing.UI.ControlGroup(
        ctrlGroupName);

      viewerToolbar.addControl(ctrlGroup);

      return ctrlGroup;
    }
  }

  /////////////////////////////////////////////////////////////////
  // NodeId to FragIds v < 2.5 (deprecated)
  //
  /////////////////////////////////////////////////////////////////
  static nodeIdToFragIds(model, dbId,
    recursive = true,
    instanceTree = null) {

    return new Promise(async(resolve, reject)=>{

      try{

        var it = instanceTree || model.getData().instanceTree;

        var node = it.dbIdToNode[dbId];

        if(node == undefined){
          return reject('Invalid dbId: ' + dbId);
        }

        var fragIds = [...(Array.isArray(node.fragIds) ?
          node.fragIds : [node.fragIds])
        ];

        if(node.children && recursive) {

          var getAllChildFragIds = [];

          node.children.forEach((child)=> {

            getAllChildFragIds.push(ViewerToolkit.nodeIdToFragIds(
              model, child.dbId, recursive, it));
          });

          var allChildFragIds = Promise.all(getAllChildFragIds);

          allChildFragIds.forEach((childFragIds)=>{

            fragIds = [...fragIds, childFragIds];
          });
        }

        return resolve(fragIds);
      }
      catch(ex){

        return reject(ex);
      }
    });
  }

  /////////////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////////////
  static getLeafNodes(instanceTree, dbId) {

    return new Promise(async(resolve, reject)=>{

      try{

        var leafIds = [];

        function _getLeafNodesRec(id){

          var childCount = 0;

          instanceTree.enumNodeChildren(id,
            function(childId) {
              _getLeafNodesRec(childId);
              ++childCount;
            });

          if(childCount == 0){
            leafIds.push(id);
          }
        }

        _getLeafNodesRec(dbId);

        return resolve(leafIds);
      }
      catch(ex){

        return reject(ex);
      }
    });
  }

  /////////////////////////////////////////////////////////////////
  // get node fragIds
  //
  /////////////////////////////////////////////////////////////////
  static getFragIds(model, dbId) {

    return new Promise(async(resolve, reject)=>{

      try{

        var instanceTree = model.getData().instanceTree;

        var leafIds = await ViewerToolkit.getLeafNodes(
          instanceTree,dbId);

        var fragIds = [];

        for(var i=0; i<leafIds.length; ++i){

          instanceTree.enumNodeFragments(
            leafIds[i],(fragId)=> {
              fragIds.push(fragId);
            });
        }

        return resolve(fragIds);
      }
      catch(ex){

        return reject(ex);
      }
    });
  }

  /////////////////////////////////////////////////////////////////
  // Node bounding box
  //
  /////////////////////////////////////////////////////////////////
  static getWorldBoundingBox(model, dbId) {

    return new Promise(async(resolve, reject)=>{

      try{

        var fragIds = await ViewerToolkit.getFragIds(
          model, dbId);

        if(!fragIds.length){

          return reject('No geometry, invalid dbId?');
        }

        var fragList = model.getFragmentList();

        var fragbBox = new THREE.Box3();
        var nodebBox = new THREE.Box3();

        fragIds.forEach(function(fragId) {

          fragList.getWorldBounds(fragId, fragbBox);
          nodebBox.union(fragbBox);
        });

        return resolve(nodebBox);
      }
      catch(ex){

        return reject(ex);
      }
    });
  }

  /////////////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////////////
  static drawBox(viewer, min, max, material = null) {

    var _material = material;

    if(!_material) {

      _material = new THREE.LineBasicMaterial({
        color: 0xffff00,
        linewidth: 2
      });

      viewer.impl.matman().addMaterial(
        'ADN-Material-Line',
        _material,
        true);
    }

    function drawLines(coordsArray, mat) {

      var lines = [];

      for (var i = 0; i < coordsArray.length; i+=2) {

        var start = coordsArray[i];
        var end = coordsArray[i+1];

        var geometry = new THREE.Geometry();

        geometry.vertices.push(new THREE.Vector3(
          start.x, start.y, start.z));

        geometry.vertices.push(new THREE.Vector3(
          end.x, end.y, end.z));

        geometry.computeLineDistances();

        var line = new THREE.Line(geometry, mat);

        viewer.impl.scene.add(line);

        lines.push(line);
      }

      return lines;
    }

    var lines = drawLines([

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

      _material);

    viewer.impl.sceneUpdated(true);

    return lines;
  }

  /////////////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////////////
  static getProperty(model, dbId, displayName) {

    return new Promise(async(resolve, reject)=>{

      try{
  
        model.getProperties(dbId, function(result){

          if (result.properties) {

            result.properties.forEach((prop)=>{

              if(displayName == prop.displayName){
                return resolve(prop);
              }
            });

            reject(new Error('Not Found'));
          }
          else {

            reject(new Error('Error getting properties'));
          }
        });
      }
      catch(ex){

        return reject(ex);
      }
    });
  }

  /////////////////////////////////////////////////////////////////
  // Set component material
  //
  /////////////////////////////////////////////////////////////////
  static async setMaterial(model, dbId, material) {

    var fragIds = await ViewerToolkit.getFragIds(
      model, dbId);

    fragIds.forEach((fragId)=> {

      model.getFragmentList().setMaterial(
        fragId, material);
    });
  }
}