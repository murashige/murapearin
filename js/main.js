(function($) {
  var PEERJS_ID = 'bzv4oj4qwd0a4i';
  var myId = String(Math.ceil( Math.random()*1000 + 100 ));
  var peer = new Peer(myId, {key: PEERJS_ID});
  var myStream;
  navigator.getUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia;
  window.AudioContext = window.AudioContext || window.webkitAudioContext;

  //相手のvideoを呼び出す
  function callTo(peerId){
    var call = peer.call(peerId, myStream);

    call.on('stream', function(othersStream){
      console.log('success othersStream');
      $('.others-video').prop('src', URL.createObjectURL(othersStream));
    });
  }

  //受信した時
  peer.on('call', function(call){
    call.answer(myStream);

    call.on('stream', function(othersStream){
      console.log('success othersStream');
      $('.others-video').prop('src', URL.createObjectURL(othersStream));
    });
  });

  peer.on('error', function(e){
    console.log(e.message);
  });

  function changeAudio() {
    var audioContext = new AudioContext;
    var tuna = new Tuna(audioContext);
    var input = audioContext.createMediaStreamSource(myStream);
    var volume = audioContext.createGain();
    volume.gain.value = 0.8;
    var destination = audioContext.destination;

    //var delay = audioContext.createDelay();
    //delay.delayTime.value = 0.8;
    var chorus = new tuna.Chorus({
      rate: 1.5,
      feedback: 0.7,
      delay: 0.0025,
      bypass: 0
    });

    var delay = new tuna.Delay({
      feedback: 0.65,    //0 to 1+
      delayTime: 750,    //how many milliseconds should the wet signal be delayed?
      wetLevel: 0.35,    //0 to 1+
      dryLevel: 1,       //0 to 1+
      cutoff: 8000,      //cutoff frequency of the built in highpass-filter. 20 to 22050
      bypass: 0
    });

    var phaser = new tuna.Phaser({
      rate: 1.2,                     //0.01 to 8 is a decent range, but higher values are possible
      depth: 0.3,                    //0 to 1
      feedback: 0.2,                 //0 to 1+
      stereoPhase: 30,               //0 to 180
      baseModulationFrequency: 700,  //500 to 1500
      bypass: 0
    });

    var overdrive = new tuna.Overdrive({
      outputGain: 0.1,         //0 to 1+
      drive: 0.7,              //0 to 1
      curveAmount: 0.9,          //0 to 1
      algorithmIndex: 1,      //0 to 5, selects one of our drive algorithms
      bypass: 0
    });

    var wahwah = new tuna.WahWah({
      automode: true,               //true/false
      baseFrequency: 0.5,          //0 to 1
      excursionOctaves: 2,           //1 to 6
      sweep: 0.2,                    //0 to 1
      resonance: 10,               //1 to 100
      sensitivity: 0.5,              //-1 to 1
      bypass: 0
    });

    var effectList = {
      "chorus": chorus,
      "delay": delay,
      "phaser": phaser,
      "overdrive": overdrive,
      "wahwah": wahwah
    };

    input.connect(volume);
    volume.connect(destination);

    $(".select-effect").on("change", function(){
      var val = $(this).val();
      volume.disconnect();

      if(val === "normal") {
        input.connect(volume);
        volume.connect(destination);
        return;
      }

      var effect = effectList[val];
      console.log("effect", effect);
      input.connect(volume);
      volume.connect(effect.input);
      effect.connect(destination);
    });
  }

  $(function(){
    $('#myId').text(myId);

    navigator.getUserMedia({audio: true, video: true},
    function(stream){
      console.log('success getUserMedia');
      myStream = stream;
      $('.my-video').prop('src', URL.createObjectURL(stream));
      changeAudio();
    },
    function(){
      //if error
    });

    $('.connects').find("a").click(function() {
      var peerId = $('#connect').val();
      console.log('connect', peerId);
      if(peerId === '') return false;
      callTo(peerId);
    });
  });
})(jQuery);
