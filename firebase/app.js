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

  // when element is added, create a new list element to display
  urlRef.on('child_added', snap => {
    const li = document.createElement('li');
    li.innerText = JSON.stringify(snap.val(), null, 3);
    li.id = snap.key;

    const comments = document.createElement('comments')
    comments.innerText = snap.val()['comments'];
    li.ul = comments;

    urlList.appendChild(li);

    const upvote = document.createElement('upvote');
    upvote.innerHTML = "Upvote";
    li.appendChild(upvote);
    upvote.addEventListener(
      "click", function() {
        const curr_upvotes = snap.val().upvotes;
        console.log(curr_upvotes);
        urlRef.child(snap.key).update({
          upvotes: curr_upvotes + 1
        });
      }
    )
  });

  // similarly, change the list view when a url is changed
  urlRef.on('child_changed', snap => {
    const liChanged = document.getElementById(snap.key);
    liChanged.innerText = JSON.stringify(snap.val(), null, 3);
    const upvote = document.createElement('upvote');
    upvote.innerHTML = "Upvote";
    liChanged.appendChild(upvote);
    upvote.addEventListener(
      "click", function() {
        const curr_upvotes = snap.val().upvotes;
        urlRef.child(snap.key).update({
          upvotes: curr_upvotes + 1
        });
      }
    )
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
