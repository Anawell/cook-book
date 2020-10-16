// Register the FilePond plugin
FilePond.registerPlugin(
    FilePondPluginImageResize,
    FilePondPluginFileEncode,
    FilePondPluginImagePreview
    );

// Set the ratio of the preview
FilePond.setOptions({
    stylePanelAspectRatio: 600 / 400,
    imageResizeTargetWidth: 1000,
    imageResizeTargetHeight: 1500
})

// init FilePond
FilePond.parse(document.body);