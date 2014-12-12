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

        _self.createToolbar();

        $(htmlDlg).appendTo('#appBodyId');

        console.log('Autodesk.ADN.Viewing.Extension.Toolbar loaded');

        return true;
    };

    _self.unload = function () {

        $('#demoToolbarId').remove();

        console.log('Autodesk.ADN.Viewing.Extension.Toolbar unloaded');

        return true;
    };

    _self.createToolbar = function() {

        var toolbarDivHtml = '<div id="demoToolbarId"> </div>';

        $(toolbarDivHtml).appendTo(
            '#' + _viewer.clientContainer.id);

        $('#demoToolbarId').css({
            'bottom':'0%',
            'left':'20%',
            'z-index': '2',
            'position': 'absolute'
        });

        var toolbar = new Autodesk.Viewing.UI.ToolBar(
            document.getElementById('demoToolbarId'));

        //var viewerToolbar = _viewer.getToolbar(true);

        var subToolbar = toolbar.addSubToolbar('sub1', false);

        var bTool = Autodesk.Viewing.UI.ToolBar.createMenuButton(
            "bTool",
            "Demo Tool button",
            function (e) {
                $('#demoDlg').modal('show');
            });

        toolbar.addToSubToolbar("sub1", bTool);

        subToolbar.setToolImage(
            bTool.id,
            'public/images/adsk.24x24.png');

        $('#' + bTool.id + 'Button').css({
            'background-position': '3px 0px'
        });
    }
};

Autodesk.ADN.Viewing.Extension.Toolbar.prototype =
    Object.create(Autodesk.Viewing.Extension.prototype);

Autodesk.ADN.Viewing.Extension.Toolbar.prototype.constructor =
    Autodesk.ADN.Viewing.Extension.Toolbar;

Autodesk.Viewing.theExtensionManager.registerExtension(
    'Autodesk.ADN.Viewing.Extension.Toolbar',
    Autodesk.ADN.Viewing.Extension.Toolbar);

