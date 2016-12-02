(function() {
  // TODO
  // url parsing for special characters .$[]#/
  // sort list alphabetically or by time
  // fix visibility
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

  // Authorization

  var current_user = null;
  const email = document.getElementById('email');
  const password = document.getElementById('password');
  // log in
  document.getElementById("login").addEventListener('click', e=> {
    const auth = firebase.auth();
    const promise = auth.signInWithEmailAndPassword(email.value, password.value);
    console.log([email.value, password.value]);
    promise.catch(error => alert(error.message));
  });
  // sign up
  document.getElementById("signup").addEventListener('click', e=> {
    const auth = firebase.auth();
    const promise = auth.createUserWithEmailAndPassword(email.value, password.value);
    promise.catch(error => alert(error.message));
  });
  // log out
  document.getElementById("logout").addEventListener('click', e=> {
    firebase.auth().signOut();
  });

  firebase.auth().onAuthStateChanged(user => {
    if (user) {
      alert('logged in successfully');
      if (!user.upvoted_urls) {
        user.upvoted_urls = [];
        document.getElementById("logout").style.visibility = 'visible';
        document.getElementById("signup").style.visibility = 'hidden';
        document.getElementById("login_header").style.visibility = 'hidden';
      }
      current_user = user;
    } else {
      current_user = null;
      document.getElementById("logout").style.visibility = 'hidden';
      document.getElementById("login_header").style.visibility = 'visible';
    }

  });

  // retrieve the html element for the list of urls and the firebase element
  // for the list of urls
  const urlList = document.getElementById('urls');
  const urlRef = firebase.database().ref().child('url');

  // modifying database - adding elements from user input and adding upvotes
  // if url already exists, upvote existing
  function addURL() {
    if (!current_user) {
      alert('please log in');
      return;
    }

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
        upvotes: 0,
        timestamp: firebase.database.ServerValue.TIMESTAMP
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
        if (!current_user) {
          alert('please log in');
          return;
        }

        const user_upvotes = current_user.upvoted_urls
        if (user_upvotes.indexOf(snap.key)>-1) {
          alert('you have already upvoted this url');
        } else {
          // TODO: this addition doens't seem to persist past the current session
          user_upvotes.push(snap.key);
          current_user.updateProfile({
            updated_urls:user_upvotes
          }).then(function() {
            // Update successful.
          }, function(error) {
            // An error happened.
          });

          const curr_upvotes = snap.val().upvotes;
          urlRef.child(snap.key).update({
            upvotes: curr_upvotes + 1
          });
        };
      });
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
      comments.innerText = JSON.stringify(k[0]) + ' : ' + JSON.stringify(k[1]);
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
        if (!current_user) {
          alert('please log in');
          return;
        }
        const author = document.getElementById('author-'+snap.key).value;
        const comment = document.getElementById('user_comment-' + snap.key).value;
        urlRef.child(snap.key+'/comments').update({
          [author]: comment
        });
      }
    )
    li.appendChild(submit_comment);

  }

  function display_url_info(snap, li) {
    li.innerText = snap.key;

    // display url description
    const description = document.createElement('url_description');
    description.innerText = snap.val()['description'];
    add_space(li);
    li.appendChild(description);
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
    const user_comment = document.createElement('input');
    user_comment.id = 'user_comment-' + snap.key;
    user_comment.type = 'text';
    user_comment.placeholder = "Your comment";
    const author = document.createElement('input');
    author.id = 'author-' + snap.key;
    author.type = 'text';
    author.placeholder = 'You';
    li.appendChild(user_comment);
    li.appendChild(author);
    add_comments(snap, li);
  }

  // when element is added, create a new list element to display
  urlRef.on('child_added', snap => {
    const li = document.createElement('li');
    li.id = snap.key;
    add_space(li);

    display_url_info(snap, li);

    // attach this added url to list of urls displayed
    urlList.appendChild(li);
    add_space(li);

  });

  // similarly, change the list view when a url is changed
  urlRef.on('child_changed', snap => {
    const liChanged = document.getElementById(snap.key);
    add_space(liChanged);

    display_url_info(snap, liChanged);

    add_space(liChanged);
  });

  // ...and remove url from view when it's removed from database
  urlRef.on('child_removed', snap => {
    const liRemove = document.getElementById(snap.key);
    liRemove.remove();
  });

  // event listeners for buttons
  // url submission - add the url (or upvote if exists) and set the elements to empty
  document.getElementById("url_submit").onclick = function() {
    addURL();
    document.getElementById("user_url").value = "";
    document.getElementById("user_description").value = "";
  };
  // TODO : these are not implemented
  // sort by url alphabetically
  document.getElementById("url_sort").onclick = function() {
    urlRef.orderByKey();
  };
  // sort by timestamp
  document.getElementById("time_sort").onclick = function() {
    urlRef.orderByChild('timestamp');
  };

  // add spacing for readability
  function add_space(li) {
    li.appendChild(document.createElement("br"));
  }

  // -- familiarization --

  // playing around with live database in webcast tutorial
  const one = document.getElementById('one');

  // this gets the DB and then the child of object called 'text'
  const dbRef = firebase.database().ref().child('text');

  // snap is a 'data snapshot'
  // when the value changes ('on'), inner text of one is changed
  // dbRef.on('child_added', snap => console.log(snap.val()));
}());
