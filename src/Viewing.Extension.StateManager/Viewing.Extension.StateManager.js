/////////////////////////////////////////////////////////////////
// StateManager Extension
// By Philippe Leefsma, April 2016
/////////////////////////////////////////////////////////////////
import StateManagerPanel from './Viewing.Extension.StateManager.Panel'
import ViewerToolkit from 'ViewerToolkit'
import ExtensionBase from 'ExtensionBase'

////////////////////////////////////////////////////////////////
// StateManager API
//
/////////////////////////////////////////////////////////////////
class StatesAPI {

  ///////////////////////////////////////////////////////////////
  // Class constructor
  //
  ///////////////////////////////////////////////////////////////
  constructor(apiUrl) {

    this._apiUrl = apiUrl;
  }

  ///////////////////////////////////////////////////////////////
  //
  //
  ///////////////////////////////////////////////////////////////
  async getSequence(modelId) {

    var url = this._apiUrl +
      `/models/${modelId}/states/sequence`;

    var res = await fetch(url);

    return res.json();
  }

  ///////////////////////////////////////////////////////////////
  //
  //
  ///////////////////////////////////////////////////////////////
  async getStates(modelId) {

    var url = this._apiUrl +
      `/models/${modelId}/states`;

    var res = await fetch(url);

    return res.json();
  }

  ///////////////////////////////////////////////////////////////
  //
  //
  ///////////////////////////////////////////////////////////////
  async post(url, payload) {

    var res = await fetch(url, {
      method: 'post',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload || {})
    });

    return res.json();
  }

  ///////////////////////////////////////////////////////////////
  //
  //
  ///////////////////////////////////////////////////////////////
  async saveSequence(modelId, sequence) {

    var payload = {
      sequence: sequence
    }

    var url = this._apiUrl +
      `/models/${modelId}/states/sequence`;

    return this.post(url, payload);
  }

  ///////////////////////////////////////////////////////////////
  //
  //
  ///////////////////////////////////////////////////////////////
  async addState(modelId, state) {

    var payload = {
      state: state
    }

    var url = this._apiUrl +
      `/models/${modelId}/states`;

    return this.post(url, payload);
  }

  ///////////////////////////////////////////////////////////////
  //
  //
  ///////////////////////////////////////////////////////////////
  removeState(modelId, stateId) {

    var url = this._apiUrl +
      `/models/${modelId}/states/${stateId}/remove`;

    return this.post(url);
  }
}

class StateManagerExtension extends ExtensionBase {

  /////////////////////////////////////////////////////////////////
  // Class constructor
  //
  /////////////////////////////////////////////////////////////////
  constructor(viewer, options) {

    super(viewer, options);

    this._api = new StatesAPI(
      options.apiUrl);
  }

  /////////////////////////////////////////////////////////////////
  // Extension Id
  //
  /////////////////////////////////////////////////////////////////
  static get ExtensionId() {

    return 'Viewing.Extension.StateManager';
  }

  /////////////////////////////////////////////////////////////////
  // Load callback
  //
  /////////////////////////////////////////////////////////////////
  load() {

    this._control = ViewerToolkit.createButton(
      'state-manager-control',
      'glyphicon glyphicon-retweet',
      'Manage States', ()=>{

        this._panel.toggleVisibility();
      });

    this.onAddStateHandler =
      (e) => this.onAddState(e);

    this.onRestoreStateHandler =
      (e) => this.onRestoreState(e);

    this.onRemoveStateHandler =
      (e) => this.onRemoveState(e);

    this.onSaveSequenceHandler =
      (e) => this.onSaveSequence(e);

    this._panel = new StateManagerPanel(
      this._viewer.container,
      this._control.container);

    this._panel.on('state.add', (state)=>{

      return this.onAddStateHandler(state);
    });

    this._panel.on('state.restore', (state)=>{

      return this.onRestoreStateHandler(state);
    });

    this._panel.on('state.remove', (state)=>{

      return this.onRemoveStateHandler(state);
    });

    this._panel.on('sequence.update', (sequence)=>{

      return this.onSaveSequenceHandler(sequence);
    });

    this._options.parentControl.addControl(
      this._control);

    this._api.getSequence(this._options.model._id).then(
      async(sequence)=>{

      var states = await this._api.getStates(
        this._options.model._id);

      sequence.forEach((stateId)=>{

        states.forEach((state)=>{

          if(state.guid == this._options.stateId){

            this._viewer.restoreState(state, false);
          }

          if(state.guid == stateId){

            this._panel.addItem(state);
          }
        });
      });
    });

    this._panel.setVisible(
      this._options.showPanel);

    console.log('Viewing.Extension.StateManager loaded');

    return true;
  }

  /////////////////////////////////////////////////////////////////
  // Unload callback
  //
  /////////////////////////////////////////////////////////////////
  unload() {

    this._panel.setVisible(false);

    console.log('Viewing.Extension.StateManager unloaded');

    return true;
  }

  /////////////////////////////////////////////////////////////////
  //
  //
  ////////////////////////////////////////////////////////////////
  onAddState(data){

    var state = this._viewer.getState();

    state.name = (data.name.length ?
      data.name : new Date().toString('d/M/yyyy H:mm:ss'));

    this._api.addState(
      this._options.model._id,
      state);

    return state;
  }

  /////////////////////////////////////////////////////////////////
  //
  //
  ////////////////////////////////////////////////////////////////
  onRestoreState(state){

    this._viewer.restoreState(state, false);
  }

  /////////////////////////////////////////////////////////////////
  //
  //
  ////////////////////////////////////////////////////////////////
  onRemoveState(state){

    this._api.removeState(
      this._options.model._id,
      state.guid);
  }

  /////////////////////////////////////////////////////////////////
  //
  //
  ////////////////////////////////////////////////////////////////
  onSaveSequence(sequence){

    this._api.saveSequence(
      this._options.model._id,
      sequence);
  }
}

Autodesk.Viewing.theExtensionManager.registerExtension(
  StateManagerExtension.ExtensionId,
  StateManagerExtension);
