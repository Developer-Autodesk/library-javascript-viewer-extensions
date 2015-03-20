///////////////////////////////////////////////////////////////////////////////
// Autodesk.ADN.Viewing.Extension.Basic
// by Philippe Leefsma, October 2014
//
///////////////////////////////////////////////////////////////////////////////
AutodeskNamespace("Autodesk.ADN.Viewing.Extension");

Autodesk.ADN.Viewing.Extension.Toolbar = function (viewer, options) {

    Autodesk.Viewing.Extension.call(this, viewer, options);

    var _viewer = viewer;

    var _self = this;

    var htmlDlg = '<div id="demoDlg" class="modal fade" role="dialog" aria-labelledby="myModalLabel" aria-hidden="true">'
        + '<div class="modal-dialog">'
        + '<div class="modal-content id="aboutDlgFrame">'
        + '<div class="modal-header">'
        + '<button type="button" class="close" data-dismiss="modal">'
        + ' <span aria-hidden="true">&times;</span>'
        + ' <span class="sr-only"> Close </span>'
        + '</button>'
        + '<h4 class="modal-title">'
        + '<img  height="24" width="24" src="public/images/adsk.24x24.png"/>'
        //+ '<adn-spinning-img step="5.0" period="100" height="32" width="32" src="public/images/adsk.32x32.png" style="position:relative; bottom:5px;"/>'
        + 'Just a Demo Dialog ...'
        + '</h4>'
        + '</div>'
        + '<div id="demoDlgBody" class="modal-body">'
        + ' Written by'
        + ' <a href="http://adndevblog.typepad.com/cloud_and_mobile/philippe-leefsma.html" target="_blank">'
        + ' Philippe Leefsma'
        + ' </a>'
        + ' <br/><br/><b>Autodesk Developer Network</b><br/> November 2014'
        + '</div>'
        + '<div class="modal-footer">'
        + '<button type="button" class="btn btn-default" data-dismiss="modal">Got it</button>'
        + '</div>'
        + '</div>'
        + '</div>'
        + '</div>';

    _self.load = function () {

        _self.createViewerToolbar();

        _self.createDivToolbar();

        $(htmlDlg).appendTo('#appBodyId');

        console.log('Autodesk.ADN.Viewing.Extension.Toolbar loaded');

        return true;
    };

    _self.unload = function () {

        $('#demoToolbarId').remove();

        var viewerToolbar = _viewer.getToolbar(true);

        viewerToolbar.removeControl(
            "Autodesk.ADN.Viewing.Extension.Toolbar.ControlGroup1");

        console.log('Autodesk.ADN.Viewing.Extension.Toolbar unloaded');

        return true;
    };

    _self.createViewerToolbar = function() {

        var viewerToolbar = _viewer.getToolbar(true);

        var ctrlGroup = new Autodesk.Viewing.UI.ControlGroup(
            "Autodesk.ADN.Viewing.Extension.Toolbar.ControlGroup1");

        var button = new Autodesk.Viewing.UI.Button(
            "Autodesk.ADN.Viewing.Extension.Toolbar.Button1");

        button.icon.style.backgroundImage =
            "url(public/images/adsk.24x24.png)";

        button.setToolTip("Viewer Toolbar button");

        button.onClick = function (e) {

            alert("Viewer Toolbar button clicked!");
        };

        ctrlGroup.addControl(button);

        viewerToolbar.addControl(ctrlGroup);
    }

    _self.createDivToolbar = function() {

        var toolbarDivHtml = '<div id="demoToolbarId"> </div>';

        $(toolbarDivHtml).appendTo(
            '#' + _viewer.container.id);

        $('#demoToolbarId').css({
            'top': '20%',
            'left': '20%',
            'z-index': '100',
            'position': 'absolute'
        });

        var toolbar = new Autodesk.Viewing.UI.ToolBar(true);

        var ctrlGroup = new Autodesk.Viewing.UI.ControlGroup(
            "Autodesk.ADN.Viewing.Extension.Toolbar.ControlGroup2");

        var button = new Autodesk.Viewing.UI.Button(
            "Autodesk.ADN.Viewing.Extension.Toolbar.Button2");

        button.icon.style.backgroundImage =
            "url(public/images/adsk.24x24.png)";

        button.setToolTip("Div Toolbar button");

        button.onClick = function (e) {

            $('#demoDlg').modal('show');
        };

        ctrlGroup.addControl(button);

        toolbar.addControl(ctrlGroup);

        $('#demoToolbarId')[0].appendChild(
            toolbar.container);
    }
};

Autodesk.ADN.Viewing.Extension.Toolbar.prototype =
    Object.create(Autodesk.Viewing.Extension.prototype);

Autodesk.ADN.Viewing.Extension.Toolbar.prototype.constructor =
    Autodesk.ADN.Viewing.Extension.Toolbar;

Autodesk.Viewing.theExtensionManager.registerExtension(
    'Autodesk.ADN.Viewing.Extension.Toolbar',
    Autodesk.ADN.Viewing.Extension.Toolbar);

