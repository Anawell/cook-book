if(document.querySelector('#editor_ingredients')) {

    ClassicEditor
            .create(document.querySelector('#editor_ingredients'), {
                toolbar: [ 'bulletedList' ]
            })
            .catch(error => {
                    console.error(error);
            });

}


if(document.querySelector('#editor_steps')) {

    ClassicEditor
            .create(document.querySelector('#editor_steps'), {
                toolbar: [ 'numberedList' ]
            })
            .catch(error => {
                    console.error(error);
            });

}

