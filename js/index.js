//make a get channel request for every user in the list
//if we get a 404 error, then the user's channel does not exist
//if we do get a channel objct, then we get its basic information (name, logo, channel_url)
//we then make a get requests for streams for every active users
//if the user's stream object returns a null stram object, then it must be offline
//else we get the user's live stream  detail  
var potentialUsers=["freecodecamp", "ESL_SC2", "OgamingSC2", "cretetion", "storbeck", "habathcx", "RobotCaleb", "noobs2ninjas", "maribel"];

var userList = {
  users: [],
  addInactiveUser: function(name){
    this.users.push({
      name: name,
      active: false
    });
  },
  addActiveUser: function(name, display_name, small_logo, channel_url){
    this.users.push({
      name: name,
      display_name: display_name,
      active: true,
      online: false,
      small_logo: small_logo,
      //large_logo: large_logo,
      channel_url: channel_url
    });
  },
  
  addLiveStreamer: function(name, details){
    //find the user in the array and add details property
    var streamerIndex = this.findUser(name);
    this.users[streamerIndex].details = details;
     console.log( this.users[streamerIndex]);
  },
  
  findUser: function(name){
    return this.users.findIndex(isName);      
    function isName(obj){
      return obj.name === name;
    }
  }  
};

/*
var user =  {
    name: "",
    display_name: "",
    active: false,
    online: false,
    small_logo: "",
    medium_logo: "",
    large_logo: "",
    channel_url: "",
    details: ""
}
*/
getTwitchUsers(potentialUsers, getActiveUserStreams);

function getTwitchUsers(potentialUsers, callback){
    potentialUsers.forEach(function (userName){
      getChannel(userName);
    });
   callback();
}
//need a callback function to make sure the above is finished first before running this
//getActiveUserStreams(); 

function getActiveUserStreams(){
  var activeUsers = 'freecodecamp,ESL_SC2,OgamingSC2,cretetion,storbeck,habathcx, RobotCaleb,noobs2ninjas,maribel'; 
  for (var user in userList.users){
    console.log(users);
   // if (user.active){
        //activeUsers = user.name + ','
    //} 
  }
  console.log("active user is:", activeUsers);
  getStreams(activeUsers);
  
}


//Calls a Twitch.API GET channel request. Returns a channel object if userName is active
function getChannel(userName){
  var url = 'https://api.twitch.tv/kraken/channels/' + userName +
      '?client_id=1fqby4hqnlm4h1t0ze5o5kgsn10k1z';
  console.log(url);
  var request = new XMLHttpRequest();
  request.open('GET', url, true);
  request.onload = function() {
    if (request.status >= 200 && request.status < 400)  { // Success!
        var channel = JSON.parse(request.response);
        document.getElementById('name').innerHTML = channel.name;
      var channel_url = 'https://player.twitch.tv/?channel=' + channel.display_name;
      userList.addActiveUser(channel.name, channel.display_name,
      channel.logo, channel_url);
       
      }else{
        if (request.status == 404){
          //console.log("user channel not found");
           var data = JSON.parse(request.response);
          userList.addInactiveUser(userName);
          console.log(userList.users);
           //console.log(data);
          document.getElementById('error').innerHTML = data.message;
        }
       // We reached our target server, but it returned an error   
      }
    };
    request.onerror = function() {
      // There was a connection error of some sort
    };
    request.send();
}

function getStreams(users){
  var url = 'https://api.twitch.tv/kraken/streams?channel=' + users +
   '&client_id=1fqby4hqnlm4h1t0ze5o5kgsn10k1z';
  
  console.log(url);
  var request = new XMLHttpRequest();
  request.open('GET', url, true);
  request.onload = function() {
    if (request.status >= 200 && request.status < 400)  { // Success!
        var streams = JSON.parse(request.response);
      console.log(streams);
       /* document.getElementById('name').innerHTML = channel.name;
      var channel_url = 'https://player.twitch.tv/?channel=' + channel.display_name;
      userList.addActiveUser(channel.name, channel.display_name,
      channel.logo, channel_url);
      */
       
      }else{
       // We reached our target server, but it returned an error   
      }
    };
    request.onerror = function() {
      // There was a connection error of some sort
    };
    request.send();
  }   

//console.log(userList.users);
//console.log(userList.addLiveStreamer('cretetion', "currentlyLive!"));

