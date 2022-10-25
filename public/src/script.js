const firebaseConfig = {
  apiKey: "AIzaSyD077VIgWG-33DwRks6uFmMwbgfClPDlEI",
  authDomain: "cisc472-bawker.firebaseapp.com",
  projectId: "cisc472-bawker",
  databaseURL: "https://cisc472-bawker-default-rtdb.firebaseio.com/",
  storageBucket: "cisc472-bawker.appspot.com",
  messagingSenderId: "859322932460",
  appId: "1:859322932460:web:218c4619be4da4c4cc19c9",
  measurementId: "G-NLXEN0T0EP"
};
const app = firebase.initializeApp(firebaseConfig);
var db = firebase.database();

/**
 * Firebase authentication functions 
 * 
 * login() - logs user in if credentials match firebase db
 * - throws errors if not a created user
 * 
 * signup() - creates new user and sends credentials to firebase db 
 * - sends error if credentials match already created user
 * 
 * logout() - signs out current user
 *  - error will probably never happen
 * */ 
function login() {
    var userName = document.getElementById("user_field").value;
    var userPass = document.getElementById("pass_field").value;
    //window.alert(userName + " " + userPass);
    firebase.auth().signInWithEmailAndPassword(userName, userPass).catch((error) => {
        var errorCode = error.code;
        var errorMessage = error.message;
        window.alert(errorMessage + " " + errorCode);
    });
}
function signup() {
    var userName = document.getElementById("user_field").value;
    var userPass = document.getElementById("pass_field").value;
    firebase.auth().createUserWithEmailAndPassword(userName, userPass).then((userCredential) => {
    // Signed in 
    const user = userCredential.user;
    console.log(user);
    }).catch((error) => {
        var errorCode = error.code;
        var errorMessage = error.message;
        window.alert(errorMessage + " " + errorCode);
  });
  writeUserData(userName.substring(0, userName.indexOf('@')), userName.substring(0, userName.indexOf('@')), userName);
}
function logout() {
  firebase.auth().signOut().then(function() {
        //signout success
    }).catch(function(error) {
        var errorCode = error.code;
        var errorMessage = error.message;
        window.alert(errorMessage + " " + errorCode);
    });
}

/**
 * submitBawk()
 * takes in form information
 * sends to render tweet
 */
function submitBawk() {
  const user = firebase.auth().currentUser;
  var myRef = firebase.database().ref().child("/bawks").push();
  var tweetID = myRef.key;
  var timestamp = new Date();
  timestamp = timestamp.toLocaleString();
  var bawkerPost = document.getElementById("bawker_post").value;
  const myObj = {
    "content": bawkerPost, 
    "likes": 0, 
    "timestamp": timestamp, 
    "authorID": user.uid,
    "author": {
      "nickname": user.email,
      "profilePic": "src/assets/bawk.png"
    }
  };
  updateUser(user, tweetID);
  myRef.set(myObj);
}


/** Tweet Box
 * Character limiter
 */
$(document).ready(function(){
    var maxLength = 145;
    $("textarea").keypress(function(){
       var length = $(this).val().length;
       var length = maxLength - length;
       $("#countdown").text(length);
    })
});


/** NEW SHIT */
function settings() {
  var x = document.getElementById("prof_pic");
  var y = document.getElementById("setting_update");
  if (x.style.display === "none" && y.style.display === "none") {
    x.style.display = "block";
    y.style.display = "block";
  } else {
    x.style.display = "none";
    y.style.display = "none";
  }
}

function updateProfImg(user) {
  console.log(user);
  console.log(user.uid);
  var userRef = firebase.database().ref().child("/bawks").child(user.uid);
  userRef.child("/profilePic/").set($("#prof_pic").val());
}

let updateUser = (user, tweet_id)=>{;
  var userRef = firebase.database().ref().child("/users").child(user.uid);
  userRef.get().then((ss) => {
    let user_data = ss.val();
    if(!user_data){
      const new_data = {
        handle: user.author.nickname,
        bawk:{
          [tweet_id] : true,
        } 
      };
      userRef.set(new_data);
    } 
    else{
      const new_tweet = {
          [tweet_id] : true,
      } 
      userRef.child("/bawks/").update(new_tweet);
    }
  }); 
}

let renderTweet = (tObj, uuid)=>{
  $("#tweet_list").prepend(`
<div class="card mb-3 tweet" data-uuid="${uuid}" style="max-width: 540px;">
  <div class="row g-0">
    <div class="col-md-4">
      <img src="${tObj.author.profilePic}" class="img-fluid rounded-start" alt="...">
    </div>
    <div class="col-md-8">
      <div class="card-body">
        <h5 class="card-title">${tObj.author.nickname}</h5>
        <p class="card-text">${tObj.content}</p>
        <button class="like-btn" onclick="submitLike()" data-tweetid="${uuid}">👍 ${tObj.likes}</button>
        <p class="card-text"><small class="text-muted">Tweeted at ${tObj.timestamp}</small></p>
      </div>
    </div>
  </div>
</div>
  `);
  firebase.database().ref("/number_likes").child(uuid).child("likes").on("value", ss=>{
    $(`.like-button[data-tweetid=${uuid}]`).html(`${ss.val() || 0} Likes`);
  });
}
let renderLogin = () => {
  $("body").html(`
    <div class="login-div">
    <img style="width: 50%; height: 50%;" src="src/assets/bawk.png"/>
    <h3> BAWKER LOGIN</h3>
    <input type="username" placeholder="username" id="user_field"/>
    <input type="password" placeholder="password" id="pass_field"/>
    <button onclick="login()"> Login </button>
    <p> - OR - </p>
    <button onclick="signup()"> Sign up </button>
    </div>
  `);
}
let renderPage = (loggedIn, user_email)=>{
  let myuid = loggedIn.uid;
  $("body").html(`
    <div id="user_div">
      <!--Top Nav-->
      <nav class="navbar justify-content-between">
          <a class="navbar-brand">
              <h1 class="title"> BAWKER </h1>
          </a>
          <form class="search-bar">
              <input type="search" placeholder="Search">
              <button id="search_bar_btn" type="submit">Search</button>
          </form>
      </nav>
      <!--Side Nav-->
      <nav role="navigation" class="nav-list">
          <ul>
              <li>
                  Home
              </li>
              <li>
                  Notifications
              </li>
              <li id="settings">
                  <button id="prof_img_btn" onclick="settings()" style="width: 160px;">Profile Photo Upload</button>
                  <input name="prof_pic" id="prof_pic" placeholder="Image Link Here" style="display: none; width: 250px;"/>
                  <button id="setting_update" style="display: none; width: 250px;" onclick="updateProfImg(${myuid})">Update</button>
              </li>
              <li id="user_profile">
                  Profile: ${user_email}
              </li>
              <li>
                  <button onclick="logout()">Logout</button>
              </li>
          </ul>
      </nav>
      
      <!--Main Tweeting Box-->
      <div class="container">
          <div id="box">
              <h2> What's on your mind? </h2>
              <div class="bottom-container">
                  <textarea id="bawker_post" name="tweet" maxlength="145" placeholder="bawk bawk bawk..."></textarea>
                  <div class="main-tweet-row">
                      <p>media</p>
                      <p>text edit</p>
                      <span id='countdown'> 145 </span>
                      <button class="main-tweet-btn" onclick="submitBawk()"> BAWK </button>
                      <br><h4>All Bawks ...</h4>
                  </div>
              </div>
          </div>
          
      </div>
      
      <!--tweets-->
      <div class="tweet-col">
          <div id="tweet_list">
              
          </div>
      </div>
    </div>
  `);
  let tweetRef = firebase.database().ref("/bawks");
  tweetRef.on("child_added", (ss)=>{
    let tObj = ss.val();
    renderTweet(tObj, ss.key);
    $(".like-button").off("click");
    $(".like-button").on("click", (evt)=>{
      let clickedTweet = $(evt.currentTarget).attr("data-tweetid");
      let likesRef = firebase.database().ref("/number_likes").child(clickedTweet);
      toggleLike(likesRef, myuid);
    });
  });
};

firebase.auth().onAuthStateChanged(user => {
  if (!user){
    renderLogin();
  } else {
   //$("#login_div").html(`<button onclick="logout()">Logout</button>`);
    var user_email = firebase.auth().currentUser;
    renderPage(user, user_email.email);
  }
})