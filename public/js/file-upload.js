// Register the FilePond plugin
FilePond.registerPlugin(
    FilePondPluginImageResize,
    FilePondPluginFileEncode,
    FilePondPluginImagePreview
    );

// Set the ratio of the preview
FilePond.setOptions({
    stylePanelAspectRatio: 600 / 400,
    imageResizeTargetWidth: 400,
    imageResizeTargetHeight: 600
})

// init FilePond
FilePond.parse(document.body);