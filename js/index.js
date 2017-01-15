//Make a get channel request for every user in the list.
//If we get a 404 error, then the user's channel does not exist.
//If we do get a channel object, then we get its basic information (name, logo, channel_url)
//After all the channel requests have been completed, we create a string of active twitch users, and make a get stream request.
//if the user is part of the returned stream array, then we gather the current stream info and updated the user to be online.
//else we get the user's live stream  detail  
var potentialUsers=["freecodecamp", "ESL_SC2", "OgamingSC2", "cretetion", "aces_tv", "habathcx", "RobotCaleb", "noobs2ninjas", "maribel", "fad", "behkuhtv", "food"];

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
      channel_url: channel_url
    });
  },
  addLiveStreamer: function(name, details, preview_banner){
    //find the user in the array and add details property
    var streamerIndex = this.findUser(name);
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
  }, 
  sortUsers: function(){
    var filteredUsers = this.users.sort(function(user1, user2){
      return user1.name.localeCompare(user2.name);
      /*
      if (user1.name.toLowerCase() < user2.name.toLowerCase()) {
        return -1;
      }
      if (user1.name.toLowerCase() > user2.name.toLowerCase()) {
        return 1;
      }
      return 0;
      */
    });
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

      userList.sortUsers();
      view.displayUsers(userList.users);
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
  displayUsers: function(users){
    var channelUl = document.getElementById("channelsList");
    channelUl.innerHTML = "";
    
    users.forEach(function(user){
      if (user.active){
        //creates new list item element
        var channel_Li = document.createElement("li");
        channel_Li.className = "single_channel"
        channelUl.appendChild(channel_Li);

        //creates new anchor tag element
        var anchor = document.createElement("a");
        anchor.href = user.channel_url;
        anchor.target = "_blank";
        
        //create channel_prev-img div element
        var channel_prev_img = document.createElement("div");
        channel_prev_img.className = "channel_prev-img";

        
        if (user.online){
          var prev_img_src = document.createElement("img");
          prev_img_src.className = "prev_img_src";
          prev_img_src.src = user.preview_banner;
          channel_prev_img.appendChild(prev_img_src);

        }
        else if (user.active && user.profile_banner !== null){
          var prev_img_src = document.createElement("img")
          prev_img_src.className = "prev_img_src";
          prev_img_src.src = user.profile_banner;
          channel_prev_img.appendChild(prev_img_src);
        }

        channel_Li.appendChild(anchor);
        anchor.appendChild(channel_prev_img);

        //creates a cover-overlay div
        var overlayDiv = document.createElement("div");
        overlayDiv.className = "cover-overlay";
        var status = (user.online) ? "online":"offline";
        overlayDiv.classList.add(status);
        if (user.online){
              var h4 = document.createElement("h4");
              h4.className = "streaming_details";
              h4.innerHTML = user.details;
              overlayDiv.appendChild(h4);
        }
        anchor.appendChild(overlayDiv);

        //creates user info div element
        var newInfoDiv = document.createElement("div");
        newInfoDiv.className = 'user_info';
        anchor.appendChild(newInfoDiv);

        var user_img = document.createElement("img");
        user_img.src = user.small_logo;
        user_img.className = "user_img";
        newInfoDiv.appendChild(user_img); 
        
        
        var user_name = document.createElement("span");
        user_name.className = "user_name";
        user_name.textContent = user.display_name.toUpperCase();
        newInfoDiv.appendChild(user_name); 
        
        var status = document.createElement("span");
        status.className = (user.online) ? "status_online":"status_offline";
        status.textContent = (user.online) ? "online":"offline";
        newInfoDiv.appendChild(status);   
        
      }
      else{
        var channel_Li = document.createElement("li");
        channel_Li.className = "single_channel";
        /*channel_Li.classList.add("invalidUser");*/
        channelUl.appendChild(channel_Li);

        //create channel_prev-img div element
        var channel_prev_img = document.createElement("div");
        channel_prev_img.className = "channel_prev-img";
        channel_Li.appendChild(channel_prev_img); 

        var newInfoDiv = document.createElement("div");
        newInfoDiv.className = 'user_info';
        channel_Li.appendChild(newInfoDiv);
        
        var user_img = document.createElement("img");
        user_img.src = "http://2am.ninja/twitch/img/unknown.png";
        user_img.className = "user_img";
        
        newInfoDiv.appendChild(user_img); 

        var user_name = document.createElement("span");
        user_name.className = "user_name";
        user_name.textContent = user.name.toUpperCase();
        newInfoDiv.appendChild(user_name); 
        
        var status = document.createElement("span");
        status.className = "status_invalid";
        status.textContent = "does not exist";
        newInfoDiv.appendChild(status);   
      }
    });
    this.addEventListeners("cover-overlay");
  },
//went from 60 lines to 13 woot woot 
/*filterUsers: function(filter){
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
  
},
*/

addEventListeners: function(className){
   var classList = document.getElementsByClassName(className);

   for (var i = 0; i < classList.length; i++) {
    classList[i].addEventListener("mouseover", function(){
    this.style.opacity = 0.8;
        });
  
   classList[i].addEventListener("mouseleave", function(){
  this.style.opacity = 0;
        });
}

},

setUpEventListeners: function(){
     
    document.getElementById("showAllBtn").addEventListener("click", function(){
      this.displayUsers(userList.users);
        }.bind(this));
    
    document.getElementById("showOnlineBtn").addEventListener("click", function(){
        var filteredUsers = userList.users.filter(function(user){
          return user.active && user.online;
        });
        this.displayUsers(filteredUsers);
      }.bind(this));
    
    document.getElementById("showOfflineBtn").addEventListener("click", function(){
      var filteredUsers = userList.users.filter(function(user){
        return (user.active && !user.online);
      });
      this.displayUsers(filteredUsers);
    }.bind(this));
  }
};

controller.getTwitchUsers(potentialUsers);
view.setUpEventListeners();