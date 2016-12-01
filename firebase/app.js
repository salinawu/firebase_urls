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

  // when element is added, create a new list element to display
  urlRef.on('child_added', snap => {
    const li = document.createElement('li');
    li.innerText = JSON.stringify(snap.key, null, 3);
    li.id = snap.key;
    const comments = document.createElement('comments')
    comments.innerText = snap.val()['comments'];
    li.ul = comments;

    urlList.appendChild(li);
  });

  // similarly, change the list view when a url is changed
  urlRef.on('child_changed', snap => {
    const liChanged = document.getElementById(snap.key);
    liChanged.innerText = snap.val();
  });

  // ...and remove url from view when it's removed from database
  urlRef.on('child_changed', snap => {
    const liRemove = document.getElementById(snap.key);
    liRemove.remove();
  });

  // playing around with live database in webcast tutorial
  const one = document.getElementById('one');

  // this gets the DB and then the child of object called 'text'
  const dbRef = firebase.database().ref().child('text');

  // snap is a 'data snapshot'
  // when the value changes ('on'), inner text of one is changed
  dbRef.on('child_added', snap => console.log(snap.val()));

  function addURL() {
    const url = document.getElementById("user_url").value;
    console.log(url);
    const description = document.getElementById("user_description").value;
    firebase.database().ref('url/' + url).set({
      comments: {},
      description: description,
      upvotes: 0
    });
  }

  document.getElementById("url_submit").onclick = function() {
    addURL();
  };

}());
