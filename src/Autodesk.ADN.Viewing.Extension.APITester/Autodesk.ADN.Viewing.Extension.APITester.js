///////////////////////////////////////////////////////////////////////////////
// Basic viewer extension
// by Philippe Leefsma, October 2014
//
///////////////////////////////////////////////////////////////////////////////
AutodeskNamespace("Autodesk.ADN.Viewing.Extension");

Autodesk.ADN.Viewing.Extension.APITester = function (viewer, options) {

  Autodesk.Viewing.Extension.call(this, viewer, options);

  var _self = this;

  _self.load = function () {

    viewer.utilities.getHitPoint2 = function(x, y) {

      y = 1.0 - y;
      x = x * 2.0 - 1.0;
      y = y * 2.0 - 1.0;

      var vpVec = new THREE.Vector3(x, y, 1);

      var result = this.viewerImpl.hitTestViewport(vpVec, false);

      return result;
    };

    $(viewer.container).bind("click", onMouseClick);

    viewer.addEventListener(
      Autodesk.Viewing.SELECTION_CHANGED_EVENT,
      onItemSelected);

    console.log('Autodesk.ADN.Viewing.Extension.APITester loaded');

    return true;
  }

  _self.unload = function () {

    console.log('Autodesk.ADN.Viewing.Extension.APITester unloaded');

    return true;
  }

  function test(){

    var fragList = viewer.model.getFragmentList();

    //console.log(fragList)
  }

  function onItemSelected(event) {

    console.log(event.fragIdsArray)

    var fragId = event.fragIdsArray[0];

    var fragProxy = viewer.impl.getFragmentProxy(
      viewer.model,
      fragId);

    var renderProxy = viewer.impl.getRenderProxy(
      viewer.model,
      fragId);

    fragProxy.visible = false;
  }

  function onMouseClick(event) {

    //var screenPoint = {
    //  x: event.clientX,
    //  y: event.clientY
    //};
    //
    //var viewport =
    //  viewer.navigation.getScreenViewport();
    //
    //var n = {
    //  x: (screenPoint.x - viewport.left) / viewport.width,
    //  y: (screenPoint.y - viewport.top) / viewport.height
    //};
    //
    //var hitPoint = viewer.utilities.getHitPoint2(
    //  n.x,
    //  n.y);
    //
    //console.log(hitPoint);
  };
};

Autodesk.ADN.Viewing.Extension.APITester.prototype =
  Object.create(Autodesk.Viewing.Extension.prototype);

Autodesk.ADN.Viewing.Extension.APITester.prototype.constructor =
  Autodesk.ADN.Viewing.Extension.APITester;

Autodesk.Viewing.theExtensionManager.registerExtension(
  'Autodesk.ADN.Viewing.Extension.APITester',
  Autodesk.ADN.Viewing.Extension.APITester);

