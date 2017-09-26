$(document).ready(function() {
  var accessToken = "ee7ddfa17b63455190faa6859296b016",
      baseUrl = "https://api.api.ai/v1/query?v=20170710",
      $speechInput,
      $recBtn,
      messageRecording = "Recording...",
      messageCouldntHear = "I couldn't hear you, could you say that again?",
      messageInternalError = "Oh no, there has been an internal server error",
      messageSorry = "I'm sorry, I don't have the answer to that yet.";

  var recognizing = false;
  var recognition = new webkitSpeechRecognition();

  recognition.continuous = false;
  reset();

  recognition.lang = "en-US";

  recognition.onresult = function(event) {

    var text = "";
    for (var i = event.resultIndex; i < event.results.length; ++i) {
      text += event.results[i][0].transcript;
    }

    setInput(text);

    console.log(text);
  };

  recognition.onerror = function(event) {
    console.log(event.error);
  };

  $speechInput = $("#speech");
  $recBtn = $("#rec");

  $speechInput.keypress(function(event) {
    if (event.which == 13) {
      event.preventDefault();
      send();
    }
  });

  $recBtn.on('click', function(event) {
    event.preventDefault();
    switchRecognition();
  });

  useCustomVoice('Good afternoon, Master Wayne');

  function reset() {
    recognizing = false;
  }

  function startRecognition() {
    recognition.start();
    recognizing = true;
    updateRec();
  }

  function stopRecognition() {
    recognition.stop();
    reset();
    updateRec();
  }

  function switchRecognition() {
    if (recognizing) {
      stopRecognition();
    } else {
      startRecognition();
    }
  }

  function setInput(text) {
    $speechInput.val(text);
    send();
  }

  function updateRec() {
    $recBtn.text(recognizing ? "Stop" : "Speak");
  }

  function send() {
    var text = $speechInput.val();

    var payload = {};

    $.ajax({
      type: "POST",
      url: baseUrl,
      contentType: "application/json; charset=utf-8",
      dataType: "json",
      headers: {
        "Authorization": "Bearer " + accessToken
      },
      data: JSON.stringify({query: text, lang: "en", sessionId: "chatbot-deloitte"}),
      success: function(data) {
        prepareResponse(data);
      },
      error: function() {
        respond(messageInternalError);
      }
    });

    var location = 'Los Angeles';
    $.ajax({
      url: 'https://us-central1-newagent-1185b.cloudfunctions.net/api3/?location=' + location,
      type: 'GET',
      success: function(res) {
        console.log(res);
      },
      error: function(data) {
        let spokenResponse = 'my sincere apologies sir but there doesn\'t seem to be any parties there.';
        useCustomVoice(spokenResponse);
      }
    });
  }

  function prepareResponse(val) {
    var debugJSON = JSON.stringify(val, undefined, 2);
    var spokenResponse = val.result.speech;

    if (!spokenResponse) {
      spokenResponse = val.result.fulfillment.speech;

      if (!spokenResponse) {
        spokenResponse = val.result.fulfillment.messages[0].speech;
      }
    }

    spokenResponse = spokenResponse + '.';

    // responsiveVoice.speak(spokenResponse, "US English Male", {pitch: .01}, {rate: .1});
    // respond(spokenResponse);

    useCustomVoice(spokenResponse);

    clearInput();
  }

  function clearInput() {
    $('input').val('');
  }

  function respond(val) {
    if (val == "") {
      val = messageSorry;
    }

    if (val !== messageRecording) {
      var msg = new SpeechSynthesisUtterance();
      msg.voiceURI = "native";
      msg.text = val;
      msg.lang = "en-US";
      window.speechSynthesis.speak(msg);
    }

    $("#spokenResponse").addClass("is-active").find(".spoken-response__text").html(val);
  }

  function useCustomVoice(spokenResponse) {
    if ('speechSynthesis' in window) {
      var text = spokenResponse;
      var msg = new SpeechSynthesisUtterance();
      var voices = window.speechSynthesis.getVoices();

      msg.voice = voices[67];
      msg.rate = 1;
      msg.pitch = 0;
      msg.text = text;

      msg.onend = function(e) {
        console.log('Finished in ' + event.elapsedTime + ' seconds.');
      };

      console.log(speechSynthesis);

      speechSynthesis.speak(msg);

    }
  }

});