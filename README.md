# library-javascript-viewer-extensions

##Description

A collection of various JavaScript extensions for the viewer, showing off what is doable with client-side JavaScript APIs.

##Dependencies

These sample extensions need to be loaded with viewer client JavaScript API. 

##Setup/Usage Instructions

There are two ways to load an extension with viewer API:

* Load extensions when viewer is initialized:

		var viewerElement = document.getElementById('viewer');

        viewer = new Autodesk.Viewing.Private.GuiViewer3D(viewerElement, {
            extensions: ['BasicExtension']
        });
        

        Autodesk.Viewing.Initializer(options, function () {
            viewer.start();
            loadDocument(viewer, options.document);
        });

Please refer to [this sample](https://github.com/Developer-Autodesk/tutorial-aspnet-view.and.data.api/blob/master/FirstViewerWebApp/FirstViewerWebApp/Scripts/Viewer.js) for detail.

* Load extensions danamically on demand:

		//load extension for SEO
		viewer.loadExtension('Autodesk.ADN.Viewing.Extension.SEO');

Please refer to [this sample](https://github.com/Developer-Autodesk/library-javascript-view.and.data.api/blob/master/AdnViewerManager_Sample.html) for detail.

## License

This sample is licensed under the terms of the [MIT License](http://opensource.org/licenses/MIT). Please see the [LICENSE](LICENSE) file for full details.

##Written by 

Written by Philippe Leefsma 



