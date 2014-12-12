///////////////////////////////////////////////////////////////////////////////
// Autodesk.ADN.Viewing.Extension.ViewSequencer
// by Philippe Leefsma, October 2014
//
///////////////////////////////////////////////////////////////////////////////
AutodeskNamespace("Autodesk.ADN.Viewing.Extension");

Autodesk.ADN.Viewing.Extension.ViewSequencer = function (viewer, options) {

    Autodesk.Viewing.Extension.call(this, viewer, options);

    _self = this;

    var _viewer = viewer;

    _self.load = function () {

        console.log('Autodesk.ADN.Viewing.Extension.ViewSequencer loaded');

        _self.loadViews();

        return true;
    };

    _self.unload = function () {

        $('#mainLayoutId').layout().hide('east');

        $('#sequencerDivId').remove();

        console.log('Autodesk.ADN.Viewing.Extension.ViewSequencer unloaded');

        return true;
    };

    ///////////////////////////////////////////////////////////////////
    //
    //
    ///////////////////////////////////////////////////////////////////
    _self.createUI = function() {

        $('#sequencerDivId').remove();

        $('#mainLayoutId').layout().show('east');

        $('#eastLayoutId').
            append('<div id="sequencerDivId"></div>');

        $('#sequencerDivId').
            append('<br><label>&nbsp;&nbsp;Create view sequence:</label>');

        $('#sequencerDivId').
            append('<ul id="sequencerListId"></ul>');

        $('#sequencerListId').sortable();

        $('#sequencerDivId').
            append('&nbsp;&nbsp;Delay (sec.): &nbsp; <input id="intervalId" type="text" value="2" style="width:50px"><br><br>');

        $('#sequencerDivId').
            append('<button class="sequencerBtn" onclick="_self.loadViews()">Reload views</button>');

        $('#sequencerDivId').
            append('<button class="sequencerBtn" onclick="_self.playSequence()">Play sequence</button>');

        $('.sequencerBtn').css({
            'width':'85%',
            'margin-left': '7%'
        });

        var controller = angular.element($('#appBodyId')).scope();

        for(var viewId in _self._viewMap){

            var view = _self._viewMap[viewId];

            $('#sequencerListId').
                append('<li class=list-group-item id=' +
                    view.id + '>' +
                    view.name + ' </li>');

            $('#' + view.id).css({
                'width':'90%'
            });

            controller.setHoverStyle(
                view.id,
                'rgba(136, 180, 221, 0.5)',
                'rgba(136, 180, 221, 1.0)');
        }
    }

    ///////////////////////////////////////////////////////////////////
    //
    //
    ///////////////////////////////////////////////////////////////////
    _self.loadViews = function() {

        _self._viewMap = {};

        var controller = angular.element($('#appBodyId')).scope();

        var dbModel = controller.getCurrentDbModel();

        getModelById(dbModel._id,

            function (response) {

                response.model.views.forEach(function (view) {

                    _self._viewMap[view.id] = view;
                });

                _self.createUI();
            });
    }

    ///////////////////////////////////////////////////////////////////
    //
    //
    ///////////////////////////////////////////////////////////////////
    _self.playSequence = function() {

        var delay = parseInt($('#intervalId').val());

        if(isNaN(delay)) {
            console.log('Invalid interval value ...');
            return;
        }

        var list = document.getElementById("sequencerListId");

        var items = list.getElementsByTagName("li");

        var idx = 0;

        function loadView() {

            if(idx < items.length) {

                var view = _self._viewMap[items[idx].id];

                _viewer.setView(view);

                idx++;

                setTimeout(loadView, delay * 1000.0);
            }
        }

        loadView();
    }

    ///////////////////////////////////////////////////////////////////
    //
    //
    ///////////////////////////////////////////////////////////////////
    function getModelById(id, onSuccess) {

        var xhr = new XMLHttpRequest();

        xhr.open('GET',
            "http://" + window.location.host +
            '/node/gallery/api/model/' + id,
            true);

        xhr.setRequestHeader(
            'Content-Type',
            'application/json');

        xhr.onreadystatechange = function () {
            if (xhr.readyState === 4 )
                if(xhr.status === 200)
                    onSuccess(JSON.parse(xhr.responseText));
        }

        xhr.onerror = function (error) {
            console.log('getModel error:' + error);
        }

        xhr.send();
    }
};

Autodesk.ADN.Viewing.Extension.ViewSequencer.prototype =
    Object.create(Autodesk.Viewing.Extension.prototype);

Autodesk.ADN.Viewing.Extension.ViewSequencer.prototype.constructor =
    Autodesk.ADN.Viewing.Extension.ViewSequencer;

Autodesk.Viewing.theExtensionManager.registerExtension(
    'Autodesk.ADN.Viewing.Extension.ViewSequencer',
    Autodesk.ADN.Viewing.Extension.ViewSequencer);

