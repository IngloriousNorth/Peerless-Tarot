const express = require('express')
const app = express()
const port = 3000

//4chan tripcode generator
const tripcode = require('tripcode');

//sanitization and validation
const { check, validationResult } = require('express-validator');
//decodes from validator
const he = require('he');

//other handlers
const path = require('path')
const bodyParser= require('body-parser')


app.use( bodyParser.json() );       // to support JSON-encoded bodies
app.use(bodyParser.urlencoded({ extended: true }))

// Express Middleware for serving static files
app.use(express.static(path.join(__dirname, 'public')));

/*
  this is the only db, it is local and lists readers in this format:
  readers { 
    "tripcode" {
      sequence : "initiatorSequence",
      hail : "peerSequence"        
    },
    "tripcode2" { etc.
  }
*/
var readers = {};

/*
  After 5 minutes of inactivity delete reader tripcode from db
*/
app.post("/pong", function(req,res){
  resetTimer();
  res.end();
})

//the timer keeps going and resets the same name
function resetTimer(trips){
  clearTimeout(readers[trips].timer);
  readers[trips].timer = setTimeout(function(){
    delete readers[trips];
  }, 466200)
}


//server responses in order of client operations

/*
  An Oracle initiates a data-channel
  Signal "sequence" saved to oracle tripcode in :readers
*/

app.post("/initiate", [check("trips").not().isEmpty().trim().escape(), check("trading").not().isEmpty().trim().escape(), check("sum").trim().escape(), check("wallet_address").trim().escape(), check("sequence").not().isEmpty().custom(value => {
    try {
      JSON.parse(value);
    } catch (e) {
      return false;
    }
    return true;
  }).trim().escape()], function(req,res){
  
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    var trips = tripcode(he.decode(req.body.trips));
    console.log("INITIATED: " + trips);

    //clear the timeout for duplicate entry
    if(readers[trips])
      clearTimeout(readers[trips].timer);

    readers[trips] = {};
    readers[trips].trading = req.body.trading === "false" ? false : true;
    console.log("TRADING : " + readers[trips].trading)

    readers[trips].sequence = JSON.parse(he.decode(req.body.sequence));
    readers[trips].sum = req.body.sum ? req.body.sum : 0;
    readers[trips].wallet_address = req.body.wallet_address;
    readers[trips].tripcode = trips;
    
    resetTimer(trips); 
    res.json({tripcode : trips});
})

//ALL YOUR BASE ARE BELONG TO US

/*
  Peer retrieves sequence from initial Oracle; 
  sequence entered on Peer clientside
*/

app.get("/sequence/:tripcode", [check("tripcode").not().isEmpty().trim().escape()], function(req,res){
  const errors = validationResult(req);
   if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  var tripcode = he.decode(req.params.tripcode);
  
  console.log("TRIPCODE: " + tripcode);

  res.json({sequence : JSON.stringify(readers[tripcode].sequence), sum:readers[tripcode].sum, wallet_address: readers[tripcode].wallet_address});
})

/*
  Oracle sequence posted to peer client; 
  magick established; 
  final sequence for Oracle generated, saved to .hail property of :readers.tripcode
  (so to get the Peer response sequence in your Oracle it's readers.tripcode.hail)
  The hail property is longpolled by the Oracle after initiate is called from the client
*/
app.post("/magick", [check("tripcode").not().isEmpty().trim().escape(), check("sum").trim().escape(), check("wallet_address").trim().escape(), check("sequence").not().isEmpty().custom(value => {
    try {
      JSON.parse(value);
    } catch (e) {
      return false;
    }
    return true;
  }).trim().escape()], function(req,res){
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    //wat
    var tripcode = decodeURIComponent(decodeURIComponent(req.body.tripcode));
    readers[tripcode].tripcode = tripcode;
    if(!req.body.wallet_address || !req.body.sum){
      readers[tripcode].sum = 0;
      readers[tripcode].wallet_address = "";
    }
    else{
      readers[tripcode].wallet_address = req.body.wallet_address;
      readers[tripcode].sum = req.body.sum;
    }
    console.log("TRIPCODE :" + tripcode);
    readers[tripcode].hail = JSON.parse(he.decode(req.body.sequence));
    
    res.end();
})

/*
  Oracle longpolls for Peer response sequence, stored in :readers[tripcode].hail
*/
app.get("/hail/:tripcode", [check("tripcode").not().isEmpty().trim().escape(), check("sum").trim().escape(), check("wallet_address").trim().escape()], function(req,res){
  const errors = validationResult(req);
   if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  var trips = tripcode(he.decode(req.params.tripcode));
  if(readers[trips] && readers[trips].hail){
    res.json({sequence : JSON.stringify(readers[trips].hail), sum: readers[trips].sum, wallet_address: readers[trips].wallet_address});
  }
  else{
    res.end();
  }
})

/* 
  Connection established, remove tripcode from :readers
*/
app.post("/established/:tripcode", [check("tripcode").not().isEmpty().trim().escape()], function(req,res){
  const errors = validationResult(req);
   if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  var trips = tripcode(he.decode(req.params.tripcode));
  if(readers[trips]){
    clearTimeout(readers[trips].timer)
    delete readers[trips];
  }
  res.json({sum : readers[trips] ? readers[trips].sum : 0, wallet_address : readers[trips] ? readers[trips].wallet_address : ""});
})

app.post("/delete_oracle/:tripcode", [check("tripcode").not().isEmpty().trim().escape()], function(req,res){
  var trips = tripcode(he.decode(req.params.tripcode));
  console.log("DELETING: " + trips);
  if(readers[trips]){
    clearTimeout(readers[trips].timer);

    delete readers[trips];
  }
  res.end();
})

/*
  #peer view on clientside calls this
  generates a list of Oracles (as tripcodes) from :readers
*/
app.get("/readers", function(req,res){
  var tripcodes = [];
  var wallet_addresses = [];
  var sums = [];
  var trading = []
  for(const reader in readers){
    wallet_addresses.push(readers[reader].wallet_address);
    sums.push(readers[reader].sum);
    tripcodes.push(readers[reader].tripcode);
    trading.push(readers[reader].trading)
  }
  res.json({tripcodes : tripcodes, trading : trading, sums : sums, wallet_addresses: wallet_addresses });
})

app.get("/web3/:tripcode", check("tripcode").not().isEmpty().trim().escape(), function(req,res){
  const errors = validationResult(req);
   if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  var tripcode = he.decode(req.params.tripcode);
  return res.json({sum : readers[tripcode].sum, wallet_address: readers[tripcode].wallet_address})
})

app.all('*', (req, res) => {
  res.sendFile(__dirname + '/public/thought.html')
})

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`)
})

