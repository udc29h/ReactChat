import { useEffect, useState,useRef } from 'react';
import { signOut,getAuth, onAuthStateChanged, signInWithPopup, GoogleAuthProvider } from 'firebase/auth';
import { getDatabase, onChildAdded, push, ref, set } from 'firebase/database';
import { initializeApp } from 'firebase/app';
import './App.css';
import './Onlinebox.css';
import randomGuyPic from './img/random.webp'
import Obox from './Onlinebox';
import { Timestamp } from 'firebase/firestore';

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
  const [profilePic, setProfilePic] = useState('');
  const [name, setName] = useState('');
  const [msg, setMsg] = useState('');
  const [chat, setChat] = useState([]);
  const [isSignedIn,setIsSignedIn]=useState(false);
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [isOnline,setIsOnline]=useState(false);
  const auth = getAuth();
  const provider = new GoogleAuthProvider();
  const db = getDatabase();
  const chatListRef = ref(db, 'chats');
  console.log("fetching the data")
  const usersListRef=ref(db,'users');
  const addUserOnline=(user)=>{
    setOnlineUsers(prevUsers=>[...prevUsers,user.name]);
  }
  const chatContainerRef=useRef(null);
  const googleLogin = () => {
    signInWithPopup(auth, provider)
      .then((result) => {
        const user = result.user;
        setIsSignedIn(true);
        setName(user.displayName);
        console.log(user.photoURL)
        setProfilePic(user.photoURL)
        // setOnlineUsers((users) => [...users, user.displayName]);
      })
      .catch((error) => {
        // Handle errors
      });
  };

  const handleLogout=()=>{
    signOut(auth)
    .then(()=>{
      setIsSignedIn(false);
      setName('');
    })
    .catch((e)=>{
      console.log(e)
    })
  }

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
      console.log(chat);
    });
  }, []);


  const sendUsers=()=>{
    const usersRef=push(usersListRef);
    set(usersRef,{
      name,
      isOnline:isSignedIn ,
    });
  }

  const sendChat = () => {
    const chatRef = push(chatListRef);
    const now = new Date();
    const formattedTime = `${now.toLocaleDateString()} ${now.toLocaleTimeString()}`;
    if(chatContainerRef.current){chatContainerRef.current.scrollTop=chatContainerRef.current.scrollHeight;}
    set(chatRef, {
      name,
      message: msg,
      time: formattedTime,
    });

    setMsg('');
  };
  
  useEffect(() => {
    // Scroll to the bottom of the chat container on initial load
    console.log(profilePic)
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, []);

  return (
    <div className='Body'>
      {!isSignedIn ? (
        <div className='GoogleLoginPage'>
          <p>Hey 👋🏻, Sign in with Google to chat ! </p>
          <button onClick={googleLogin}>Google Sign In</button>
        </div>
      ) : (
        <div className='master-container'>
          
          <div className='chat-area'>
          <div className='header'>
            <img onClick={handleLogout} src={(profilePic)?(profilePic):(randomGuyPic)} alt="PP" className='profilePic'/>
            <p> {name}</p>
            </div>
            <div className='chat-container'>
              {chat.map((c) => (
                <div className={`container${c.name === name ? ' me' : ''}`} key={c.id}>
                <div className="chatbox">
                  <div className="chat-header">
                    <span className="chat-name">{c.name}</span>
                  </div>
                  <div className="chat-message">
                    <span>{c.message}</span>
                  </div>
                  <div className="chat-time">
                    <span>{c.time}</span>
                  </div>
                </div>
              </div>
              ))}
              <div id='snap'></div>
              <div className='inputArea'>
                <input
                  type='text'
                  placeholder='Enter your message!'
                  onInput={(e) => setMsg(e.target.value)
          
                  }
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