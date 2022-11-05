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
 * writeUserData(userId, name, email)
 * @param {*} userId 
 * @param {*} name 
 * @param {*} email 
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

function writeUserData(uuid, userId, email) {
  firebase.database().ref('users/' + uuid).set({
    username: userId,
    email: email,
    profilePic: "src/assets/bawk.png"
  });
}
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
    writeUserData(user.uid, userName.substring(0, userName.indexOf('@')), userName);
    }).catch((error) => {
        var errorCode = error.code;
        var errorMessage = error.message;
        window.alert(errorMessage + " " + errorCode);
  });
 
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
  var user = firebase.auth().currentUser;
  var myRef = firebase.database().ref().child("/users/" + user.uid + "/bawks/").push();
  var bawkRef = firebase.database().ref("bawks/").push();
  var timestamp = new Date();
  timestamp = timestamp.toLocaleString();
  var bawkerPost = document.getElementById("bawker_post").value;
  var media = document.getElementById("tweet_media").value;
  const myObj = {
    "content": bawkerPost, 
    "likes": 0, 
    "timestamp": timestamp, 
    "authorID": user.uid,
    "media": media,
    "author": {
      "email": user.email,
      "nickname": user.email.substring(0, user.email.indexOf('@'))
    }
  };
  bawkRef.set(myObj);
  myRef.set(myObj);
}

/**
 * Update User Profile Pic
 */
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
function updateProfImg() {
  var user = firebase.auth().currentUser;
  var userRef = firebase.database().ref().child("/users/" + user.uid);
  userRef.child("profilePic").set($("#prof_pic").val());
  location.reload();
}

/** Tweet Likes */
let toggleLike = (tweetRef, uid)=>{
  tweetRef.transaction((tObj) => {
    if (!tObj) {
      tObj = {likes: 0};
    }
    if (tObj.likes && tObj.likes_by_user[uid]) {
      tObj.likes--;
      tObj.likes_by_user[uid] = null;
    } else {
      tObj.likes++;
      if (!tObj.likes_by_user) {
        tObj.likes_by_user = {};
      }
      tObj.likes_by_user[uid] = true;
    }
    return tObj;
  });
}
let renderedTweetLikeLookup = {};


/**
 * renderTweet - put HTML onto page with user data
 * @param {JSON of Tweet/User info} tObj 
 * @param {Unique ID of Tweet} uuid 
 */
let renderTweet = (tObj, uuid)=>{
  //var user = firebase.auth().currentUser;
  var userEmail = tObj.authorID;
  /** - Profile Picture - */
  var profPic = "src/assets/bawk.png";
  var myRef = firebase.database().ref().child("/users").child(userEmail);
  myRef.get().then((ss) => {
    let userData = ss.val();
    if(!userData){
      //console.log("null");
    }else{
      profPic = userData.profilePic;
      $("#user_img-"+uuid).html(`<img src="${profPic}" class="img-fluid rounded-start" alt="...">`);
    }
  $("#tweet_list").prepend(`
    <div class="card mb-3 tweet" data-uuid="${uuid}" style="max-width: 540px;">
      <div class="row g-0">
        <div id="user_img" class="col-md-4">
          <img src="${profPic}" class="img-fluid rounded-start" alt="...">
        </div>
        <div class="col-md-8">
          <div class="card-body">
            <h5 class="card-title">${tObj.author.nickname}</h5>
            <p class="card-text">${tObj.content}</p>
            <button class="like-btn" data-tweetid="${uuid}" onlclick="console.log("getting here")">${tObj.likes}</button>
            <p class="card-text"><small class="text-muted">Tweeted at ${tObj.timestamp}</small></p>
          </div>
        </div>
      </div>
    </div>
  `);
  });
  firebase.database().ref("/likes").child(uuid).child("likes").on("value", ss=>{
    $(`.like-btn[data-tweetid=${uuid}]`).html(`👍 ${ss.val() || 0} Likes`);
  });
}


/**
 * renderLogin - put HTML onto page for login
 */
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


/**
 * renderPage - put page HTML on page with user info
 * @param {userdata object} loggedIn 
 * @param {user email id} user_email 
 */
let renderPage = (loggedIn, user_email)=>{
  let myuid = loggedIn.uid;
  //writeUserData(myuid, user_email.substring(0, user_email.indexOf('@')), user_email);
  $("body").html(`
    <!--Top Nav-->
    <div class="top-nav">
      <nav class="navbar justify-content-between">
          <h1 class="title"> BAWKER </h1>
          <div class="search-bar">
            <form>
                <input type="search" placeholder="Search">
                <button id="search_bar_btn" type="submit">Search</button>
            </form>
          </div>
      </nav>
    </div>

    <!--Side Nav-->
    <div class="side-nav">
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
                  <button id="setting_update" style="display: none; width: 250px;" onclick="updateProfImg()">Update</button>
              </li>
              <li id="user_profile">
                  Profile: ${user_email}
              </li>
              <li>
                  <button onclick="logout()">Logout</button>
              </li>
          </ul>
      </nav>
    </div>
      
    <!--Main Tweeting Box-->
    <div class="container">
      <h2> What's on your mind? </h2>
      <div class="input-container">
          <textarea id="bawker_post" name="tweet" maxlength="145" placeholder="bawk bawk bawk..."></textarea>
      </div>
      <div class="extra-container">
          <input name="tweet_media" id="tweet_media" placeholder="Media Link Here" style="width: 250px;"/>
          <p>text edit</p>
          <span id='countdown'> 145 </span>
      </div>
      <button class="main-tweet-btn" onclick="submitBawk()"> BAWK </button>
      <br><h3>Your Bawks ...</h3>
    </div>
      
    <!--tweets-->
    <div class="tweet-col">
        <div id="tweet_list">
            
        </div>
    </div>
  `);

  /** Tweet Box
 * Character limiter
 */
 $(document).ready(function(){
  var maxLength = 145;
  $("textarea").keypress(function(){
    console.log("here");
     var length = $(this).val().length;
     var length = maxLength - length;
     $("#countdown").text(length);
  })
});

  //here we can do your bawks or all bawks switch
  let tweetRef = firebase.database().ref("/bawks/");
  tweetRef.on("child_added", (ss)=>{
    let tObj = ss.val();
    renderTweet(tObj, ss.key);
    $(".like-btn").off("click");
    $(".like-btn").on("click", (evt)=>{
      let clickedTweet = $(evt.currentTarget).attr("data-tweetid");
      let mylikesRef = firebase.database().ref("/likes").child(clickedTweet);
      toggleLike(mylikesRef, myuid);
    });
  });
};

firebase.auth().onAuthStateChanged(user => {
  if (!user){
    renderLogin();
  } else {
    var user_email = firebase.auth().currentUser;
    renderPage(user, user_email.email);
  }
})