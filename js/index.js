//make a Get  user's block list for every user in the list
//if we get an error, then the user does not exist
//if we do get a user, then we get its basic information
//we then make a get requests for streams with the active users
//if the user is not in the resulting streams array, then it must be offline

var users=["ESL_SC2", "OgamingSC2", "cretetion", "freecodecamp", "storbeck", "habathcx", "RobotCaleb", "noobs2ninjas"];

/*
var user =  {
    name: "",
    online: false,
    active: false,
    logo: "",
    channel_url: "",
    details: ""
}
*/

var apiURL = 'https://api.twitch.tv/kraken/streams?channel=tsm_doublelift,reecodecamp,steveaoki,ESL_SC2,RobotCaleb,steveaoki&client_id=1fqby4hqnlm4h1t0ze5o5kgsn10k1z&limit=5';


console.log(apiURL);
    /*+ "&callback=?";*/
    var request = new XMLHttpRequest();
    request.open('GET', apiURL, true);
    request.onload = function() {
      if (request.status >= 200 && request.status < 400)  { // Success!
        //var data = JSON.parse(request.response);
        var data = JSON.parse(request.response);
        console.log(data);
        document.getElementById('name').innerHTML = data["streams"][0].channel.name;
      }else{
      // We reached our target server, but it returned an error
      }
    };
    request.onerror = function() {
      // There was a connection error of some sort
    };
    request.send();
    