function threeThreeThreeSpread(cb){

	var arrDigits = [];
	//some quirk with quantum / tarot combination? 
	getData(arrDigits, function(err, data){

			//nonquantum upsidedown technically reverses structure of quantum computing

			var upsidedown = Math.floor(Math.random() * 2);
			
			if(upsidedown === 1){
				upsidedown = -1
			}
		
			if(upsidedown === -1){
				arrDigits.push(data * -1);
			}
			else{
				arrDigits.push(data);
			}
			console.log(arrDigits);
			getData(arrDigits, function(err, data){				
					var upsidedown = Math.floor(Math.random() * 2);
				
					if(upsidedown === 1){
						upsidedown = -1
					}

					/*if(upsidedown === -1){
						arrDigits.push(data * -1);
					}
					else{*/
						arrDigits.push(data);
					//}
				    console.log(arrDigits);
	
					getData(arrDigits, function(err, data){						
							var upsidedown = Math.floor(Math.random() * 2);
					
							if(upsidedown === 1){
								upsidedown = -1
							}
							/*if(upsidedown === -1){
								arrDigits.push(data * -1);
							}
							else{*/
							arrDigits.push(data);
							//}
						    console.log(arrDigits);
							cb(null, arrDigits);							
					});	
			});
		
	});
}

function getData(arrDigits, cb) {
  const proxyUrl = "https://Selapian--2f58e6388fb311f1b0781607ee4eb77e.web.val.run";

  $.get(proxyUrl)
    .done(function(data) {
      console.log("draw");
      if (data && typeof data.number === "number") {
        // Map 0-255 down to 0-76 (77 cards total)
        var cardIndex = data.number % 77;

        // Check if card has already been drawn
        if (arrDigits.indexOf(cardIndex) === -1) {
          console.log("Card " + cardIndex + " QRNG Success!")
          cb(null, cardIndex);
        } else {
          // Card already drawn; retry
          getData(arrDigits, cb);
        }
      } else {
        fallbackRandom(arrDigits, cb);
      }
    })
    .fail(function() {
      console.warn("Val.town proxy unreachable; falling back to local math random.");
      fallbackRandom(arrDigits, cb);
    });
}

function fallbackRandom(arrDigits, cb) {
  function randomIntFromInterval(min, max) {
    return Math.floor(Math.random() * (max - min + 1) + min);
  }

  const rndInt = randomIntFromInterval(0, 76);
  if (arrDigits.indexOf(rndInt) === -1) {
    cb(null, rndInt);
  } else {
    getData(arrDigits, cb);
  }
}
