var synth = window.speechSynthesis;

var inputForm = document.querySelector('form');
var inputTxt = document.querySelector('.txt');
var voiceSelect = document.getElementById('browser-list');
var googleSelect = document.getElementById('google-list');

var pitch = document.querySelector('#pitch');
var pitchValue = document.querySelector('.pitch-value');
var rate = document.querySelector('#rate');
var rateValue = document.querySelector('.rate-value');

var speakBrowser = document.getElementById('play-browser');
var speakGoogle = document.getElementById('play-google');
var voices = [];
var googleVoices = [];
var googleAudio = document.getElementById('google-audio');
var googleAudioFile = document.getElementById('google-audio-source');

function populateVoiceList() {
    voices = synth.getVoices().sort(function (a, b) {
        const aname = a.name.toUpperCase(), bname = b.name.toUpperCase();
        if ( aname < bname ) return -1;
        else if ( aname == bname ) return 0;
        else return +1;
    });
    var selectedIndex = voiceSelect.selectedIndex < 0 ? 0 : voiceSelect.selectedIndex;
    voiceSelect.innerHTML = '';
    for(i = 0; i < voices.length ; i++) {
        var option = document.createElement('option');
        option.textContent = voices[i].name + ' (' + voices[i].lang + ')';

        if(voices[i].default) {
            option.textContent += ' -- DEFAULT';
        }

        option.setAttribute('data-lang', voices[i].lang);
        option.setAttribute('data-name', voices[i].name);
        voiceSelect.appendChild(option);
    }
    voiceSelect.selectedIndex = selectedIndex;
}

function populateGoogleVoiceList() {
    // var url = 'https://texttospeech.googleapis.com/v1/voices?key=AIzaSyDWXqw5Rjzl4M_zIEWIVxN_bwQm5kShtwY&languageCode=en-US';
    var url = 'https://texttospeech.googleapis.com/v1/voices?key=AIzaSyDWXqw5Rjzl4M_zIEWIVxN_bwQm5kShtwY';
    fetch(url)
        .then(response => response.json())
        .then(data => {
            googleVoices = data.voices;
            var selectedIndex = googleSelect.selectedIndex < 0 ? 0 : googleSelect.selectedIndex;
            googleSelect.innerHTML = '';
            for(i = 0; i < googleVoices.length ; i++) {
                var option = document.createElement('option');
                option.textContent = googleVoices[i].name + ' (' + googleVoices[i].ssmlGender + ')';

                if(googleVoices[i].default) {
                    option.textContent += ' -- DEFAULT';
                }

                option.setAttribute('data-id', i);
                googleSelect.appendChild(option);
            }
            googleSelect.selectedIndex = selectedIndex;
        });
}
populateVoiceList();
populateGoogleVoiceList();
if (speechSynthesis.onvoiceschanged !== undefined) {
    speechSynthesis.onvoiceschanged = populateVoiceList;
}

function speak(){
    if (synth.speaking) {
        console.error('speechSynthesis.speaking');
        return;
    }
    if (inputTxt.value !== '') {
        var utterThis = new SpeechSynthesisUtterance(inputTxt.value);
        utterThis.onend = function (event) {
            console.log('SpeechSynthesisUtterance.onend');
        }
        utterThis.onerror = function (event) {
            console.error('SpeechSynthesisUtterance.onerror');
        }
        var selectedOption = voiceSelect.selectedOptions[0].getAttribute('data-name');
        for(i = 0; i < voices.length ; i++) {
            if(voices[i].name === selectedOption) {
                utterThis.voice = voices[i];
                break;
            }
        }
        utterThis.pitch = pitch.value;
        utterThis.rate = rate.value;
        synth.speak(utterThis);
    }
}

function speakGoogleFn(){
    if (synth.speaking) {
        console.error('speechSynthesis.speaking');
        return;
    }
    if (inputTxt.value === '') {
        return;
    }
    var url = 'https://texttospeech.googleapis.com/v1/text:synthesize?key=AIzaSyDWXqw5Rjzl4M_zIEWIVxN_bwQm5kShtwY';
    var selectedOption = googleSelect.selectedOptions[0].getAttribute('data-id');
    var selectedVoice = googleVoices[parseInt(selectedOption)];
    var data = {
        audioConfig: {audioEncoding: "MP3"},
        input: {
            text: inputTxt.value
        },
        voice: {
            languageCode: selectedVoice.languageCodes[0],
            name: selectedVoice.name,
            ssmlGender: selectedVoice.ssmlGender
        }
    };
    async function postData(url = '', data = {}) {

        const response = await fetch(url, {
            method: 'POST',
            mode: 'cors',
            cache: 'no-cache',
            credentials: 'same-origin',
            headers: {
                "content-type":"application/json; charset=UTF-8"
            },
            redirect: 'follow',
            referrerPolicy: 'no-referrer',
            body: JSON.stringify(data)
        });
        return response.json();
    }

    postData(url, data)
        .then(data => {
            var audioContent = data && data.audioContent;
            googleAudio.src = 'data:audio/mp3;base64,' + audioContent;
            googleAudio.play();
        });
}

speakBrowser.onclick = function(event) {
    event.preventDefault();

    speak();

    inputTxt.blur();
}

speakGoogle.onclick = function(event) {
    event.preventDefault();

    speakGoogleFn();

    inputTxt.blur();
}

pitch.onchange = function() {
    pitchValue.textContent = pitch.value;
}

rate.onchange = function() {
    rateValue.textContent = rate.value;
}

voiceSelect.onchange = function(){
    speak();
}
