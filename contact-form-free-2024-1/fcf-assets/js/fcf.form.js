var optionsJV = {
    rules: {
        "Name": {
            "required": true,
            "maxLength": 60
        },
        "Email": {
            "required": true,
            "maxLength": 100,
            "email": true
        },
        "Phone": {
            "required": false,
            "maxLength": 30
        },
        "Message": {
            "required": true,
            "maxLength": 3000
        }
    },
    colorWrong: '#dc3545',
    focusWrongField: true,
    submitHandler: function(cform, values, ajax) {
        var button_value = getButtonValue('fcf-button');
        disableButton('fcf-button', lang.server);

        // Build FormData from values
        var formData = new FormData();
        try {
            Object.keys(values).forEach(function(k){
                formData.append(k, values[k]);
            });
        } catch(e) {}

        // Primary attempt: send to PHP processor (works when PHP is enabled on hosting)
        var controller = new AbortController();
        var timedOut = false;
        var timeoutId = setTimeout(function(){
            timedOut = true;
            try { controller.abort(); } catch(e) {}
        }, 12000); // 12s safety timeout so the button never gets stuck

        fetch(cform.getAttribute('action'), {
            method: 'POST',
            body: formData,
            signal: controller.signal,
            headers: { 'X-Requested-With': 'XMLHttpRequest' }
        }).then(function(res){
            clearTimeout(timeoutId);
            if(!res.ok) throw new Error('HTTP '+res.status);
            return res.text();
        }).then(function(response){
            var done = false;
            if(response.indexOf('Fail:') == 0) {
                // configuration problem
                showFailMessage(response, lang.server);
                enableButon('fcf-button', button_value);
                done = true;
            }
            if(response.indexOf('Error:') == 0) {
                // validation problem
                showErrorMessage(response, lang.server);
                enableButon('fcf-button', button_value);
                done = true;
            }
            if(response.indexOf('Success') == 0) {
                showSuccessMessage(response);
                done = true;
            }
            if(response.indexOf('URL:') == 0) {
                doRedirect(response);
                done = true;
            }
            if(response.indexOf('Debug:') == 0) {
                showDebugMessage(response, lang.server);
                enableButon('fcf-button', button_value);
                done = true;
            }
            if(done == false) {
                showErrorMessage('Error:'+lang.server.tryLater, lang.server);
                enableButon('fcf-button', button_value);
            }
        }).catch(function(){
            // If PHP is unavailable (static hosting, CORS or timeout), fallback to Web3Forms
            fallbackWeb3Forms(values, button_value);
        });
    },
};

function fallbackWeb3Forms(values, originalButtonLabel){
    var payload = {
        access_key: '4bdd647d-d717-48de-a46c-07de1efa8872',
        name: values['Name'] || '',
        email: values['Email'] || '',
        subject: 'New Contact Form Message',
        message: (values['Message'] || '') + (values['Phone'] ? ('\n\nPhone: '+values['Phone']) : ''),
        from_name: values['Name'] || 'Website Visitor',
    };

    fetch('https://api.web3forms.com/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
        body: JSON.stringify(payload)
    }).then(function(res){
        return res.json();
    }).then(function(data){
        if(data && data.success){
            // Align with existing success UI handler
            showSuccessMessage('Success: Thank you for your message. We will get back to you soon.');
        } else {
            var msg = (data && (data.message || data.error)) ? data.message || data.error : 'Submission failed. Please try again later.';
            showErrorMessage('Error: '+msg, lang.server);
            enableButon('fcf-button', originalButtonLabel);
        }
    }).catch(function(){
        showErrorMessage('Error: '+lang.server.tryLater, lang.server);
        enableButon('fcf-button', originalButtonLabel);
    });
}

document.addEventListener('DOMContentLoaded', function(event) {
    new JustValidate('.fcf-form-class', lang.client, optionsJV);
});

function getButtonValue(id) {
    return document.getElementById(id).innerText;
}

function disableButton(id, lang) {
    document.getElementById(id).innerText = lang.pleaseWait;
    document.getElementById(id).disabled = true;
}

function enableButon(id, val) {
    document.getElementById(id).innerText = val;
    document.getElementById(id).disabled = false;
}

function showFailMessage(message, lang) {
    var display = '<strong>'+lang.configError+'</strong><br>';
    display += message.substring(5);
    document.getElementById('fcf-status').innerHTML = display;
}

function showErrorMessage(message, lang) {
    var display = '<strong>'+lang.errorMessage+':</strong><br>';
    display += message.substring(6);
    document.getElementById('fcf-status').innerHTML = display;
}

function showDebugMessage(message, lang) {
    var display = '<strong>'+lang.debugOutput+'</strong><br>';
    display += message.substring(6);
    document.getElementById('fcf-status').innerHTML = display;
}

function showSuccessMessage(message) {
    var message = '<br><br>' + message.substring(8);
    var content = document.getElementById('fcf-thank-you').innerHTML;
    document.getElementById('fcf-thank-you').innerHTML = content + message;
    document.getElementById('fcf-status').innerHTML = '';
    document.getElementById('fcf-form').style.display = 'none';
    document.getElementById('fcf-thank-you').style.display = 'block';
}

function doRedirect(response) {
    var url = response.substring(4);
    window.location.href = url;
}
