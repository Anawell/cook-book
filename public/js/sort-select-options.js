function sortOptions(selector) {

    if(selector) {

        const options = selector.options;
        let optionsArray = [];
        for (let i = 0; i < options.length; i++) {
            optionsArray.push(options[i]);
        }
        optionsArray = optionsArray.sort(function (a, b) {           
            return a.innerHTML.toLowerCase().charCodeAt(0) - b.innerHTML.toLowerCase().charCodeAt(0);    
        });

        for (let i = 0; i <= options.length; i++) {            
            options[i] = optionsArray[i];
        }

    }
}

sortOptions(document.querySelector('select#ingredient'));