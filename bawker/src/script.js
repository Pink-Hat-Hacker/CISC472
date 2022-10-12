//THE KEY AUTH LISTENING FUNCTION IS THIS ONE:
firebase.auth().onAuthStateChanged((user) => {
    if (user) {
      // User is signed in, see docs for a list of available properties
      // https://firebase.google.com/docs/reference/js/firebase.User
      //var uid = user.uid;
      document.getElementById("user_div").style.display = "block";
      document.getElementById("login_div").style.display = "none";
    } else {
      // User is signed out
      document.getElementById("user_div").style.display = "none";
      document.getElementById("login_div").style.display = "block";
    }
  });

function mylogin() {
    var userName = document.getElementById("user_field").value;
    var userPass = document.getElementById("pass_field").value;

    firebase.auth().signInWithEmailAndPassword(userName, userPass)
  .then((userCredential) => {
    // Signed in
    var user = userCredential.user;
    // ...
  })
  .catch((error) => {
    var errorCode = error.code;
    var errorMessage = error.message;
    window.alert(errorMessage + " " + errorCode);
  });
}
  //THE KEY SIGNOUT IS THIS:
  firebase.auth().signOut();
  
  //CREATE AN ACCOUNT WITH EMAIL PASSWORD

  
//USE AN ACCOUNT WITH EMAIL/PASSWORD
// firebase.auth().signInWithEmailAndPassword(email, password)
// .then((userCredential) => {
//     // Signed in
//     var user = userCredential.user;
//     // ...
// })
// .catch((error) => {
//     var errorCode = error.code;
//     var errorMessage = error.message;
// });

$(document).ready(function(){
    //Character limit js
    var maxLength = 140;
    $("textarea").keypress(function(){
       var length = $(this).val().length;
       var length = maxLength - length;
       $("#countdown").text(length);
    })
});