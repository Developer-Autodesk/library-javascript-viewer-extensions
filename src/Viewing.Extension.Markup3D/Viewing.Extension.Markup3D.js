/////////////////////////////////////////////////////////////////////
// Viewing.Extension.Markup3D
// by Philippe Leefsma, April 2016
//
/////////////////////////////////////////////////////////////////////
import Snap from 'imports-loader?this=>window,fix=>module.exports=0!snapsvg/dist/snap.svg.js';
import Markup3DTool from './Viewing.Extension.Markup3D.Tool'
import ExtensionBase from 'ExtensionBase'

class Markup3DExtension extends ExtensionBase {

  /////////////////////////////////////////////////////////////////
  // Class constructor
  //
  /////////////////////////////////////////////////////////////////
  constructor(viewer, options) {

    super(viewer, options);

    this.markup3DTool = new Markup3DTool(viewer);

    this._viewer.toolController.registerTool(
      this.markup3DTool);
  }

  /////////////////////////////////////////////////////////////////
  // Extension Id
  //
  /////////////////////////////////////////////////////////////////
  static get ExtensionId() {

    return 'Viewing.Extension.Markup3D';
  }

  /////////////////////////////////////////////////////////////////
  // Load callback
  //
  /////////////////////////////////////////////////////////////////
  load() {

    this._viewer.toolController.activateTool(
      this.markup3DTool.getName());

    console.log('Viewing.Extension.Markup3D loaded');

    return true;
  }

  /////////////////////////////////////////////////////////////////
  // Unload callback
  //
  /////////////////////////////////////////////////////////////////
  unload() {

    this._viewer.toolController.deactivateTool(
      this.markup3DTool.getName());

    console.log('Viewing.Extension.Markup3D unloaded');
  }

  /////////////////////////////////////////////////////////////////
  //
  //  From viewer.getState:
  //  Allow extensions to inject their state data
  //
  //  for (var extensionName in viewer.loadedExtensions) {
  //    viewer.loadedExtensions[extensionName].getState(
  //      viewerState);
  //  }
  /////////////////////////////////////////////////////////////////
  getState(viewerState) {

    this.markup3DTool.getState(
      viewerState);
  }

  /////////////////////////////////////////////////////////////////
  //
  //    From viewer.restoreState:
  //    Allow extensions to restore their data
  //
  //    for (var extensionName in viewer.loadedExtensions) {
  //      viewer.loadedExtensions[extensionName].restoreState(
  //        viewerState, immediate);
  //    }
  /////////////////////////////////////////////////////////////////
  restoreState(viewerState, immediate) {

    this.markup3DTool.restoreState(
      viewerState, immediate);
  }
}

Autodesk.Viewing.theExtensionManager.registerExtension(
  Markup3DExtension.ExtensionId,
  Markup3DExtension);