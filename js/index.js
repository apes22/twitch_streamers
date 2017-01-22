var potentialUsers=["freecodecamp", "ESL_SC2", "OgamingSC2", "cretetion", "aces_tv", "RobotCaleb", "noobs2ninjas", "xaled", "behkuhtv", "food","steveaoki"];

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
      return user1.name.toLowerCase().localeCompare(user2.name.toLowerCase());
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
           resolve(request.response); //resolving an invalid user because we still want to add each username to our list of users
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
    if (request.status >= 200 && request.status < 400)  { 
      var streams = JSON.parse(request.response).streams;
      streams.forEach(function(obj){
        userList.addLiveStreamer(obj.channel.name, obj.channel.status, obj.preview.medium);
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
  //show users in an unordered list
displayUsers: function(users){
  //clears current list
  var channelUl = document.getElementById("channelsList");
  channelUl.innerHTML = ""; 

  users.forEach(function(user){
     //Creates a new list item element
      var channel_Li = document.createElement("li");
      channel_Li.className = "single_channel"
      channelUl.appendChild(channel_Li);

      if (user.active){
        var anchor = this.createAnchor(user.channel_url);
        channel_Li.appendChild(anchor);
       
        var channel_prev_img = this.createPreviewImg(user.active, user.online, user.profile_banner, user.preview_banner);
        anchor.appendChild(channel_prev_img);

        var overlayDiv = this.createOverlay(user.online, user.details);
        anchor.appendChild(overlayDiv);

        var infoDiv = this.createInfoDiv(user.small_logo, user.display_name, user.active, user.online);
        anchor.appendChild(infoDiv);

      }else{
        var channel_prev_img = this.createPreviewImg(user.active);
        channel_Li.appendChild(channel_prev_img); 

        var unknown_logo = "http://2am.ninja/twitch/img/unknown.png";
        var infoDiv = this.createInfoDiv(unknown_logo, user.name);
        channel_Li.appendChild(infoDiv);    
      }  
  }, this);
  this.addEventListener("cover-overlay");
},

//Creates an anchor element
createAnchor: function(url){
   
   var a = document.createElement("a");
   a.href = url;
   a.target = "_blank";
   return a;
},
//Creates a channel_prev-img div element
createPreviewImg: function(isActive, isOnline, profileBanner, previewBanner){
  var prev_img = document.createElement("div");
  prev_img.className = "channel_prev-img";     

  if (isActive){ 
    var prev_img_src = document.createElement("img");
    prev_img_src.className = "prev_img_src";
    if (isOnline){
      prev_img_src.src = previewBanner;
      prev_img.appendChild(prev_img_src);
      }else if(profileBanner !== null){
        prev_img_src.src = profileBanner;
        prev_img.appendChild(prev_img_src);
      }
    }
  return prev_img;     
},

//Creates an overlay
createOverlay: function(isOnline, details){
  var overlay =  document.createElement("div");
  overlay.className = "cover-overlay";

  var status = (isOnline) ? "online":"offline";
  overlay.classList.add(status);
  if (isOnline){
      var h4 = document.createElement("h4");
      h4.className = "streaming_details";
      h4.innerHTML = details;
      overlay.appendChild(h4);
  }
  return overlay;
},

createInfoDiv: function(logo, displayName, isActive, isOnline){ 
  var info = document.createElement("div");
  info.className = 'user_info';

  //Creates small logo image element
  var user_img = document.createElement("img");
  user_img.src = logo;
  user_img.className = "user_img";
  info.appendChild(user_img); 

  //Create username span element
  var user_name = document.createElement("span");
  user_name.className = "user_name";
  user_name.textContent = displayName.toUpperCase();
  info.appendChild(user_name); 

  var status = document.createElement("span");
  if (isActive){
    status.className = (isOnline) ? "status_online":"status_offline";
    status.textContent = (isOnline) ? "online":"offline";
  }
  else{
    status.className = "status_invalid";
    status.textContent = "does not exist";
  }
  info.appendChild(status);  

  return info;
},

addEventListener: function(className){
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
  var showAllBtn = document.getElementById("showAllBtn");
  var showOnlineBtn = document.getElementById("showOnlineBtn");
  var showOfflineBtn = document.getElementById("showOfflineBtn");

  showAllBtn.addEventListener("click", function(){
   this.updateActiveButton("showAllBtn");
    this.displayUsers(userList.users);
      }.bind(this));

   showOnlineBtn.addEventListener("click", function(){
     this.updateActiveButton("showOnlineBtn");
      var filteredUsers = userList.users.filter(function(user){
        return (user.active && user.online);
      });
      this.displayUsers(filteredUsers);
    }.bind(this));

  showOfflineBtn.addEventListener("click", function(){
    this.updateActiveButton("showOfflineBtn");
    var filteredUsers = userList.users.filter(function(user){
      return (user.active && !user.online);
    });
    this.displayUsers(filteredUsers);
  }.bind(this));
  },

updateActiveButton: function(activeBtn){
  var activeColor = {
      showAllBtn:'#76daff',
      showOnlineBtn:'green',
      showOfflineBtn:'red'
  };
  var buttons = document.querySelectorAll('button');
  for (var i=0; i<buttons.length;i++){
    buttons[i].style.backgroundColor = (buttons[i].id === activeBtn) ? activeColor[activeBtn] : '#7d5bbe';
    buttons[i].style.opacity =  (buttons[i].id == activeBtn) ? 0.8 : 1; 
  }
  }
};

controller.getTwitchUsers(potentialUsers);
view.setUpEventListeners();