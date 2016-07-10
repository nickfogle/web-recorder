(function() {

  navigator.getUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia || navigator.msGetUserMedia;

  URL = window.URL || window.webkitURL;

  var audioContext = new AudioContext;
  var audioInLevel = audioContext.createGain();
  audioInLevel.gain.value = 0.5;

  var source;
  source.connect(audioInLevel);
  audioInLevel.connect(audioContext.destination);

  if (navigator.getUserMedia) {
    navigator.getUserMedia({ audio: true }, function(stream) {
      source = audioContext.createMediaStreamSource(stream);
    }, function(err) {
     console.log('The following gUM error occured: ' + err);
   });
  } else {
     console.log('getUserMedia not supported on your browser!');
  }

  recorder = new WebAudioRecorder(mixer, {
    workerDir: "bower_components/web-recorder/js/"
  });

  recorder.setEncoding("mp3");

  recorder.onEncoderLoading = function(recorder, encoding) {
    console.log('encoder loaded...');
  }

  $('#record').on('click', function() {
    console.log('clicked');
    if (recorder.isRecording()) {
      stopRecording(true);
    } else {
      startRecording();
    }
  });

  $('#cancel').on('click', function() {
     stopRecording(false);
   });

  var startRecording = function() {
     $('#recording').removeClass('hidden');
     $('#record').html('STOP');
     $('#cancel').removeClass('hidden');
     recorder.setOptions({timeLimit: 20, progressInterval: 1000, bufferSize: 1024, mp3: { bitRate: 320 }});
     recorder.startRecording();
     setProgress(0);
  };

  var stopRecording = function(finish) {
    $('#recording').addClass('hidden');
    $('#record').html('RECORD');
    $('#cancel').addClass('hidden');
    if (finish) {
      recorder.finishRecording();
    } else {
      recorder.cancelRecording();
    }
  };

  recorder.onComplete = function(recorder, blob) {
    console.log(blob);
    saveRecording(blob, recorder.encoding);
  };

  var minSecStr = function(n) {
    return (n < 10 ? "0" : "") + n;
  };

  var updateDateTime = function() {
    var sec;
    $('#date-time').html((new Date).toString());
    sec = recorder.recordingTime() | 0;
    $('#time-display').html("" + (minSecStr(sec / 60 | 0)) + ":" + (minSecStr(sec % 60)));
  };

  window.setInterval(updateDateTime, 200);

  var onGotAudioIn = function(stream) {
    audioIn = audioContext.createMediaStreamSource(stream);
    audioIn.connect(audioInLevel);
  };

  var saveRecording = function(blob, enc) {
    var html, time, url;
    time = new Date();
    url = URL.createObjectURL(blob);
    html = ("<p recording='" + url + "'>") + ("<audio controls src='" + url + "'></audio> ") + ("(" + enc + ") " + (time.toString()) + " ") + ("<a class='btn btn-default' href='" + url + "' download='recording." + enc + "'>") + "Save..." + "</a> " + ("<button class='btn btn-danger' recording='" + url + "'>Delete</button>");
    "</p>";
    $('#recording-list').prepend($(html));
  };

  $('#recording-list').on('click', 'button', function(event) {
    var url = $(event.target).attr('recording');
    $("p[recording='" + url + "']").remove();
    URL.revokeObjectURL(url);
  });

  recorder.onError = function(recorder, message) {
    console.log(message);
  };

}).call(this);
