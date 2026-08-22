//maybe sell this software

$(document).ready(function(){

    // Clean up when the tab or window is closed / hidden
  function cleanupSession() {
    const tripcode = $("#tripcode").val();
    if (tripcode) {
      // sendBeacon sends an async POST payload that survives tab closure
      const url = "/delete_oracle/" + encodeURIComponent(tripcode);
      navigator.sendBeacon(url);
    }
  }

  // Trigger on tab close, navigation, or visibility change
  window.addEventListener("pagehide", cleanupSession);
  window.addEventListener("beforeunload", cleanupSession);
  var count = 0;
  var peerCount = 0;
  
  reset();

  function reset(peer = false){

    connected = false; 
    if(!peer){
      $(".key").empty();      
      $(".final").hide();      
      
      $("#magick_header").text("Browse")
      $("#oracle_info").text("Oracle not found.")
    }

    if(r){
      clearTimeout(r);
    }

    $("#oracles_header").text("Browse")
    $("#oracles_info").html("")
    if(ANCHOR.page() === "oracle"){
      $.post("/delete_oracle/" + $("#tripcode").val());

    }
    count = 0;
    peerCount = 0;
    $("#querent_oracle").hide();
    $("#spreadHeader").hide();
    $("#oracle_interpretation").text("").hide();
    $("#awaiting_oracle").show();
    $("#trip_console").text("");
    $("#tripcode").show();
    $(".finished").hide();
    $(".reading_h3").hide();
    $("#disconnect_button").hide();
    $("#oracle_heading").hide();
    $("#initiate_button").prop("disabled", false);
    $(".draw").prop("disabled",false);
    $("#query_submission").text("");
    $(".interpretation_button").prop("disabled", false)
    $("#initiate_button").show();
    $(".interpretation_button").hide();
    $("#oracles").show();
    $(".magick_connecting").hide();
    $(".magick_connecting").text("Connecting...")
    $(".cards").hide();
    $("#incoming").hide();
    $(".draw").hide();
    $(".draw").off("click")
    $(".query").hide();
    $(".query_submission").hide();
    $("#query_submission").text("");
    $("#awaiting_query").hide();
    $("#discovered_query").hide();
    //$(".connection").hide();
    //$("#awaiting").hide();
    $("#awaiting").text("Initiate to find Peers!")
    $("#connected").hide()
    $(".interpretation").hide();  
    $(".query input").show();
    $(".query button").show();
    $(".query input").val("");
    $("#query_submitted").hide();
    $("#query_submitted").text();


  }

$(".ANCHOR").click(function(e){
  e.preventDefault();
  location.reload();
})

$(".home").click(function(e){
  ANCHOR.route("#home");
})

if(!ANCHOR.page()){
  ANCHOR.route("#home");
}

ANCHOR.load();

function assembleSpread(threeThreeThree){
  console.log("HERE");
  $(".data").show();
  console.log(threeThreeThree);
  $("#tarot_" + Math.abs(parseInt(threeThreeThree[0]))).clone().appendTo($(".data .key_2"));
  $("#tarot_" + Math.abs(parseInt(threeThreeThree[1]))).clone().appendTo($(".data .key_1"));
  $("#tarot_" + Math.abs(parseInt(threeThreeThree[2]))).clone().appendTo($(".data .key_3"));

  console.log(Math.abs(threeThreeThree[0]) + " " + Math.abs(threeThreeThree[1]) + " " + Math.abs(threeThreeThree[2]))

  if(threeThreeThree[0] < 0){
   $(".data .key_2").append("<span class='title'>" + "-" + $("#tarot_" + Math.abs(threeThreeThree[0])).attr("class") + "</class>");
   flip($(".data #tarot_" + Math.abs(threeThreeThree[0])));
  }
  else{
    $(".data .key_2").append("<span class='title'>" + $("#tarot_" + Math.abs(threeThreeThree[0])).attr("class") + "</class>");
  }
  $(".data .key_2").show();
  if(threeThreeThree[1] < 0){
    $(".data .key_1").append("<span class='title'>" + "-" + $("#tarot_" + Math.abs(threeThreeThree[1])).attr("class") + "</class>");
    flip($(".data #tarot_" + Math.abs(threeThreeThree[1])));
  }
  else{
    $(".data .key_1").append("<span class='title'>" + $("#tarot_" + Math.abs(threeThreeThree[1])).attr("class") + "</class>");
  }
  $(".data .key_1").show();
  if(threeThreeThree[2] < 0){
    $(".data .key_3").append("<span class='title'>" + "-" + $("#tarot_" + Math.abs(threeThreeThree[2])).attr("class") + "</class>");
    flip($(".data #tarot_" + Math.abs(threeThreeThree[2])));
  }
  else{    
   $(".data .key_3").append("<span class='title'>" + $("#tarot_" + Math.abs(threeThreeThree[2])).attr("class") + "</class>");
  }
  $(".data .key_3").show();


  $(".data .key_1").css({'transform' : 'rotate('+ (Math.floor(Math.random() * 8) - 8) +'deg)'})
  $(".data .key_2").css({'transform' : 'rotate('+ (Math.floor(Math.random() * 8) - 8) +'deg)'})
  $(".data .key_3").css({'transform' : 'rotate('+ (Math.floor(Math.random() * 8) - 8) +'deg)'})
  $(".reading_h3").fadeIn();
  
  
  $(".final").show();
}

function flip(id){
  id.css({"transform": "scaleY(-1)"})
}

var p;

var r;

var timeout;

var connected;


$("#initiate_button").click(function(e){

  k(10,233,100);

  if(!$("#tripcode").val()){
    window.alert("You must enter a tripcode! (# unnecessary)")
    return false;
  }

  if(r){
    clearTimeout(r);
  }
  e.preventDefault();
  $(".key").empty();
  $("#initiate_button").prop("disabled", true);

  $("#tripcode").hide();

  p = new SimplePeer({ 
    initiator: true,
   // config: { iceServers: [{ urls: 'stun:stun.l.google.com:19302' }, { urls: 'stun:global.stun.twilio.com:3478?transport=udp' }] },
    trickle: false,
    reconnectTimer: 100,
    iceTransportPolicy: 'relay',
  })  
  

  //uhoh
  r = setTimeout(function(){
    location.reload();
  }, 466200)
  

  var tripcode = $("#tripcode").val();
  p.on('connect', () => {
    clearTimeout(r)

    connected = true;
    console.log('CONNECT')
    beep();
    $("#awaiting").hide();
    $("#connected").show();
    $(".query_submission").show()
    //$("#awaiting_query").fadeIn();
    $("#spreadHeader").show();

    $(".draw").fadeIn(777);
    $(".draw").prop("disabled", false)
    $(".draw").on("click", function(e){
      e.preventDefault();
      console.log("DRAW");
      $(".draw").prop("disabled",true)
      $(".draw").hide();
      $(".interpretation").val("");  
      $(".interpretation").fadeIn(777);
      $(".interpretation_button").fadeIn(777) 

      //for some reason this gets called twice?
      threeThreeThreeSpread(function(err, result){
        console.log("1TIMER");
        console.log(result);
        var threeThreeThree = result;
        assembleSpread(threeThreeThree);
        arrDigits = []
        p.send(JSON.stringify(threeThreeThree));
        $("#oracle_heading").show();
        $([document.documentElement, document.body]).animate({
          scrollTop: $(".reading").offset().top
        }, 2000);
      });
      //and then 
      //TRADE
    })
  })

  $(".interpretation_button").click(function(){
    p.send($(".interpretation").val());
    $(".interpretation_button").prop("disabled", true)
    $(".interpretation").fadeOut();
    $(".interpretation_button").fadeOut();
    $("#oracle_interpretation").text($(".interpretation").val()).show(); 
    $(".finished").fadeIn(1337);
    
  })
  p.on('data', data => {
    console.log(data)
    $(".query_submission").fadeIn(1337);
    $("#awaiting_query").fadeOut(777);
    $("#discovered_query").fadeIn();
    $("#query_submission").text(data);    
  })

  $("#disconnect_button").click(function(){
    reset();
  })

  p.on('signal', data => {
  console.log(data)
  //document.querySelector('#outgoing').textContent = JSON.stringify(data)
   //list #uuid
   $.post("/initiate", {sequence : JSON.stringify(data), trips : encodeURIComponent(tripcode)}, function(data){
      $(".connection").show();

      $("#awaiting").text("Awaiting Peer...");
      $("#awaiting").fadeIn(2399);
      $("#initiate_button").hide();
      $("#disconnect_button").show();
      $("#disconnect_button").prop("disabled", false)
      $(".oracle h2").text("Host");
      $("#oracle_console").text(data.tripcode);
      var interval = setInterval(function(){
        $.get("/hail/" + encodeURIComponent(tripcode), function(data){
          if(data){            
            p.signal(JSON.parse(data.sequence));
            clearInterval(interval); 
            //connection established, remove tripcode from db
            

            $.post("/established/" + encodeURIComponent(tripcode), async function(data){

              
            })
          }
        })
      },3333)
      getReaders(function(){

      });
    })
    
  })

  p.on('close', () => {
    const tripcode = $("#tripcode").val();
    if (tripcode) {
      $.post("/delete_oracle/" + encodeURIComponent(tripcode));
    }
    reset();
  })

  p.on('error', err => {console.log('error', err); $(".magick_connecting").text("Error: Connection Failed.")})

})

/*
document.querySelector('form').addEventListener('submit', ev => {
  ev.preventDefault()
  p.signal(JSON.parse(document.querySelector('#incoming').value))
})
*/

$(".peer").click(function(e){
  e.preventDefault();
  $(".oracles").fadeIn(2000);
  getReaders(function(){
    
  });
})

setInterval(function(){
  getReaders(function(err, result){
    /*if(ANCHOR.page() === "peer" && $("#awaiting").is(":hidden") && !connected){// && $.inArray($(".oracle h2").text(), result) === -1){
    
    
    } */ 
  });  
}, 7777)

getReaders(function(){

});

function arraysEqual(a, b) {
  if (a === b) return true;
  if (a == null || b == null) return false;
  if (a.length !== b.length) return false;

  // If you don't care about the order of the elements inside
  // the array, you should sort both arrays here.
  // Please note that calling sort on an array will modify that array.
  // you might want to clone your array first.

  for (var i = 0; i < a.length; ++i) {
    if (a[i] !== b[i]) return false;
  }
  return true;
}


var readers = []
var firstReaders = true;
function getReaders(cb){
  $.get("/readers", function(data){
    var newReaders = data.tripcodes;
    if(readers.length > 0 && arraysEqual(readers, newReaders)){
      return;
    }
    $("#oracles_info").html("");
    readers = newReaders;
    if(firstReaders)
      $(".readers").show();
    firstReaders = false;
    $(".readers").empty();
    cb(null, data.tripcodes);
    if(!data.tripcodes || !data.tripcodes[0]){
      $("#oracles_header").text("Browse");
      $("#oracle_info").html("No Oracles. Why not <a href='#oracle' class='ANCHOR oracle'>host</a> one?");
      ANCHOR.buffer();
      return;
    }
    else{
      $("#oracle_info").html("");
    }
    $("#oracles_header").text("Browse")
    data.tripcodes.forEach(function(tripcode, index){

      var li = document.createElement("li");
      var tripcode = tripcode;
      console.log(data);
      $(li).append("<a class='magick_li' href='#magick?tripcode=" + encodeURIComponent(tripcode) + "'>" + tripcode + "</a>");
      //li != law ACOLYTE
      $(".readers").append(li);
      $(".readers").show();
      $(".magick_li").click(function(e){
        e.preventDefault();
        //retrieve sequence
        ANCHOR.route($(this).attr("href"));
        var tripcode = ANCHOR.getParams().tripcode;
        $("#trip_console").text(tripcode);
        $(".magick_connecting").show();
        $("#oracles").hide();
        tripcode = encodeURIComponent(tripcode);
        $.get("/sequence/" + tripcode, function(data){
          if(data.sequence){
            $("#not_found_header").hide();
          }
          //send signal
          p = new SimplePeer({
            initiator : false,
            //config: { iceServers: [{ urls: 'stun:stun.l.google.com:19302' }, { urls: 'stun:global.stun.twilio.com:3478?transport=udp' }] },
            trickle : false,
            reconnectTimer: 100,
            iceTransportPolicy: 'relay',
          }) 
        


          p.signal(JSON.parse(data.sequence));

          var sequence = data.sequence;
          p.on('signal', data=>{
            console.log("MAGICK SIGNAL SENT");
            $.post("/magick", {sequence : JSON.stringify(data), tripcode : encodeURIComponent(tripcode)}, function(data){
              console.log("MAGICK SIGNAL SUCCESS");
              
            })
          })

          p.on('connect', async () => {
            console.log('CONNECT')   
            $(".query").show();            
            $(".magick_connecting").hide();
              $("#query").click(async function(e){
                e.preventDefault();
                var query = $(".query textarea").val();
                p.send(query);
                $(".query textarea").hide();
                $(".query button").hide();
                $("#query_submitted").show();
                $("#query_submitted").text(query);
              })         
          })
          //this is the peer receiving the spread
          p.on('data', async data => {
              
              console.log('data: ' + data)
              var arr; 
              try{
                console.log("CALLED ASSEMBLE SPREAD");
                //data is an array
                arr = JSON.parse(data);
                if(ANCHOR.page() === "magick"){
                  console.log(arr);
                  assembleSpread(arr);
                  $([document.documentElement, document.body]).animate({
                    scrollTop: $(".reading").offset().top
                  }, 2000);
                }
              }
              catch(e){
                //data is an oracle
                $("#querent_oracle").show();
                $(".final span").text(data);
                $("#awaiting_oracle").hide();
                $(".finished").fadeIn(1337);
                
                
              }
            
          })


          p.on('close', () => {
            //reset(true);  
            $("#magick_header").text($(".magick h2").text()); 
          })

          p.on('error', err => console.log('error', err))



        })
      })
    })
  })
}

$("#soloReading").click(function(){
  threeThreeThreeSpread(function(err, result){
    $(".key").empty();
    assembleSpread(result);
  })
})


function encodeStr(rawStr){
  return rawStr.replace(/[\u00A0-\u9999<>\&]/g, function(i) {
   return '&#'+i.charCodeAt(0)+';';
  });
} 

var snd2 = new Audio("data:audio/mpeg;base64,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wZ0G7jqlt/OcDIKX+/1NblSX+VKfQfP8xuJJGk7////rf////+PgXTv///1JThJJQainmySAB6imUyuVbVttUo7T4Csa821OuF88f62+CZHFnGf///mQgYIEO0SMF2NVy9NxYTdlqJ8AuS4zr//SJoTUJ+CaKKTcZvosrUPo8W/MUv0f033E9E/QpN6P///v/////WRR2mwUAYUABjabRu1vrOLKAF0kIdHjnEx/iNWo7jGn1////mApxNTJQQOU1Het/NoUFTMQs6Vja///THaGIl/0fojl8mjd/Jo8W+ZfpNpCajsz7////6kn/////WRRgDz//LD1KSTDjKOciSAKxdLx5S31uYqKIWj/+5JECgAC8V5M6g9rdFyr6Vo9rW6KtHcr5DEJQRkSpLRklSigvVc4QpmyPe9H3zHR1/in9P/8VNCMJOzYUDyVjfwHP0ZgiZt/3/+9EBnDKbegdUrckhgntHaQ9vX/X/9A/////+r/////mJ3/9ItRcoVRogAcmV9N8z0pvES8QQsKoMGXEymPQyWm6E4HQLqgpv/CZJAtYXQSwoF8e6SB56zABEoW+qgZjJAZovGr0Gl5/OjFKL3JwnaX9v7/X8y1f/////////49WAzMzEYYMZLq6CUANIqbDX7lisBIdraAEPwShTRc9WZ2vAqBc4NQ9GrUNaw0Czcrte0g1NEoiU8NFjx4NFh54FSwlOlgaCp0S3hqo8SLOh3/63f7P/KgKJxxhgGSnAFMCnIogwU5JoqBIDAuBIiNLETyFmiImtYiDTSlb8ziIFYSFv/QPC38zyxEOuPeVGHQ77r/1u/+kq49//6g4gjoVQSUMYQUSAP8PwRcZIyh2kCI2OwkZICZmaZxgnsNY8DmSCWX0idhtz3VTJSqErTSB//1X7TTTVVV//uSZB2P8xwRJ4HvYcItQlWBACM4AAABpAAAACAAADSAAAAEVf/+qCE000VVVVU0002//+qqqqummmmr///qqqppppoqqqqppppoqqATkEjIyIxBlBA5KwUEDBBwkFhYWFhUVFfiqhYWFhcVFRUVFv/Ff/xUVFRYWFpMQU1FMy45OS41qqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqg==");  

function beep() { 
  setTimeout(function(){
      snd2.play();

  },Math.floor(Math.random() * 1337))
}

})

let a = new AudioContext()
function k(w,x,y){
  var v = a.createOscillator()
  var u = a.createGain()
  v.connect(u)
  v.frequency.value = x
  v.type = "square"
  u.connect(a.destination)
  u.gain.value = w * 0.01
  v.start(a.currentTime)
  v.stop(a.currentTime + y *0.001)
}


