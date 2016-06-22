/////////////////////////////////////////////////////////////////////
// Viewing.Extension.CustomTreeExtension
// by Philippe Leefsma, April 2016
//
/////////////////////////////////////////////////////////////////////
import CustomModelStructurePanel from  './Viewing.Extension.CustomModelStructure.Panel'
import ViewerToolkit from 'ViewerToolkit'
import ExtensionBase from 'ExtensionBase'

class CustomModelStructure extends ExtensionBase {

    /////////////////////////////////////////////////////////////////
    // Class constructor
    //
    /////////////////////////////////////////////////////////////////
    constructor(viewer, options) {

        super(viewer, options)
    }

    /////////////////////////////////////////////////////////////////
    // Extension Id
    //
    /////////////////////////////////////////////////////////////////
    static get ExtensionId() {

        return 'Viewing.Extension.CustomModelStructure'
    }

    /////////////////////////////////////////////////////////////////
    // Load callback
    //
    /////////////////////////////////////////////////////////////////
    async load() {

    this.panel = new CustomModelStructurePanel(
      this._viewer,
      'CustomModelStructure',
      'Custom Panel')

    this.panel.setVisible(true)

    console.log('Viewing.Extension.CustomModelStructure loaded')

    return true
}

    /////////////////////////////////////////////////////////////////
    // Unload callback
    //
    /////////////////////////////////////////////////////////////////
    unload() {

        console.log('Viewing.Extension.CustomModelStructure unloaded')

        return true
    }
}

Autodesk.Viewing.theExtensionManager.registerExtension(
  CustomModelStructure.ExtensionId,
  CustomModelStructure)