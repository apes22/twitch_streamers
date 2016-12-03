//make a get channel request for every user in the list
//if we get a 404 error, then the user's channel does not exist
//if we do get a channel objct, then we get its basic information (name, logo, channel_url)
//we then make a get requests for streams for every active users
//if the user's stream object returns a null stram object, then it must be offline
//else we get the user's live stream  detail  

var users=["ESL_SC2", "OgamingSC2", "cretetion", "freecodecamp", "storbeck", "habathcx", "RobotCaleb", "noobs2ninjas"];

/*
var user =  {
    name: "",
    online: false,
    active: false,
    small_logo: "",
    medium_logo: "",
    large_logo: "",
    channel_url: "",
    details: ""
}
*/


var apiURL = 'https://api.twitch.tv/kraken/channels/maribel?client_id=1fqby4hqnlm4h1t0ze5o5kgsn10k1z';

//var apiURL = 'https://api.twitch.tv/kraken/streams?channel=tsm_doublelift,reecodecamp,steveaoki,ESL_SC2,RobotCaleb,steveaoki&client_id=1fqby4hqnlm4h1t0ze5o5kgsn10k1z&limit=5';


console.log(apiURL);
    /*+ "&callback=?";*/
    var request = new XMLHttpRequest();
    request.open('GET', apiURL, true);
    request.onload = function() {
      if (request.status >= 200 && request.status < 400)  { // Success!
        //var data = JSON.parse(request.response);
        var data = JSON.parse(request.response);
        console.log(data);
        document.getElementById('name').innerHTML = data.name;
        //document.getElementById('name').innerHTML = data["stream"];
      }else{
      // We reached our target server, but it returned an error
         var data = JSON.parse(request.response);
        console.log(data);
        document.getElementById('error').innerHTML = data.message;
      }
    };
    request.onerror = function() {
      // There was a connection error of some sort
    };
    request.send();
    