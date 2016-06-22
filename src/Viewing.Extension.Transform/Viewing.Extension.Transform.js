/////////////////////////////////////////////////////////////////////
// Viewing.Extension.CSSTVExtension
// by Philippe Leefsma, April 2016
//
/////////////////////////////////////////////////////////////////////
import TranslateTool from './Viewing.Tool.Translate'
import RotateTool from './Viewing.Tool.Rotate'
import ExtensionBase from 'ExtensionBase'
import ViewerToolkit from 'ViewerToolkit'

class TransformExtension extends ExtensionBase {

  /////////////////////////////////////////////////////////////////
  // Class constructor
  //
  /////////////////////////////////////////////////////////////////
  constructor (viewer, options) {

    super (viewer, options)

    this.translateTool = new TranslateTool(viewer)

    this._viewer.toolController.registerTool(
      this.translateTool)

    this.rotateTool = new RotateTool(viewer)

    this._viewer.toolController.registerTool(
      this.rotateTool)
  }

  /////////////////////////////////////////////////////////////////
  // Extension Id
  //
  /////////////////////////////////////////////////////////////////
  static get ExtensionId () {

    return 'Viewing.Extension.Transform'
  }

  /////////////////////////////////////////////////////////////////
  // Load callback
  //
  /////////////////////////////////////////////////////////////////
  load () {

    this._txControl = ViewerToolkit.createButton(
      'toolbar-translate',
      'fa fa-arrows-alt',
      'Translate Tool', () => {

        var toolName = this.translateTool.getName()

        if (this.translateTool.active) {

          this._viewer.toolController.deactivateTool(toolName)
          this._txControl.container.classList.remove('active')

        } else {

          this._viewer.toolController.activateTool(toolName)
          this._txControl.container.classList.add('active')
        }
      })

    this._rxControl = ViewerToolkit.createButton(
      'toolbar-rotate',
      'fa fa-refresh',
      'Rotate Tool', () => {

        var toolName = this.rotateTool.getName()

        if (this.rotateTool.active) {

          this._viewer.toolController.deactivateTool(toolName)
          this._rxControl.container.classList.remove('active')

        } else {

          this._viewer.toolController.activateTool(toolName)
          this._rxControl.container.classList.add('active')
        }
      })

    this.parentControl = this._options.parentControl

    if (!this.parentControl) {

      var viewerToolbar = this._viewer.getToolbar(true)

      this.parentControl = new Autodesk.Viewing.UI.ControlGroup(
        'transform')

      viewerToolbar.addControl(this.parentControl)
    }

    this.parentControl.addControl(
      this._txControl)

    this.parentControl.addControl(
      this._rxControl)

    console.log('Viewing.Extension.Transform loaded')

    return true
  }

  /////////////////////////////////////////////////////////////////
  // Unload callback
  //
  /////////////////////////////////////////////////////////////////
  unload () {

    this.parentControl.removeControl(
      this._txControl)

    this.parentControl.removeControl(
      this._rxControl)

    this._viewer.toolController.deactivateTool(
      this.translateTool.getName())

    this._viewer.toolController.deactivateTool(
      this.rotateTool.getName())

    console.log('Viewing.Extension.Transform unloaded')
  }
}

Autodesk.Viewing.theExtensionManager.registerExtension(
  TransformExtension.ExtensionId,
  TransformExtension)
