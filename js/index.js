//Make a get channel request for every user in the list.
//If we get a 404 error, then the user's channel does not exist.
//If we do get a channel object, then we get its basic information (name, logo, channel_url)
//After all the channel requests have been completed, we create a string of active twitch users, and make a get stream request.
//if the user is part of the returned stream array, then we gather the current stream info and updated the user to be online.
//else we get the user's live stream  detail  
var potentialUsers=["freecodecamp", "ESL_SC2", "OgamingSC2", "cretetion", "storbeck", "habathcx", "RobotCaleb", "noobs2ninjas", "maribel", "fad"];

//model
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
   // console.log("streamerIndex is: ", streamerIndex);
    if(streamerIndex != -1){
     this.users[streamerIndex].online = true;
     this.users[streamerIndex].details = details;

    }
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

//controller
var controller = {
  
  getActiveUserStreams: function(){
    var activeUsers = ''; 
    userList.users.forEach(function(user){
    if (user.active){
      activeUsers += user.name + ',';
    }
  });
    this.getStreams(activeUsers);
  },
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
           resolve(request.response);
          }
        reject(Error(request.statusText)); // We reached our target server, but it returned an error
        }
      };
      request.onerror = function() {
      reject(Error("Network Error"));// There was a connection error of some sort
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
         console.log(obj.channel.name);
         userList.addLiveStreamer(obj.channel.name, obj.channel.status);
       });
      }else{
       // We reached our target server, but it returned an error   
      }
    console.log(userList.users);
  };
    request.onerror = function() {
      // There was a connection error of some sort
    };
    request.send();
  },
  
  getTwitchUsers: function(potentialUsers){
    var requests = [];
    // var theControllerObj = this;
   potentialUsers.forEach(function (userName){
     //But here inside the anonymous function (that we pass to the forEach method), "this" no longer refers to the controller object.​
    // This inner function cannot access the outer function's "this"​
    requests.push(
    this.getChannel(userName).then(function(response) {
     var channel = JSON.parse(response);
    if (channel.error == "Not Found"){
      userList.addInactiveUser(userName);
        document.getElementById('error').innerHTML = channel.error;
      }else{
        document.getElementById('name').innerHTML = channel.name;
        var channel_url = 'https://player.twitch.tv/?channel=' + channel.display_name;
        userList.addActiveUser(channel.name, channel.display_name, channel.logo, channel_url);
      }
    }, function(error) {
        console.error("Failed!", error);
      
      })
      )
 }, this);
   Promise.all(requests).then(function(results) {
    console.log("All promises resolved!");
    console.log(requests.length);
   // theControllerObj.getActiveUserStreams();
this.getActiveUserStreams();
  }.bind(this)).catch(function(error) {
  // One or more promises was rejected
  }.bind(this));
   
},
  //change to function name to addPages?
  search: function(searchWord){ 
    pageList.clear();
    view.clearList();
    var apiURL = 'https://en.wikipedia.org/w/api.php?format=json&origin=*&action=query&generator=search&gsrlimit=10&prop=extracts&exintro&explaintext&exsentences=1&exlimit=max&gsrsearch=' + searchWord;
    var request = new XMLHttpRequest();
    request.open('GET', apiURL, true);
    request.onload = function() {
      if (request.status >= 200 && request.status < 400)  { // Success!
        var data = JSON.parse(request.response);
        var results = data.query.pages; //results is an object of objects
        var pageIds= Object.getOwnPropertyNames(results);
         pageIds.forEach(function(id){
            var wiki_url = 'https://en.wikipedia.org/?curid=' + id;
            pageList.addPage(id, results[id].title, results[id].extract, wiki_url);
         });
         view.displayPages();

      }else{
      // We reached our target server, but it returned an error
      }
    };
    request.onerror = function() {
      // There was a connection error of some sort
    };
    request.send();
  }    
};

//view
var view = {
  //show pages in an unordered list
  displayPages: function(){
    document.getElementById("wikipedia-logo").className="transformWikiImg";
    var pageUl = document.getElementById("pageList");
    
    pageList.pages.forEach(function(page){
      var anchor = document.createElement("a");
      anchor.href = page.url;
      anchor.target = "_blank";
      var pageLi = document.createElement("li");
      var h3 = document.createElement("h3");               
      h3.textContent = page.title;
      var paragraph = document.createElement("p");
      paragraph.textContent = page.extract;
      pageUl.appendChild(anchor);
      anchor.appendChild(pageLi);
      pageLi.appendChild(h3);
      pageLi.appendChild(paragraph);
    });
  },
  
  clearList: function(){
  document.getElementById("pageList").innerHTML='';
  },
  
  setUpEventListeners: function(){
    //create an event listener for when the user submits a word to search
    /*document.getElementById("searchForm").addEventListener("click", function(event){
      event.preventDefault(); //prevents from refreshing the page
      var searchInput = document.getElementById("searchInput").value;
      controller.search(searchInput);  
      */
     document.getElementById("showAllBtn").addEventListener("click", function(){
      var currentButtonSelection = document.getElementById("currentButtonSelection");
       currentButtonSelection.innerHTML = "Show All Users";
        });
    document.getElementById("showOnlineBtn").addEventListener("click", function(){
      var currentButtonSelection = document.getElementById("currentButtonSelection");
       currentButtonSelection.innerHTML = "Show Online Users";
       });
    document.getElementById("showOfflineBtn").addEventListener("click", function(){
      var currentButtonSelection = document.getElementById("currentButtonSelection");
      currentButtonSelection.innerHTML = "Show Offline Users";
       
    });
  }
};

controller.getTwitchUsers(potentialUsers);
view.setUpEventListeners();