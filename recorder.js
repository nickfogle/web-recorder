'use strict';

angular.module('wavveRecorder', [])

  .factory('MP3Service', function($window, $http, Auth, $rootScope) {

    navigator.getUserMedia = ($window.navigator.getUserMedia || $window.navigator.webkitGetUserMedia || $window.navigator.mozGetUserMedia || $window.navigator.msGetUserMedia);

    URL = window.URL || window.webkitURL;

    var audioContext = new AudioContext;
    var audioInLevel = audioContext.createGain();
    audioInLevel.gain.value = 0.5;
    var audioIn = void 0;

    var recorder = new WebAudioRecorder(audioInLevel, {
      workerDir: "/bower_components/web-recorder/js/"
    });

    recorder.setEncoding("mp3");

    recorder.onEncoderLoading = function(recorder, encoding) {
      console.log('encoder loaded...');
    }

    recorder.onComplete = function(recorder, blob) {
      saveRecording(blob, recorder.encoding);
    };

    recorder.onError = function(recorder, message) {
      console.log(message);
    };

    var saveRecording = function(blob, enc) {
      var blobObj = {};
      blobObj.blob = blob;
      blobObj.url = URL.createObjectURL(blob);
      $rootScope.$broadcast("blobCreated", blobObj);
    };

    var startRecording = function() {
       recorder.setOptions({timeLimit: 20, progressInterval: 1000, bufferSize: 1024, mp3: { bitRate: 160 }});
       recorder.startRecording();
    };

    var stopRecording = function(finish) {
      if (finish) {
        recorder.finishRecording();
      } else {
        recorder.cancelRecording();
      }
    };

    var onGotAudioIn = function(stream) {
      audioIn = audioContext.createMediaStreamSource(stream);
      audioIn.connect(audioInLevel);
    };

    var minSecStr = function(n) {
      return (n < 10 ? "0" : "") + n;
    };

    var updateDateTime = function() {
      var sec = recorder.recordingTime() | 0;
      $('#time-display').html("" + (minSecStr(sec / 60 | 0)) + ":" + (minSecStr(sec % 60)));
      // GET NASTY JQUERY OUT OF HERE ^^^
    };

    var loadRecorder = function() {
      if (navigator.getUserMedia) {
        navigator.getUserMedia({audio: true}, function(stream) {
          audioIn = audioContext.createMediaStreamSource(stream);
          audioIn.connect(audioInLevel);
          audioIn.track = stream.getTracks()[0];
          }, function(err) {
            console.log('The following error occured: ' + err);
          });
      } else {
        console.log('getUserMedia not supported on your browser!');
      }
      startRecording();
      window.setInterval(updateDateTime, 200);
    };


    return {

      record: function() {
        loadRecorder();
      },

      stop: function(finished) {
        stopRecording(finished);
        audioIn.track.stop();
      }

    };

});