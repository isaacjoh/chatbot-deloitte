var accessToken = "ee7ddfa17b63455190faa6859296b016",
  baseUrl = "https://api.api.ai/v1/query?v=20170710",
  $speechInput,
  $recBtn,
  recognition,
  messageRecording = "Recording...",
  messageCouldntHear = "I couldn't hear you, could you say that again?",
  messageInternalError = "Oh no, there has been an internal server error",
  messageSorry = "I'm sorry, I don't have the answer to that yet.";

var eventBriteToken = 'EP5XIBBB4YAVJ2FZDHAE';

$(document).ready(function() {
  $speechInput = $("#speech");
  $recBtn = $("#rec");

  $speechInput.keypress(function(event) {
    if (event.which == 13) {
      event.preventDefault();
      send();
    }
  });

  $recBtn.on("click", function(event) {
    switchRecognition();
  });
});

function startRecognition() {
  recognition = new webkitSpeechRecognition();
  recognition.continuous = false;
  recognition.interimResults = false;

  recognition.onstart = function(event) {
    respond(messageRecording);
    updateRec();
  };

  recognition.onresult = function(event) {
    recognition.onend = null;

    var text = "";
      for (var i = event.resultIndex; i < event.results.length; ++i) {
        text += event.results[i][0].transcript;
      }
      setInput(text);
    stopRecognition();
  };

  recognition.onend = function() {
    respond(messageCouldntHear);
    stopRecognition();
  };

  recognition.lang = "en-US";

  recognition.start();
}

function stopRecognition() {
  if (recognition) {
    recognition.stop();
    recognition = null;
  }
  updateRec();
}

function switchRecognition() {
  if (recognition) {
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
  $recBtn.text(recognition ? "Stop" : "Speak");
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

  var $events = $("#events");

  $.ajax({
    url: 'https://www.eventbriteapi.com/v3/events/search/?token='+ eventBriteToken + '&location.address="LA"',
    type: 'GET',
    success: function(res) {
      if (res.events.length) {
        var eventsCap = 2;
          var s = "<ul class='eventList'>";
          for(var i = 0; i < eventsCap; i++) {
              var event = res.events[i];
              console.dir(event);
              s += "<li><a href='" + event.url + "' target='_blank'>" + event.name.text + "</a></li>";
          }
          s += "</ul>";
          $events.html(s);
      } else {
        var spokenResponse = 'my sincere apologies sir but there doesn\'t seem to be any parties there.';
        useCustomVoice(spokenResponse);
      }
    },
    error: function(data) {
      var spokenResponse = 'my sincere apologies sir but there doesn\'t seem to be any parties there.';
      useCustomVoice(spokenResponse);
    }
  });

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
    msg.pitch = 1;
    msg.text = text;

    msg.onend = function(e) {
      console.log('Finished in ' + event.elapsedTime + ' seconds.');
    };

    console.log(speechSynthesis);

    speechSynthesis.speak(msg);

  }
}