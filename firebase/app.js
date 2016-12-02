(function() {
  // TODO
  // url parsing for special characters .$[]#/
  // user authorization
  // 1 upvote per url per user
  // UX...

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
  // if url already exists, upvote existing
  function addURL() {
    const url = document.getElementById("user_url").value;
    const description = document.getElementById("user_description").value;
    var exists = false;
    var upvotes = 0;

    // check if url exists
    firebase.database().ref('url/' + url).once('value', function(snap) {
      exists = !!snap.val();
      if (exists) {
        upvotes = snap.val().upvotes;
      }
    });

    // if url exists, add upvote
    const db = firebase.database().ref('url/' + url);
    if (exists) {
      urlRef.child(db.key).update({
        upvotes: upvotes + 1
      });
    // else, add new url
    } else {
      db.set({
        comments: {},
        description: description,
        upvotes: 0
      });
    }
  };

  // add the button and functionality for upvoting a url
  // receives the list item to attach the button to and the data corresponding to LI to use
  function upvoting(snap, li) {
    const upvote = document.createElement('upvote');
    upvote.innerHTML = '<button id="upvote" type="button">Upvote</button>';
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
      comments_arr = Object.keys(snap.val()['comments']).map(function(k) {
        return [k, snap.val()['comments'][k]];
      });
    };

    // make a new element for each comment and attach to broader 'all_comments' umbrella element
    comments_arr.map(function(k) {
      const comments = document.createElement('comments');
      comments.innerText = k[0] + ' : ' + k[1];
      all_comments.appendChild(comments);
      add_space(comments);
    });
  };

  // adding comment functionality
  function add_comments(snap, li) {

    const submit_comment = document.createElement('submit_comment');
    submit_comment.innerHTML = '<button id="submit_comment" type="button">Comment</button>';
    submit_comment.addEventListener(
      "click", function() {
        const curr_comments = snap.val().comments || {};
        const author = document.getElementById('author').value;
        const comment = document.getElementById('user_comment').value
        curr_comments.author = comment;
        console.log(curr_comments);
        console.log({author: comment});
        urlRef.child(snap.key).update({
          comments: curr_comments
        });
      }
    )
    li.appendChild(submit_comment);

  }

  // when element is added, create a new list element to display
  urlRef.on('child_added', snap => {
    const li = document.createElement('li');
    li.innerText = snap.key;
    li.id = snap.key;
    add_space(li);

    // add upvoting functionality and attach upvotes to display
    const upvotes = document.createElement('upvotes');
    upvotes.innerText = snap.val()['upvotes'];
    li.appendChild(upvotes);
    upvoting(snap, li);
    add_space(li);

    // render comments into an umbrella element and attach to the corresponding url
    const all_comments = document.createElement('all_comments');
    display_comments(snap, all_comments);
    li.appendChild(all_comments);

    // add comments functionality
    const user_comment = document.createElement('user_comment');
    user_comment.innerHTML = '<input type="text" id="user_comment" placeholder="Your comment"/>';
    const author = document.createElement('author');
    author.innerHTML = '<input type="text" id="author" placeholder="You"/>';
    li.appendChild(user_comment);
    li.appendChild(author);
    add_comments(snap, li);

    // attach this added url to list of urls displayed
    urlList.appendChild(li);
    add_space(li);

  });

  // similarly, change the list view when a url is changed
  urlRef.on('child_changed', snap => {
    const liChanged = document.getElementById(snap.key);
    liChanged.innerText = snap.key;
    add_space(liChanged);

    // upvote display and path to logic
    const upvotes = document.createElement('upvotes');
    upvotes.innerText = snap.val()['upvotes'];
    liChanged.appendChild(upvotes);
    upvoting(snap, liChanged);
    add_space(liChanged);

    // comments display
    const all_comments = document.createElement('all_comments');
    display_comments(snap, all_comments);
    liChanged.appendChild(all_comments);

    // add comments functionality
    const user_comment = document.createElement('user_comment');
    user_comment.innerHTML = '<input type="text" id="user_comment" placeholder="Your comment"/>';
    const author = document.createElement('author');
    author.innerHTML = '<input type="text" id="author" placeholder="You"/>';
    liChanged.appendChild(user_comment);
    liChanged.appendChild(author);
    add_comments(snap, liChanged);

    add_space(liChanged);
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

  // add spacing for readability
  function add_space(li) {
    li.appendChild(document.createElement("br"));
  }

  // familiarization --

  // playing around with live database in webcast tutorial
  const one = document.getElementById('one');

  // this gets the DB and then the child of object called 'text'
  const dbRef = firebase.database().ref().child('text');

  // snap is a 'data snapshot'
  // when the value changes ('on'), inner text of one is changed
  // dbRef.on('child_added', snap => console.log(snap.val()));
}());
