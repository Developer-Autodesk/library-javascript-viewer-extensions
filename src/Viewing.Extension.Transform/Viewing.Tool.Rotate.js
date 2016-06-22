import EventsEmitter from 'EventsEmitter'

export default class RotateTool extends EventsEmitter {

  /////////////////////////////////////////////////////////////////
  // Class constructor
  //
  /////////////////////////////////////////////////////////////////
  constructor (viewer) {

    super()

    this.keys = {}

    this.active = false

    this._viewer = viewer

    this._viewer.toolController.registerTool(this)

    this.onAggregateSelectionChangedHandler = (e) => {

      this.onAggregateSelectionChanged(e)
    }
  }

  /////////////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////////////
  enable(enable) {

    var name = this.getName()

    if(enable) {

      this._viewer.toolController.activateTool(name)
    }
    else {

      this._viewer.toolController.deactivateTool(name)
    }
  }

  /////////////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////////////
  getNames() {

    return ["Viewing.Rotate.Tool"]
  }

  /////////////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////////////
  getName() {

    return "Viewing.Rotate.Tool"
  }

  ///////////////////////////////////////////////////////////////////////////
  // Creates a dummy mesh to attach control to
  //
  ///////////////////////////////////////////////////////////////////////////
  createTransformMesh() {

    var material = new THREE.MeshPhongMaterial(
      { color: 0xff0000 })

    this._viewer.impl.matman().addMaterial(
      'transform-tool-material',
      material,
      true)

    var sphere = new THREE.Mesh(
      new THREE.SphereGeometry(0.0001, 5),
      material)

    sphere.position.set(0, 0, 0)

    return sphere
  }

  ///////////////////////////////////////////////////////////////////
  //
  //
  ///////////////////////////////////////////////////////////////////
  activate() {

    this.active = true

    this._viewer.addEventListener(
      Autodesk.Viewing.AGGREGATE_SELECTION_CHANGED_EVENT,
      this.onAggregateSelectionChangedHandler)
  }

  ///////////////////////////////////////////////////////////////////////////
  // deactivate tool
  //
  ///////////////////////////////////////////////////////////////////////////
  deactivate() {

    this.active = false

    this._viewer.removeEventListener(
      Autodesk.Viewing.AGGREGATE_SELECTION_CHANGED_EVENT,
      this.onAggregateSelectionChangedHandler)
  }

  ///////////////////////////////////////////////////////////////////////////
  //
  //
  ///////////////////////////////////////////////////////////////////////////
  onAggregateSelectionChanged(event) {

    if (event.selections && event.selections.length) {

      var selection = event.selections[ 0 ]

      this.selection = selection

      if(this._fullTransform) {

        this.selection.fragIdsArray = []

        var fragCount = selection.model.getFragmentList().
          fragments.fragId2dbId.length

        for (var fragId = 0; fragId < fragCount; ++fragId) {

          this.selection.fragIdsArray.push(fragId)
        }
      }

      this.drawAxis()

    } else {

      this.selection = null

      if (this.axisHelper) {

        this.axisHelper.remove()

        this._viewer.fitToView()
      }
    }
  }

  ///////////////////////////////////////////////////////////////////////////
  //
  //
  ///////////////////////////////////////////////////////////////////////////
  drawAxis () {

    var bBox = this.geWorldBoundingBox(
      this.selection.fragIdsArray,
      this.selection.model.getFragmentList())

    this.center = new THREE.Vector3(
      (bBox.min.x + bBox.max.x) / 2,
      (bBox.min.y + bBox.max.y) / 2,
      (bBox.min.z + bBox.max.z) / 2)

    var size = Math.max(
        bBox.max.x - bBox.min.x,
        bBox.max.y - bBox.min.y,
        bBox.max.z - bBox.min.z) * 1.2

    if (this.axisHelper) {

      this.axisHelper.remove()
    }

    this.axisHelper = new AxisHelper(
      this._viewer, this.center, size)

    this._viewer.fitToView()
  }

  ///////////////////////////////////////////////////////////////////////////
  //
  //
  ///////////////////////////////////////////////////////////////////////////
  handleButtonDown (event, button) {

    if (button === 0 && this.keys.Control) {

      this.isDragging = true

      this.mousePos = {
        x: event.clientX,
        y: event.clientY
      }
    }

    return false
  }

  ///////////////////////////////////////////////////////////////////////////
  //
  //
  ///////////////////////////////////////////////////////////////////////////
  handleButtonUp (event, button) {

    if(button === 0) {

      this.isDragging = false
    }

    return false
  }

  ///////////////////////////////////////////////////////////////////////////
  //
  //
  ///////////////////////////////////////////////////////////////////////////
  handleMouseMove(event) {

    if (this.isDragging) {

      if (this.selection) {

        var offset = {
          x: this.mousePos.x - event.clientX,
          y: event.clientY - this.mousePos.y
        }

        var angle = Math.sqrt(
          offset.x * offset.x +
          offset.y * offset.y)

        var sidewaysDirection = new THREE.Vector3()
        var moveDirection = new THREE.Vector3()
        var eyeDirection = new THREE.Vector3()
        var upDirection = new THREE.Vector3()
        var camera = this._viewer.getCamera()
        var axis = new THREE.Vector3()
        var eye = new THREE.Vector3()

        eye.copy(camera.position).sub(camera.target)

        eyeDirection.copy(eye).normalize()

        upDirection.copy(camera.up).normalize()

        sidewaysDirection.crossVectors(
          upDirection, eyeDirection).normalize()

        upDirection.setLength(offset.y)

        sidewaysDirection.setLength(offset.x)

        moveDirection.copy(
          upDirection.add(
            sidewaysDirection))

        axis.crossVectors(moveDirection, eye).normalize()

        this.rotateFragments(
          this.selection.model,
          this.selection.fragIdsArray,
          axis, angle * 0.05 * Math.PI / 180,
          this.center)

        this._viewer.impl.sceneUpdated(true)
      }

      return true
    }

    return false
  }

  ///////////////////////////////////////////////////////////////////////////
  //
  //
  ///////////////////////////////////////////////////////////////////////////
  handleKeyDown (event, keyCode) {

    this.keys[event.key] = true

    return false
  }

  ///////////////////////////////////////////////////////////////////////////
  //
  //
  ///////////////////////////////////////////////////////////////////////////
  handleKeyUp (event, keyCode) {

    this.keys[event.key] = false

    return false
  }

  ///////////////////////////////////////////////////////////////////////////
  //
  //
  ///////////////////////////////////////////////////////////////////////////
  rotateFragments (model, fragIdsArray, axis, angle, center) {

    var quaternion = new THREE.Quaternion()

    quaternion.setFromAxisAngle(axis, angle)

    fragIdsArray.forEach((fragId, idx) => {

      var fragProxy = this._viewer.impl.getFragmentProxy(
        model, fragId)

      fragProxy.getAnimTransform()

      var position = new THREE.Vector3(
        fragProxy.position.x - center.x,
        fragProxy.position.y - center.y,
        fragProxy.position.z - center.z)

      position.applyQuaternion(quaternion)

      position.add(center)

      fragProxy.position = position

      fragProxy.quaternion.multiplyQuaternions(
        quaternion, fragProxy.quaternion)

      if (idx === 0) {

        var euler = new THREE.Euler()

        euler.setFromQuaternion(
          fragProxy.quaternion, 0)

        console.log(euler)
      }

      fragProxy.updateAnimTransform()
    })
  }

  ///////////////////////////////////////////////////////////////////////////
  // returns bounding box as it appears in the viewer
  // (transformations could be applied)
  //
  ///////////////////////////////////////////////////////////////////////////
  geWorldBoundingBox (fragIds, fragList) {

    var fragbBox = new THREE.Box3()
    var nodebBox = new THREE.Box3()

    fragIds.forEach((fragId) => {

      fragList.getWorldBounds(fragId, fragbBox)
      nodebBox.union(fragbBox)
    })

    return nodebBox
  }
}

///////////////////////////////////////////////////////////////////////////////
//
//
///////////////////////////////////////////////////////////////////////////////
class AxisHelper {

  constructor (viewer, center, size) {

    this._viewer = viewer

    this.xAxis = this.createAxis(
      center,
      { x: 1.0, y: 0, z: 0 },
      size, 0xFF0000, 'xAxis')

    this.yAxis = this.createAxis(
      center,
      { x: 0, y: 1.0, z: 0 },
      size, 0x00FF00, 'yAxis')

    this.zAxis = this.createAxis(
      center,
      { x: 0, y: 0, z: 1.0 },
      size, 0x0000FF, 'zAxis')

    this.xCircle = this.drawCircle (
      center,
      {x: 0, y: 1, z: 1}, 1.5 * size / 2, 180, 0xFF0000)

    this._viewer.impl.scene.add(
      this.xCircle)

    this.yCircle = this.drawCircle (
      center,
      {x: 1, y: 0, z: 1}, 1.5 * size / 2, 360, 0x00FF00)

    this._viewer.impl.scene.add(
      this.yCircle)

    this.zCircle = this.drawCircle (
      center,
      {x: 1, y: 1, z: 0}, 1.5 * size / 2, 180, 0x0000FF)

    this._viewer.impl.createOverlayScene(
      'AxisHelperOverlay')

    this._viewer.impl.addOverlay(
      'AxisHelperOverlay', this.xAxis.line)

    this._viewer.impl.addOverlay(
      'AxisHelperOverlay', this.xAxis.cone)

    this._viewer.impl.addOverlay(
      'AxisHelperOverlay', this.yAxis.line)

    this._viewer.impl.addOverlay(
      'AxisHelperOverlay', this.yAxis.cone)

    this._viewer.impl.addOverlay(
      'AxisHelperOverlay', this.zAxis.line)

    this._viewer.impl.addOverlay(
      'AxisHelperOverlay', this.zAxis.cone)

    this._viewer.impl.addOverlay(
      'AxisHelperOverlay', this.xCircle)

    this._viewer.impl.addOverlay(
      'AxisHelperOverlay', this.yCircle)

    this._viewer.impl.addOverlay(
      'AxisHelperOverlay', this.zCircle)

    viewer.impl.sceneUpdated(true)
  }

  ///////////////////////////////////////////////////////////////////////////
  //
  //
  ///////////////////////////////////////////////////////////////////////////
  createAxis (start, dir, size, color, name) {

    var end = {
      x: start.x + dir.x * size,
      y: start.y + dir.y * size,
      z: start.z + dir.z * size
    }

    var material = new THREE.LineBasicMaterial({
      color: color,
      linewidth: 3,
      depthTest: false,
      depthWrite: false,
      transparent: true
    })

    var line = this.drawLine(
      start, end, material)

    var cone = this.drawCone(
      end, dir, size * 0.1, material)

    return {
      line: line,
      cone: cone
    }
  }

  ///////////////////////////////////////////////////////////////////////////
  //
  //
  ///////////////////////////////////////////////////////////////////////////
  drawLine (start, end, material) {

    var geometry = new THREE.Geometry()

    geometry.vertices.push(new THREE.Vector3(
      start.x, start.y, start.z))

    geometry.vertices.push(new THREE.Vector3(
      end.x, end.y, end.z))

    var line = new THREE.Line(geometry, material)

    return line
  }

  ///////////////////////////////////////////////////////////////////////////
  //
  //
  ///////////////////////////////////////////////////////////////////////////
  drawCircle (center, axis, radius, color, range, resolution = 100) {

    var size = 360 / resolution

    var geometry = new THREE.Geometry()

    for (var i = 0; i <= resolution; i++) {

      var segment = i * size * Math.PI / 180

      geometry.vertices.push(new THREE.Vector3(
        center.x + Math.cos(segment) * radius * axis.x,
        center.y + (axis.x ? Math.sin(segment) : Math.cos(segment)) * radius * axis.y,
        center.z + Math.sin(segment) * radius * axis.z))
    }

    var material = new THREE.LineBasicMaterial({
      color: color,
      linewidth: 3,
      depthTest: false,
      depthWrite: false,
      transparent: true
    })

    var circle = new THREE.Line(geometry, material)

    return circle
  }

  ///////////////////////////////////////////////////////////////////////////
  //
  //
  ///////////////////////////////////////////////////////////////////////////
  drawCone (start, dir, length, material) {

    var end = {
      x: start.x + dir.x * length,
      y: start.y + dir.y * length,
      z: start.z + dir.z * length
    }

    var direction = new THREE.Vector3().subVectors(
      end, start)

    var orientation = new THREE.Matrix4()

    orientation.lookAt(
      start,
      end,
      new THREE.Object3D().up)

    var matrix = new THREE.Matrix4()

    matrix.set(
      1, 0, 0, 0,
      0, 0, 1, 0,
      0, -1, 0, 0,
      0, 0, 0, 1)

    orientation.multiply(matrix)

    var geometry = new THREE.CylinderGeometry(
      0, length * 0.2, direction.length(), 128, 1)

    var mesh = new THREE.Mesh(geometry, material)

    mesh.applyMatrix(orientation)

    mesh.position.x = start.x
    mesh.position.y = start.y
    mesh.position.z = start.z

    return mesh
  }

  ///////////////////////////////////////////////////////////////////////////
  //
  //
  ///////////////////////////////////////////////////////////////////////////
  remove() {

    this._viewer.impl.removeOverlayScene(
      'AxisHelperOverlay')
  }
}
