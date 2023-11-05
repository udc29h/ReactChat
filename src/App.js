import { useEffect, useState } from 'react';
import { getAuth, onAuthStateChanged, signInWithPopup, GoogleAuthProvider } from 'firebase/auth';
import { getDatabase, onChildAdded, push, ref, set } from 'firebase/database';
import { initializeApp } from 'firebase/app';
import './App.css';
import './Onlinebox.css';
import Obox from './Onlinebox';

const firebaseConfig = {
  apiKey: "AIzaSyAsJpBoqKKL7Y0WbRTe1rP5o6Y9UUvZTDg",
  authDomain: "react-chat-app-506ff.firebaseapp.com",
  databaseURL: "https://react-chat-app-506ff-default-rtdb.firebaseio.com",
  projectId: "react-chat-app-506ff",
  storageBucket: "react-chat-app-506ff.appspot.com",
  messagingSenderId: "349179677600",
  appId: "1:349179677600:web:94a0f827990e9804f2f2c5",
  measurementId: "G-M1GX7MGR36"
};
initializeApp(firebaseConfig);

function App() {
  const [name, setName] = useState('');
  const [msg, setMsg] = useState('');
  const [chat, setChat] = useState([]);
  const [isSignedIn, setIsSignedIn] = useState(false);
  const [onlineUsers, setOnlineUsers] = useState([]);
  const auth = getAuth();
  const provider = new GoogleAuthProvider();
  const db = getDatabase();
  const chatListRef = ref(db, 'chats');

  const googleLogin = () => {
    signInWithPopup(auth, provider)
      .then((result) => {
        const user = result.user;
        setIsSignedIn(true);
        setName(user.displayName);
        setOnlineUsers((users) => [...users, user.displayName]);
      })
      .catch((error) => {
        // Handle errors
      });
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setIsSignedIn(!!user);
      if (user) {
        setName(user.displayName);
        setOnlineUsers((users) => [...users, user.displayName]);
      } else {
        setOnlineUsers((users) => users.filter((u) => u !== name));
      }
    });

    return () => {
      unsubscribe();
    };
  }, [auth, name]);

  useEffect(() => {
    onChildAdded(chatListRef, (data) => {
      setChat((chat) => [...chat, data.val()]);
    });
  }, []);

  const sendChat = () => {
    const chatRef = push(chatListRef);

    set(chatRef, {
      name,
      message: msg,
    });

    setMsg('');
  };

  return (
    <div className='Body'>
      {!isSignedIn ? (
        <div>
          <p>Hey, sign in with Google to chat</p>
          <button onClick={googleLogin}>Google Sign In</button>
        </div>
      ) : (
        <div className='master-container'>
          <Obox onlineUsers={onlineUsers} />
          <div className='chat-area'>
            <h3>User: {name}</h3>
            <div className='chat-container'>
              {chat.map((c) => (
                <div className={`container${c.name === name ? ' me' : ''}`}>
                  <p className='chatbox'>
                    <strong>{c.name}:</strong>
                    <br />
                    <span>{c.message}</span>
                  </p>
                </div>
              ))}
              <div id='snap'></div>
              <div className='inputArea'>
                <input
                  type='text'
                  placeholder='Enter your message!'
                  onInput={(e) => setMsg(e.target.value)}
                  value={msg}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      sendChat();
                    }
                  }}
                />
                <button onClick={(e) => sendChat()}>Send</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;