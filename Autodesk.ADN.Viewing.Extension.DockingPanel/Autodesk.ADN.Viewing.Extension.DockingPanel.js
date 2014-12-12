///////////////////////////////////////////////////////////////////////////////
// Autodesk.ADN.Viewing.Extension.Basic
// by Philippe Leefsma, October 2014
//
///////////////////////////////////////////////////////////////////////////////
AutodeskNamespace("Autodesk.ADN.Viewing.Extension");

Autodesk.ADN.Viewing.Extension.DockingPanel = function (viewer, options) {

    Autodesk.Viewing.Extension.call(this, viewer, options);

    var _self = this;

    var _panel = null;

    var _viewer = viewer;

    _self.load = function () {

        Autodesk.ADN.AdnPanel = function(
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

        Autodesk.ADN.AdnPanel.prototype = Object.create(
            Autodesk.Viewing.UI.DockingPanel.prototype);

        Autodesk.ADN.AdnPanel.prototype.constructor =
            Autodesk.ADN.AdnPanel;

        Autodesk.ADN.AdnPanel.prototype.initialize = function()
        {
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

            this.initializeMoveHandlers(this.container);

            this.closer = document.createElement("div");

            this.closer.className = "AdnPanelClose";
            //this.closer.textContent = "Close";

            this.initializeCloseHandler(this.closer);

            this.container.appendChild(this.closer);
        };

        Autodesk.ADN.AdnPanel.prototype.setVisible =
            function (show, skipTransition) {

                console.log("show = " + show + ", skipTransition = " + skipTransition + ")");

                Autodesk.Viewing.UI.DockingPanel.prototype.
                    setVisible.call(
                        this,
                        show,
                        skipTransition);
        };

        var content = document.createElement('div');

        content.id = 'adnPanelId';

        _panel = new Autodesk.ADN.AdnPanel(
            _viewer.clientContainer,
            'Stocks',
            'ADN Demo Panel',
            content,
            0, 0);

        $('#adnPanelId').css('color', 'white');

        _self.GetQuoteData(function(response){

            var result = '';

            response.quotes.forEach(function(quote){

                result += '<b>' + quote.symbol + '</b>' + ' = $' +
                    quote.LastTradePriceOnly + '<br><br>';
            })

            $('#adnPanelId').html(result);
        })

        _panel.setVisible(true);

        console.log('Autodesk.ADN.Viewing.Extension.DockingPanel loaded');

        return true;
    };

    _self.unload = function () {

        _panel.setVisible(false);

        _panel.uninitialize();

        console.log('Autodesk.ADN.Viewing.Extension.DockingPanel unloaded');

        return true;
    };

    _self.GetQuoteData = function(onSuccess) {

        var url = 'http://query.yahooapis.com/v1/public/yql' +
            '?format=json' +
            '&env=http://datatables.org/alltables.env' +
            '&q='

        var query = 'select * from yahoo.finance.quotes where symbol in ' +
            '("AAPL", "ADSK","FB", "GOOG", "MSFT")';

        url += encodeURIComponent(query);

        $.getJSON(url, function(data){

            var response = {
                quotes : data.query.results.quote
            }

            onSuccess(response);
        });
    }
};

Autodesk.ADN.Viewing.Extension.DockingPanel.prototype =
    Object.create(Autodesk.Viewing.Extension.prototype);

Autodesk.ADN.Viewing.Extension.DockingPanel.prototype.constructor =
    Autodesk.ADN.Viewing.Extension.DockingPanel;

Autodesk.Viewing.theExtensionManager.registerExtension(
    'Autodesk.ADN.Viewing.Extension.DockingPanel',
    Autodesk.ADN.Viewing.Extension.DockingPanel);

