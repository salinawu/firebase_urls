(function() {
  // Initialize Firebase
  const config = {
    apiKey: "AIzaSyCC5Ti93aqg0ZGekqjXnXke0HgIlHLe-XI",
    authDomain: "salina-civis-project.firebaseapp.com",
    databaseURL: "https://salina-civis-project.firebaseio.com",
    storageBucket: "",
    messagingSenderId: "746191099551"
  };
  firebase.initializeApp(config);

  // retrieve the html element for the list of urls and the firebase element
  // for the list of urls
  const urlList = document.getElementById('urls');
  const urlRef = firebase.database().ref().child('url');

  // modifying database - adding elements from user input and adding upvotes
  function addURL() {
    const url = document.getElementById("user_url").value;
    const description = document.getElementById("user_description").value;
    firebase.database().ref('url/' + url).set({
      comments: {},
      description: description,
      upvotes: 0
    });
  };

  // add the button and functionality for upvoting a url
  // receives the list item to attach the button too and the data corresponding to LI to use
  function upvoting(snap, li) {
    const upvote = document.createElement('upvote');
    upvote.innerHTML = "Upvote";
    li.appendChild(upvote);
    upvote.addEventListener(
      "click", function() {
        const curr_upvotes = snap.val().upvotes;
        urlRef.child(snap.key).update({
          upvotes: curr_upvotes + 1
        });
      }
    )
  };

  // displaying comments functionality
  function display_comments(snap, all_comments) {
    //initialize to empty array and then if there are comments, get comments.
    var comments_arr = [];
    if (snap.val()['comments']) {
      comments_arr = Object.keys(snap.val()['comments']).map(function(k) { return snap.val()['comments'][k] });
    };

    // make a new element for each comment and attach to broader 'all_comments' umbrella element
    comments_arr.map(function(k) {
      const comments = document.createElement('comments');
      comments.innerText = k;
      all_comments.appendChild(comments);
    });
  };

  // when element is added, create a new list element to display
  urlRef.on('child_added', snap => {
    const li = document.createElement('li');
    li.innerText = snap.key;
    li.id = snap.key;

    // add upvoting functionality and attach upvotes to display
    const upvotes = document.createElement('upvotes');
    upvotes.innerText = snap.val()['upvotes'];
    li.appendChild(upvotes);
    upvoting(snap, li);

    // render comments into an umbrella element and attach to the corresponding url
    const all_comments = document.createElement('all_comments');
    display_comments(snap, all_comments);
    li.appendChild(all_comments);

    // attach this added url to list of urls displayed
    urlList.appendChild(li);

  });

  // similarly, change the list view when a url is changed
  urlRef.on('child_changed', snap => {
    const liChanged = document.getElementById(snap.key);
    liChanged.innerText = snap.key;

    // upvote display and path to logic
    const upvotes = document.createElement('upvotes');
    upvotes.innerText = snap.val()['upvotes'];
    liChanged.appendChild(upvotes);
    upvoting(snap, liChanged);

    // comments display
    const all_comments = document.createElement('all_comments');
    display_comments(snap, all_comments);
    liChanged.appendChild(all_comments);

  });

  // ...and remove url from view when it's removed from database
  urlRef.on('child_removed', snap => {
    const liRemove = document.getElementById(snap.key);
    liRemove.remove();
  });

  // event listeners for buttons - url submission
  document.getElementById("url_submit").onclick = function() {
    addURL();
  };

  // familiarization --

  // playing around with live database in webcast tutorial
  const one = document.getElementById('one');

  // this gets the DB and then the child of object called 'text'
  const dbRef = firebase.database().ref().child('text');

  // snap is a 'data snapshot'
  // when the value changes ('on'), inner text of one is changed
  // dbRef.on('child_added', snap => console.log(snap.val()));
}());
