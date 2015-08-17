# library-javascript-viewer-extensions

##Description

A collection of various JavaScript extensions for the viewer, showing what is doable with the client-side JavaScript API.

##Dependencies

Some extensions are dependent on specific files which are placed in the same directory. Dependencies need to be loaded before loading the
extension, using a simple <script> tag in your html or dynamically using require or equivalent.
The path of dependencies needs to be modified accordingly to your setup.

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

* Load extensions dynamically on demand:

		//load extension for SEO
		viewer.loadExtension('Autodesk.ADN.Viewing.Extension.SEO');

Please refer to [this blog post](http://adndevblog.typepad.com/cloud_and_mobile/2014/10/how-to-write-custom-extensions-for-the-large-model-viewer.html) for detail.

## License

This sample is licensed under the terms of the [MIT License](http://opensource.org/licenses/MIT). Please see the [LICENSE](LICENSE) file for full details.

##Written by 

Written by Philippe Leefsma 



