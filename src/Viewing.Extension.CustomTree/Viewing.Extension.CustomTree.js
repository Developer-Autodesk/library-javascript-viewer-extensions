/////////////////////////////////////////////////////////////////////
// Viewing.Extension.CustomTreeExtension
// by Philippe Leefsma, April 2016
//
/////////////////////////////////////////////////////////////////////
import CustomTreePanel from './Viewing.Extension.CustomTree.Panel'
import ViewerToolkit from 'ViewerToolkit'
import ExtensionBase from 'ExtensionBase'

class CustomTreeExtension extends ExtensionBase {

  /////////////////////////////////////////////////////////////////
  // Class constructor
  //
  /////////////////////////////////////////////////////////////////
  constructor(viewer, options) {

    super(viewer, options);
  }

  /////////////////////////////////////////////////////////////////
  // Extension Id
  //
  /////////////////////////////////////////////////////////////////
  static get ExtensionId() {

    return 'Viewing.Extension.CustomTree';
  }

  /////////////////////////////////////////////////////////////////
  // Load callback
  //
  /////////////////////////////////////////////////////////////////
  async load() {

    var rootNode = await ViewerToolkit.buildModelTree(
      this._viewer.model);

    this.panel = new CustomTreePanel(
      this._viewer.container, null, rootNode);

    this.panel.setVisible(true);

    console.log('Viewing.Extension.CustomTree loaded');

    return true;
  }

  /////////////////////////////////////////////////////////////////
  // Unload callback
  //
  /////////////////////////////////////////////////////////////////
  unload() {

    console.log('Viewing.Extension.CustomTree unloaded');

    return true;
  }
}

Autodesk.Viewing.theExtensionManager.registerExtension(
  CustomTreeExtension.ExtensionId,
  CustomTreeExtension);