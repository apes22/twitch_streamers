var potentialUsers=["freecodecamp", "ESL_SC2", "OgamingSC2", "cretetion", "aces_tv", "habathcx", "RobotCaleb", "noobs2ninjas", "fad", "behkuhtv", "food"];

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
  //show pages in an unordered list
  displayUsers: function(users){
    var channelUl = document.getElementById("channelsList");
    channelUl.innerHTML = ""; //clears current list
    
    users.forEach(function(user){

       //Creates a new list item element
        var channel_Li = document.createElement("li");
        channel_Li.className = "single_channel"
        channelUl.appendChild(channel_Li);


        if (user.active){
          //Creates new anchor tag element
          var anchor = document.createElement("a");
          anchor.href = user.channel_url;
          anchor.target = "_blank";
          channel_Li.appendChild(anchor);
        
          //Creates a channel_prev-img div element
          var channel_prev_img = document.createElement("div");
          channel_prev_img.className = "channel_prev-img";

          
           //Get source of channel preview image
          if (user.online){
            var prev_img_src = document.createElement("img");
            prev_img_src.className = "prev_img_src";
            prev_img_src.src = user.preview_banner;
            channel_prev_img.appendChild(prev_img_src);
            
          }else if (user.active && user.profile_banner !== null){
            var prev_img_src = document.createElement("img");
            prev_img_src.className = "prev_img_src";
            prev_img_src.src = user.profile_banner;
            channel_prev_img.appendChild(prev_img_src);
          }
          
          anchor.appendChild(channel_prev_img);

          //Creates a cover-overlay div
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

          //Creates a user info div element
          var newInfoDiv = document.createElement("div");
          newInfoDiv.className = 'user_info';
          anchor.appendChild(newInfoDiv);

          //Creates small logo image element
          var user_img = document.createElement("img");
          user_img.src = user.small_logo;
          user_img.className = "user_img";
          newInfoDiv.appendChild(user_img); 
          
          //Create username element
          var user_name = document.createElement("span");
          user_name.className = "user_name";
          user_name.textContent = user.display_name.toUpperCase();
          newInfoDiv.appendChild(user_name); 
          
         
          
      }else{
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
          
      }
       //Creates status element 
          var status = document.createElement("span");
          if (user.active){
           status.className = (user.online) ? "status_online":"status_offline";
           status.textContent = (user.online) ? "online":"offline";
          }
          else{
            status.className = "status_invalid";
            status.textContent = "does not exist";
          }
          newInfoDiv.appendChild(status);   

    });
    this.addEventListeners("cover-overlay");
  },

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
      view.clearButtonsColor();
      document.getElementById("showAllBtn").style.backgroundColor = '#76daff';
      document.getElementById("showAllBtn").style.opacity = 0.8;
      this.displayUsers(userList.users);
        }.bind(this));
    
    document.getElementById("showOnlineBtn").addEventListener("click", function(){
       view.clearButtonsColor();
      document.getElementById("showOnlineBtn").style.backgroundColor = 'green';
     document.getElementById("showOnlineBtn").style.opacity = 0.8;
     
        var filteredUsers = userList.users.filter(function(user){
          return user.active && user.online;
        });
        this.displayUsers(filteredUsers);
      }.bind(this));
    
    document.getElementById("showOfflineBtn").addEventListener("click", function(){
          view.clearButtonsColor();
      document.getElementById("showOfflineBtn").style.backgroundColor = 'red';
       document.getElementById("showOfflineBtn").style.opacity = 0.8;

      var filteredUsers = userList.users.filter(function(user){
        return (user.active && !user.online);
      });
      this.displayUsers(filteredUsers);
    }.bind(this));
  },

 clearButtonsColor: function(){
    var buttons = document.querySelectorAll('button');
    for (var i=0; i<buttons.length;i++){
      buttons[i].style.backgroundColor = '#7d5bbe';
      buttons[i].style.opacity =  1;
    }
 }
};


controller.getTwitchUsers(potentialUsers);
view.setUpEventListeners();