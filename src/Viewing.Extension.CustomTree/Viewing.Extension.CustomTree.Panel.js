/////////////////////////////////////////////////////////////////////
// Viewing.Extension.StateManager.Panel
// by Philippe Leefsma, Feb 2016
//
/////////////////////////////////////////////////////////////////////
import './Viewing.Extension.CustomTree.css'
import ToolPanelBase from 'ToolPanelBase'

export default class CustomTreePanel extends ToolPanelBase{

  constructor(container, btnElement, rootNode) {

    super(container, 'Custom Tree', {
      buttonElement: btnElement,
      shadow: true
    });

    $(this.container).addClass('custom-tree');

    var treeContainer = $(`#${this.container.id}-tree-container`)[0];

    this.treeDelegate = new CustomTreeDelegate();

    this.tree = new Autodesk.Viewing.UI.Tree(
      this.treeDelegate, rootNode, treeContainer, {
        excludeRoot: false,
        localize: true
      });
  }

  /////////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////////
  htmlContent(id) {

    return `

      <div class="container" id="${id}-tree-container">

      </div>`;
  }
}



class CustomTreeDelegate extends Autodesk.Viewing.UI.TreeDelegate {

  getTreeNodeId(node) {

    return node.dbId;
  }

  isTreeNodeGroup (node) {

    if(!node.children || !node.children.length)
      return false;

    return true;
  }
}