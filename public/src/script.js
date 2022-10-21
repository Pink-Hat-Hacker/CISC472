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
firebase.initializeApp(firebaseConfig);

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
firebase.auth().onAuthStateChanged((user) => {
    if (user) {
      // User is signed in, see docs for a list of available properties
      // https://firebase.google.com/docs/reference/js/firebase.User
      //var uid = user.uid;
      document.getElementById("user_div").style.display = "block";
      document.getElementById("login_div").style.display = "none";

      var user = firebase.auth().currentUser;
      if (user != null) {
        var user_name = user.email;
        document.getElementById("user_profile").innerHTML = "Profile: " + user_name;
      }
    } else {
      // User is signed out
      document.getElementById("user_div").style.display = "none";
      document.getElementById("login_div").style.display = "block";
    }
});
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
    //var user = userCredential.user;
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
 * renderTweets()
 */
let renderTweets = () => {
  var user = firebase.auth().currentUser;
  var timestamp = new Date();
  timestamp = timestamp.toLocaleString();
  var bawkerPost = document.getElementById("bawker_post").value;
  document.getElementById("tweet_list").insertAdjacentHTML("afterbegin", (`
      <div class="card mb-3" style="max-width: 540px;">
      <div class="row g-0">
          <div class="col-md-4">
          <img src="src/assets/bawk.png" class="img-fluid rounded-start" alt="...">
          </div>
          <div class="col-md-8">
            <div class="card-body">
                <h5 class="card-title">${user.email}</h5>
                <p class="card-text">${bawkerPost}</p>
            </div>
            <div class="bottom-of-tweet">
              <button class="like-btn" onclick="submitLike()">👍 </button>
              <p class="card-text"><small class="text-muted">${timestamp}</small></p>
            </div>
          </div>
      </div>
    </div>
  `));
}


function submitBawk() {
  renderTweets();
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