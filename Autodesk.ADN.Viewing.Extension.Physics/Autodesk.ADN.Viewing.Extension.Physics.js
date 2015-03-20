///////////////////////////////////////////////////////////////////////////////
// Ammo.js Physics viewer extension
// by Philippe Leefsma, December 2014
//
// Dependencies:
//
// https://rawgit.com/kripken/ammo.js/master/builds/ammo.js
// https://rawgit.com/darsain/fpsmeter/master/dist/fpsmeter.min.js
// https://rawgit.com/vitalets/angular-xeditable/master/dist/js/xeditable.min.js
///////////////////////////////////////////////////////////////////////////////

AutodeskNamespace("Autodesk.ADN.Viewing.Extension");

Autodesk.ADN.Viewing.Extension.Physics = function (viewer, options) {

    Autodesk.Viewing.Extension.call(this, viewer, options);

    var _fps = null;

    var _self = this;

    var _panel = null;

    var _world = null;

    var _meshMap = {};

    var _viewer = viewer;

    var _started = false;

    var _running = false;

    var _animationId = null;

    var _selectedEntry = null;

    ///////////////////////////////////////////////////////////////////////////
    // A stopwatch!
    //
    ///////////////////////////////////////////////////////////////////////////
    var Stopwatch = function() {

        var _startTime = new Date().getTime();

        this.start = function (){

            _startTime = new Date().getTime();
        };

        this.getElapsedMs = function(){

            var elapsedMs = new Date().getTime() - _startTime;

            _startTime = new Date().getTime();

            return elapsedMs;
        }
    }

    var _stopWatch = new Stopwatch();

    String.prototype.replaceAll = function (find, replace) {
        return this.replace(
            new RegExp(find.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&'), 'g'),
            replace);
    };

    ///////////////////////////////////////////////////////////////////////////
    // Extension load callback
    //
    ///////////////////////////////////////////////////////////////////////////
    _self.load = function () {

        console.log('Autodesk.ADN.Viewing.Extension.Physics loading ...');

        $('<link/>', {
            rel: 'stylesheet',
            type: 'text/css',
            href: 'https://rawgit.com/vitalets/angular-xeditable/master/dist/css/xeditable.css'
        }).appendTo('head');

        require([
            'https://rawgit.com/kripken/ammo.js/master/builds/ammo.js',
            'https://rawgit.com/darsain/fpsmeter/master/dist/fpsmeter.min.js',
            'https://rawgit.com/vitalets/angular-xeditable/master/dist/js/xeditable.min.js'
        ], function() {

            _self.initialize(function() {

                _panel = _self.loadPanel();

                _viewer.addEventListener(
                    Autodesk.Viewing.SELECTION_CHANGED_EVENT,
                    _self.onItemSelected);

                console.log('Autodesk.ADN.Viewing.Extension.Physics loaded');
            });
        });

        return true;
    };

    ///////////////////////////////////////////////////////////////////////////
    // Extension unload callback
    //
    ///////////////////////////////////////////////////////////////////////////
    _self.unload = function () {

        $('#physicsDivId').remove();

        _panel.setVisible(false, true);

        _panel = null;

        _self.stop();

        console.log('Autodesk.ADN.Viewing.Extension.Physics unloaded');

        return true;
    };

    ///////////////////////////////////////////////////////////////////////////
    // Initializes meshes and grab initial properties
    //
    ///////////////////////////////////////////////////////////////////////////
    _self.initialize = function(callback) {

        _viewer.getObjectTree(function (rootComponent) {

            rootComponent.children.forEach(function(component) {

                var fragIdsArray = (Array.isArray(component.fragIds) ?
                    component.fragIds :
                    [component.fragIds]);

                fragIdsArray.forEach(function(subFragId) {

                    var mesh = _viewer.impl.getRenderProxy(
                        _viewer,
                        subFragId);

                    _viewer.getPropertyValue(
                        component.dbId,
                        "Mass", function(mass) {

                        mass = (mass !== 'undefined' ? mass : 1.0);

                        _viewer.getPropertyValue(
                            component.dbId,
                            "vInit",
                            function (vInit) {

                                vInit =
                                (vInit !== 'undefined' ? vInit : "0;0;0");

                                vInit = parseArray(vInit, ';');

                                _meshMap[subFragId] = {
                                   transform: mesh.matrixWorld.clone(),
                                   component: component,

                                   vAngularInit: [0,0,0],
                                   vAngular: [0,0,0],

                                   vLinearInit: vInit,
                                   vLinear: vInit,

                                   mass: mass,
                                   mesh: mesh,
                                   body: null
                                }
                            });
                    });
                });
            });

            //done
            callback();
        });
    }

    ///////////////////////////////////////////////////////////////////////////
    //
    //
    ///////////////////////////////////////////////////////////////////////////
    _self.displayVelocity = function(vLinear, vAngular) {

        var editable = angular.element($("#editableDivId")).scope();

        editable.editables.vx = parseFloat(vLinear[0].toFixed(3));
        editable.editables.vy = parseFloat(vLinear[1].toFixed(3));
        editable.editables.vz = parseFloat(vLinear[2].toFixed(3));

        editable.editables.ax = parseFloat(vAngular[0].toFixed(3));
        editable.editables.ay = parseFloat(vAngular[1].toFixed(3));
        editable.editables.az = parseFloat(vAngular[2].toFixed(3));
    }

    ///////////////////////////////////////////////////////////////////////////
    // item selected callback
    //
    ///////////////////////////////////////////////////////////////////////////
    _self.onItemSelected = function (event) {

        var dbId = event.dbIdArray[0];

        if(typeof dbId === 'undefined') {
            $('#editableDivId').css('visibility','collapse');
            return;
        }

        $('#editableDivId').css('visibility','visible');

        var fragId = event.fragIdsArray[0]

        var fragIdsArray = (Array.isArray(fragId) ?
            fragId :
            [fragId]);

        var subFragId = fragIdsArray[0];

        var vLinear = _meshMap[subFragId].vLinear;

        var vAngular = _meshMap[subFragId].vAngular;

        _self.displayVelocity(vLinear, vAngular);

        _selectedEntry = _meshMap[subFragId];
    }

    ///////////////////////////////////////////////////////////////////////////
    // Creates control panel
    //
    ///////////////////////////////////////////////////////////////////////////
    _self.loadPanel = function() {

        Autodesk.ADN.Viewing.Extension.Physics.ControlPanel = function(
            parentContainer,
            id,
            title,
            content,
            x, y)
        {
            this.content = content;

            Autodesk.Viewing.UI.DockingPanel.call(
                this,
                parentContainer,
                id, '',
                {shadow:true});

            // Auto-fit to the content and don't allow resize.
            // Position at the given coordinates

            this.container.style.top = y + "px";
            this.container.style.left = x + "px";

            this.container.style.width = "auto";
            this.container.style.height = "auto";
            this.container.style.resize = "none";
        };

        Autodesk.ADN.Viewing.Extension.Physics.
            ControlPanel.prototype = Object.create(
                Autodesk.Viewing.UI.DockingPanel.prototype);

        Autodesk.ADN.Viewing.Extension.Physics.
            ControlPanel.prototype.constructor =
                Autodesk.ADN.Viewing.Extension.Physics.ControlPanel;

        Autodesk.ADN.Viewing.Extension.Physics.
            ControlPanel.prototype.initialize = function() {

            // Override DockingPanel initialize() to:
            // - create a standard title bar
            // - click anywhere on the panel to move
            // - create a close element at the bottom right
            //
            this.title = this.createTitleBar(
                this.titleLabel ||
                this.container.id);

            this.container.appendChild(this.title);
            this.container.appendChild(this.content);

            //this.initializeMoveHandlers(this.container);

            this.closer = document.createElement("div");

            this.closer.className = "AdnPanelClose";
            //this.closer.textContent = "Close";

            this.initializeCloseHandler(this.closer);

            this.container.appendChild(this.closer);
        };

        var content = document.createElement('div');

        content.id = 'physicsDivId';

        var panel = new Autodesk.ADN.Viewing.Extension.Physics.
            ControlPanel(
                _viewer.container,
                'Physics',
                'Physics',
                content,
                0, 0);

        $('#physicsDivId').css('color', 'white');

        panel.setVisible(true);

        var appScope = angular.element($("#appBodyId")).scope();

        var format = '<a href="#" editable-number="editables.%1" ' +
            'e-step="any" e-style="width:100px" ' +
            'onaftersave="afterSave()">{{editables.%1}}</a>'

        var html =
            '<button id="startBtnId" type="button" style="color:#000000;width:100px">Start</button>' +
            '<button id="resetBtnId" type="button" style="color:#000000;width:100px">Reset</button>' +
            '<div id="editableDivId" ng-controller="editableController" style="visibility: collapse">' +
            '<br>' +
            '<br>&nbsp Linear Velocity: ' +
            '<br> &nbsp Vx = ' + format.replaceAll('%1', 'vx') +
            '<br> &nbsp Vy = ' + format.replaceAll('%1', 'vy') +
            '<br> &nbsp Vz = ' + format.replaceAll('%1', 'vz') +
            '<br><br>&nbsp Angular Velocity: ' +
            '<br> &nbsp Ax = ' + format.replaceAll('%1', 'ax') +
            '<br> &nbsp Ay = ' + format.replaceAll('%1', 'ay') +
            '<br> &nbsp Az = ' + format.replaceAll('%1', 'az') +
            '</div>'

        var element = appScope.compile(html);

        $('#physicsDivId').append(element);

        _self.displayVelocity([0,0,0], [0,0,0]);

        var editable = angular.element($("#editableDivId")).scope();

        editable.onAfterSave = function () {

            var editables = editable.editables;

            _selectedEntry.vAngular = [
                editables.ax,
                editables.ay,
                editables.az
            ];

            _selectedEntry.vLinear = [
                editables.vx,
                editables.vy,
                editables.vz
            ];

            if(!_started) {

                _selectedEntry.vAngularInit =
                    _selectedEntry.vAngular;

                _selectedEntry.vLinearInit =
                    _selectedEntry.vLinear;
            }
        }

        _fps = new FPSMeter(content, {
            smoothing: 10,
            show: 'fps',
            toggleOn: 'click',
            decimals: 1,
            zIndex: 999,
            left: '5px',
            top: '60px',
            theme: 'transparent',
            heat: 1,
            graph: 1,
            history: 32});

        $('#startBtnId').click(function () {

            if (_animationId) {

                $("#startBtnId").text('Start');

                _self.stop();
            }
            else {

                $("#startBtnId").text('Stop');

                _self.start();
            }
        })

        $('#resetBtnId').click(function () {

            if(_running) {

                $("#startBtnId").text('Start');

                _self.stop();
            }

            _self.reset();
        })

        return panel;
    }

    ///////////////////////////////////////////////////////////////////////////
    // Creates physics world
    //
    ///////////////////////////////////////////////////////////////////////////
    _self.createWorld = function() {

        var collisionConfiguration =
            new Ammo.btDefaultCollisionConfiguration;

        var world = new Ammo.btDiscreteDynamicsWorld(
            new Ammo.btCollisionDispatcher(collisionConfiguration),
            new Ammo.btDbvtBroadphase,
            new Ammo.btSequentialImpulseConstraintSolver,
            collisionConfiguration);

        world.setGravity(new Ammo.btVector3(0, 0, -9.8));

        return world;
    }

    ///////////////////////////////////////////////////////////////////////////
    // Starts simulation
    //
    ///////////////////////////////////////////////////////////////////////////
    _self.start = function() {

        _viewer.select([]);

        // force update
        _viewer.setView(_viewer.getCurrentView());

        _world = _self.createWorld();

        for(var key in _meshMap){

            var entry = _meshMap[key];

            var body = createRigidBody(
                entry);

            _world.addRigidBody(body);

            entry.body = body;
        }

        _running = true;

        _started = true;

        _stopWatch.getElapsedMs();

        _self.update();
    }

    ///////////////////////////////////////////////////////////////////////////
    // Stops simulation
    //
    ///////////////////////////////////////////////////////////////////////////
    _self.stop = function() {

        // save current velocities
        for(var key in _meshMap){

            var entry = _meshMap[key];

            var va = entry.body.getAngularVelocity();
            var vl = entry.body.getLinearVelocity();

            entry.vAngular = [va.x(), va.y(), va.z()]
            entry.vLinear = [vl.x(), vl.y(), vl.z()]
        }

        _running = false;
    }

    ///////////////////////////////////////////////////////////////////////////
    // Update loop
    //
    ///////////////////////////////////////////////////////////////////////////
    _self.update = function() {

        if(!_running) {

            cancelAnimationFrame(_animationId);

            _animationId = null;

            return;
        }

        _animationId = requestAnimationFrame(
            _self.update);

        var dt = _stopWatch.getElapsedMs() * 0.002;

        dt = (dt > 0.5 ? 0.5 : dt);

        _world.stepSimulation(
           dt, 10);

        for(var key in _meshMap) {

            updateMeshTransform(_meshMap[key].body);
        }

        _viewer.impl.invalidate(true);

        _fps.tick();
    }

    ///////////////////////////////////////////////////////////////////////////
    // Reset simulation
    //
    ///////////////////////////////////////////////////////////////////////////
    _self.reset = function() {

        for(var key in _meshMap) {

            var entry = _meshMap[key];

            entry.mesh.matrixWorld =
                entry.transform.clone();

            entry.vAngular = entry.vAngularInit;

            entry.vLinear = entry.vLinearInit;
        }

        _viewer.impl.invalidate(true);

        _started = false;
    }

    ///////////////////////////////////////////////////////////////////////////
    // Parses string to array: a1;a2;a3 -> [a1, a2, a3]
    //
    ///////////////////////////////////////////////////////////////////////////
    function parseArray(str, separator) {

        var array = str.split(separator);

        var result = [];

        array.forEach(function(element){

            result.push(parseFloat(element));
        });

        return result;
    }

    ///////////////////////////////////////////////////////////////////////////
    // Updates mesh transform according to physic body
    //
    ///////////////////////////////////////////////////////////////////////////
    function updateMeshTransform(body) {

        var mesh = body.mesh;

        var transform = body.getCenterOfMassTransform();

        var origin = transform.getOrigin();

        var q = transform.getRotation();

        mesh.matrixWorld.makeRotationFromQuaternion({
            x: q.x(),
            y: q.y(),
            z: q.z(),
            w: q.w()
        });

        mesh.matrixWorld.setPosition(
            new THREE.Vector3(
                origin.x(),
                origin.y(),
                origin.z()));
    }

    ///////////////////////////////////////////////////////////////////////////
    // Returns mesh position
    //
    ///////////////////////////////////////////////////////////////////////////
    function getMeshPosition(mesh) {

        var pos = new THREE.Vector3();

        pos.setFromMatrixPosition(mesh.matrixWorld);

        return pos;
    }

    ///////////////////////////////////////////////////////////////////////////
    // Creates collision shape based on mesh vertices
    //
    ///////////////////////////////////////////////////////////////////////////
    function createCollisionShape(mesh) {

        var geometry = mesh.geometry;

        var hull = new Ammo.btConvexHullShape();

        var vertexBuffer = geometry.vb;

        //console.log(geometry);

        var vertices = [];

        for(var i=0; i < vertexBuffer.length; i += geometry.vbstride) {

            vertices.push({
                x: vertexBuffer[i],
                y: vertexBuffer[i+1],
                z: vertexBuffer[i+2]
            });

            hull.addPoint(new Ammo.btVector3(
                vertexBuffer[i],
                vertexBuffer[i+1],
                vertexBuffer[i+2]));
        }

        var faceBuffer = mesh.geometry.attributes.index.array;

        for(var i=0; i < faceBuffer.length; i+=3) {

            var v1 = vertices[faceBuffer[i]];
            var v2 = vertices[faceBuffer[i+1]];
            var v3 = vertices[faceBuffer[i+2]];

            hull.addPoint(new Ammo.btVector3(
                (v1.x + v2.x) / 2.0,
                (v1.y + v2.y) / 2.0,
                (v1.z + v2.z) / 2.0));

            hull.addPoint(new Ammo.btVector3(
                (v1.x + v3.x) / 2.0,
                (v1.y + v3.y) / 2.0,
                (v1.z + v3.z) / 2.0));

            hull.addPoint(new Ammo.btVector3(
                (v2.x + v3.x) / 2.0,
                (v2.y + v3.y) / 2.0,
                (v2.z + v3.z) / 2.0));

            hull.addPoint(new Ammo.btVector3(
                (v1.x + v2.x + v3.x) / 3.0,
                (v1.y + v2.y + v3.y) / 3.0,
                (v1.z + v2.z + v3.z) / 3.0));
        }

        return hull;
    }

    function addMesh(geometry) {

        var material =
            new THREE.MeshPhongMaterial(
                { color: 0xff0000 });

        _viewer.impl.matman().addMaterial(
            'ADN-Material',
            material,
            true);

        var mesh =
            new THREE.Mesh(
                geometry,
                material);

        _viewer.impl.scene.add(mesh);

        _viewer.impl.invalidate(true);
    }

    ///////////////////////////////////////////////////////////////////////////
    // Creates physic rigid body from mesh
    //
    ///////////////////////////////////////////////////////////////////////////
    function createRigidBody(entry) {

        var localInertia = new Ammo.btVector3(0, 0, 0);

        var shape = createCollisionShape(entry.mesh);

        shape.calculateLocalInertia(entry.mass, localInertia);

        var transform = new Ammo.btTransform;

        transform.setIdentity();

        var position = getMeshPosition(entry.mesh);

        transform.setOrigin(new Ammo.btVector3(
            position.x,
            position.y,
            position.z));

        var q = new THREE.Quaternion();

        q.setFromRotationMatrix(entry.mesh.matrixWorld);

        transform.setRotation(new Ammo.btQuaternion(
            q.x, q.y, q.z, q.w
        ));

        var motionState = new Ammo.btDefaultMotionState(transform);

        var rbInfo = new Ammo.btRigidBodyConstructionInfo(
            entry.mass,
            motionState,
            shape,
            localInertia);

        var body = new Ammo.btRigidBody(rbInfo);

        body.setLinearVelocity(
            new Ammo.btVector3(
                entry.vLinear[0],
                entry.vLinear[1],
                entry.vLinear[2]));

        body.setAngularVelocity(
            new Ammo.btVector3(
                entry.vAngular[0],
                entry.vAngular[1],
                entry.vAngular[2]));

        body.mesh = entry.mesh;

        return body;
    }
};

Autodesk.ADN.Viewing.Extension.Physics.prototype =
    Object.create(Autodesk.Viewing.Extension.prototype);

Autodesk.ADN.Viewing.Extension.Physics.prototype.constructor =
    Autodesk.ADN.Viewing.Extension.Physics;

Autodesk.Viewing.theExtensionManager.registerExtension(
    'Autodesk.ADN.Viewing.Extension.Physics',
    Autodesk.ADN.Viewing.Extension.Physics);

