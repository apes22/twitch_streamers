//Make a get channel request for every user in the list.
//If we get a 404 error, then the user's channel does not exist.
//If we do get a channel object, then we get its basic information (name, logo, channel_url)
//After all the channel requests have been completed, we create a string of active twitch users, and make a get stream request.
//if the user is part of the returned stream array, then we gather the current stream info and updated the user to be online.
//else we get the user's live stream  detail  
var potentialUsers=["freecodecamp", "ESL_SC2", "OgamingSC2", "cretetion", "storbeck", "habathcx", "RobotCaleb", "noobs2ninjas", "maribel", "fad", "behkuhtv"];

//model
var userList = {
  users: [],
  addInactiveUser: function(name){
    this.users.push({
      name: name,
      active: false
    });
  },
  addActiveUser: function(name, display_name, small_logo, profile_banner, channel_url){
    this.users.push({
      name: name,
      display_name: display_name,
      active: true,
      online: false,
      small_logo: small_logo,
      profile_banner: profile_banner,
      //large_logo: large_logo,
      channel_url: channel_url
    });
  },
  addLiveStreamer: function(name, details, preview_banner){
    //find the user in the array and add details property
    var streamerIndex = this.findUser(name);
   // console.log("streamerIndex is: ", streamerIndex);
    if(streamerIndex != -1){
     this.users[streamerIndex].online = true;
     this.users[streamerIndex].details = details;
      this.users[streamerIndex].preview_banner = preview_banner;
    }
  },
  findUser: function(name){
    return this.users.findIndex(isName);      
    function isName(obj){
      return obj.name === name;
    }
  }  
};

//controller
var controller = {

  getChannel: function(userName){
    return new Promise(function(resolve,reject){
      var url = 'https://api.twitch.tv/kraken/channels/' + userName + '?client_id=1fqby4hqnlm4h1t0ze5o5kgsn10k1z';
      var request = new XMLHttpRequest();
      request.open('GET', url, true);
      request.onload = function () {
      if (request.status >= 200 && request.status < 400)  { // Success!
        resolve(request.response);
      }else{
        if (request.status == 404){
          //resolving an invalid user because we still want to add each username to our list of users
           resolve(request.response); 
        }
        reject(Error(request.statusText)); // We reached our target server, but it returned an error
       }
      };
      request.onerror = function() {
      reject(Error("Network Error"));  // There was a connection error of some sort
      };
    request.send();
  });
  },
  getStreams: function(users){
    var url = 'https://api.twitch.tv/kraken/streams?channel=' + users + '&client_id=1fqby4hqnlm4h1t0ze5o5kgsn10k1z';
    var request = new XMLHttpRequest();
    request.open('GET', url, true);
    request.onload = function() {
    if (request.status >= 200 && request.status < 400)  { // Success!
      var streams = JSON.parse(request.response).streams;
      streams.forEach(function(obj){
        userList.addLiveStreamer(obj.channel.name, obj.channel.status, obj.preview.medium);
        console.log(obj.preview.medium);
      });
      view.displayUsers("all");
      console.log(userList.users);
    }else{
       // We reached our target server, but it returned an error   
    }
  };
  request.onerror = function() {
      // There was a connection error of some sort
    };
    request.send();
  },
  getTwitchUsers: function(potentialUsers){
    var requests = [];
    potentialUsers.forEach(function (userName){
    requests.push(
      this.getChannel(userName).then(function(response) {
        var channel = JSON.parse(response);
        if (channel.error == "Not Found"){
          userList.addInactiveUser(userName);
        }else{
          var channel_url = 'https://player.twitch.tv/?channel=' + channel.display_name;
          userList.addActiveUser(channel.name, channel.display_name, channel.logo, channel.video_banner, channel_url);
      }
    }, function(error) {
        console.error("Failed!", error);
      })
      )
 },this);
    //Waits for all the get stream requests to resolve
    Promise.all(requests).then(function(results) {
    console.log("All promises resolved!");
    this.getActiveUserStreams();
  }.bind(this)).catch(function(error) {
  // One or more promises was rejected
  }.bind(this)); 
},
getActiveUserStreams: function(){
  var activeUsers = '';
  userList.users.forEach(function(user){
    if (user.active){
      activeUsers += user.name + ',';
    }
  });
  this.getStreams(activeUsers);
  }
};


//view
var view = {
  //show pages in an unordered list
  displayUsers: function(){
    var userUl = document.getElementById("userList");
    userUl.innerHTML = "";
    userList.users.forEach(function(user){
      if (user.active){
        var anchor = document.createElement("a");
        anchor.href = user.channel_url;
        anchor.target = "_blank";
        
        var userLi = document.createElement("li");
        userLi.className = (user.online) ? "online":"offline";
        
        var img = document.createElement("img");
        img.src = user.small_logo;
        
        var h3 = document.createElement("h3");
        h3.textContent = user.display_name.toUpperCase();
        
        var paragraph = document.createElement("p");
        paragraph.textContent = (user.online) ? "online":"offline";
        
       userLi.classList.add("centerImage");
        if (user.online){
          userLi.style.backgroundImage = "url(" + user.preview_banner + ")";
        }
        else if (user.active && user.profile_banner !== null){
        userLi.style.backgroundImage = "url(" + user.profile_banner + ")";
        }
        // paragraph.textContent = user.small_logo;
        userUl.appendChild(anchor);
        anchor.appendChild(userLi);
        userLi.appendChild(img);
        userLi.appendChild(h3);
        userLi.appendChild(paragraph);
      }
      else{
        var userLi = document.createElement("li");
        var h3 = document.createElement("h3"); 
        var paragraph = document.createElement("p");
        paragraph.textContent = "does not exist";
        userLi.className = "invalidUser";
        h3.textContent = user.name.toUpperCase();
        userUl.appendChild(userLi);
        userLi.appendChild(h3); 
        userLi.appendChild(paragraph);
      }
    });
  },
//went from 60 lines to 13 woot woot 
filterUsers: function(filter){
    //retrieve html collections for the following classes: online, offline, invalidUser
    var onlines = document.getElementsByClassName("online");
    var offlines = document.getElementsByClassName("offline");
    var invalidUsers = document.getElementsByClassName("invalidUser");

    for (var i = 0; onlines[i]; i++) {
     onlines[i].style.display = (filter === 'all' || filter == 'online') ? "block": "none";
    }
    for (var i = 0; offlines[i]; i++) {
       offlines[i].style.display = (filter === 'all' || filter == 'offline') ? "block": "none";
    }
    for (var i = 0; invalidUsers[i]; i++) {
      invalidUsers[i].style.display = (filter === 'all') ? "block": "none";
    }
    /* Another method to iterate  over an html collection
      //https://imbuzu.wordpress.com/2014/02/01/iterating-over-an-htmlcollection

    iterateCollection(onlines)(function(node, i) {
         node.style.display = (filter === 'all' || filter == 'online') ? "block": "none";
    });

    function iterateCollection (collection) {
      return function(f) {
      for(var i = 0; collection[i]; i++) {
      f(collection[i], i);
    }
    }
  }
  */
},
setUpEventListeners: function(){
     document.getElementById("showAllBtn").addEventListener("click", function(){
      view.filterUsers("all");
        });
    document.getElementById("showOnlineBtn").addEventListener("click", function(){
      view.filterUsers("online");
       });
    document.getElementById("showOfflineBtn").addEventListener("click", function(){
      view.filterUsers("offline");
    });
  }
};

controller.getTwitchUsers(potentialUsers);
view.setUpEventListeners();