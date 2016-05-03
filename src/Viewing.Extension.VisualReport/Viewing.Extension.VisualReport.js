/////////////////////////////////////////////////////////////////////
// Viewing.Extension.VisualReport
// by Philippe Leefsma, April 2016
//
/////////////////////////////////////////////////////////////////////
import VisualReportPanel from './Viewing.Extension.VisualReport.Panel'
import ViewerToolkit from 'ViewerToolkit'
import ExtensionBase from 'ExtensionBase'

class VisualReportExtension extends ExtensionBase {

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

    return 'Viewing.Extension.VisualReport';
  }

  /////////////////////////////////////////////////////////////////
  // Load callback
  //
  /////////////////////////////////////////////////////////////////
  async load() {

    var componentIds = await ViewerToolkit.getLeafNodes(
      this._viewer.model);

    var properties = await ViewerToolkit.getPropertyList(
      this._viewer.model,
      componentIds);

    this._panel = new VisualReportPanel(
      this._viewer,
        properties,
        componentIds
      );

    this._panel.setVisible(true);

    console.log('Viewing.Extension.VisualReport loaded');
    
    return true;
  }

  /////////////////////////////////////////////////////////////////
  // Unload callback
  //
  /////////////////////////////////////////////////////////////////
  unload() {

    this._panel.setVisible(false);

    console.log('Viewing.Extension.VisualReport unloaded');

    return true;
  }
}

Autodesk.Viewing.theExtensionManager.registerExtension(
  VisualReportExtension.ExtensionId,
  VisualReportExtension);
