import { useEffect, useState, useRef } from 'react';
import { 
  signOut, 
  getAuth, 
  onAuthStateChanged, 
  signInWithPopup, 
  GoogleAuthProvider,
  setPersistence,
  browserLocalPersistence
} from 'firebase/auth';
import { getDatabase, onChildAdded, push, ref, set, onValue } from 'firebase/database';
import { initializeApp } from 'firebase/app';
import './App.css';
import randomGuyPic from './img/random.webp';

// Firebase configuration
const firebaseConfig = {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
  authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN,
  databaseURL: process.env.REACT_APP_FIREBASE_DATABASE_URL,
  projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID,
  storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.REACT_APP_FIREBASE_APP_ID,
  measurementId: process.env.REACT_APP_FIREBASE_MEASUREMENT_ID
};

// Initialize Firebase
try {
  initializeApp(firebaseConfig);
} catch (error) {
  console.error('Firebase initialization error:', error);
}

function App() {
  const [profilePic, setProfilePic] = useState('');
  const [name, setName] = useState('');
  const [msg, setMsg] = useState('');
  const [chat, setChat] = useState([]);
  const [isSignedIn, setIsSignedIn] = useState(false);
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [error, setError] = useState(''); // State for error messages
  const [isLoading, setIsLoading] = useState(false); // Added loading state
  const auth = getAuth();
  const provider = new GoogleAuthProvider();
  const db = getDatabase();
  const chatListRef = ref(db, 'chats');
  const usersListRef = ref(db, 'users');
  const chatContainerRef = useRef(null);

  // Google Sign-In
  const googleLogin = async () => {
    try {
      setError(''); // Clear previous errors
      setIsLoading(true); // Start loading
      
      // Set persistence to local to improve the sign-in flow
      await setPersistence(auth, browserLocalPersistence);
      
      // Add additional scopes if needed
      provider.addScope('profile');
      provider.addScope('email');
      
      // Force reauth for better reliability
      provider.setCustomParameters({
        prompt: 'select_account'
      });
      
      const result = await signInWithPopup(auth, provider);
      const user = result.user;
      
      console.log("Login successful:", user.displayName); // Debug logging
      
      setIsSignedIn(true);
      setName(user.displayName || 'Anonymous');
      setProfilePic(user.photoURL || randomGuyPic);
      updateUserStatus(user.uid, user.displayName || 'Anonymous', true);
    } catch (error) {
      console.error('Login error:', error);
      
      // More detailed error logging
      console.error('Error code:', error.code);
      console.error('Error message:', error.message);
      
      setError(getFriendlyErrorMessage(error.code));
    } finally {
      setIsLoading(false); // End loading regardless of outcome
    }
  };

  // Logout
  const handleLogout = async () => {
    try {
      // Update user status to offline before signing out
      if (auth.currentUser?.uid) {
        await updateUserStatus(auth.currentUser.uid, name, false);
      }
      
      await signOut(auth);
      setIsSignedIn(false);
      setName('');
      setProfilePic('');
      setChat([]); // Clear chat history on logout
    } catch (error) {
      console.error('Logout error:', error);
      setError('Failed to log out. Please try again.');
    }
  };

  // Update user status in Firebase
  const updateUserStatus = async (uid, displayName, isOnline) => {
    if (!uid) return;
    try {
      const userRef = ref(db, `users/${uid}`);
      await set(userRef, {
        name: displayName,
        isOnline,
        lastActive: Date.now(),
      });
      return true;
    } catch (error) {
      console.error('Error updating user status:', error);
      return false;
    }
  };

  // Friendly error messages
  const getFriendlyErrorMessage = (errorCode) => {
    switch (errorCode) {
      case 'auth/popup-blocked':
        return 'The login popup was blocked by your browser. Please allow popups for this site.';
      case 'auth/popup-closed-by-user':
        return 'The login popup was closed before completing. Please try again.';
      case 'auth/network-request-failed':
        return 'Network error. Please check your internet connection and try again.';
      case 'auth/invalid-credential':
        return 'Invalid credentials. Please try again or contact support.';
      case 'auth/account-exists-with-different-credential':
        return 'An account already exists with the same email address but different sign-in credentials.';
      case 'auth/cancelled-popup-request':
        return 'This operation has been cancelled due to another conflicting popup being opened.';
      case 'auth/unauthorized-domain':
        return 'This domain is not authorized for OAuth operations for your Firebase project.';
      default:
        return `An error occurred during login (${errorCode}). Please try again.`;
    }
  };

  // Monitor authentication state
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      console.log("Auth state changed:", user ? user.displayName : "No user");
      setIsSignedIn(!!user);
      if (user) {
        setName(user.displayName || 'Anonymous');
        setProfilePic(user.photoURL || randomGuyPic);
        updateUserStatus(user.uid, user.displayName || 'Anonymous', true);
      } else {
        setError('');
      }
    });

    return () => unsubscribe();
  }, [auth]);

  // Monitor chat messages
  useEffect(() => {
    const unsubscribe = onChildAdded(chatListRef, (data) => {
      const newChat = { id: data.key, ...data.val() };
      setChat((prev) => [...prev, newChat]);
      
      // Scroll to bottom on new message, with a small delay to ensure DOM update
      setTimeout(() => {
        if (chatContainerRef.current) {
          chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
        }
      }, 100);
    });

    return () => unsubscribe();
  }, []);

  // Monitor online users
  useEffect(() => {
    const unsubscribe = onValue(usersListRef, (snapshot) => {
      const users = [];
      snapshot.forEach((child) => {
        const user = child.val();
        if (user.isOnline) {
          users.push(user.name);
        }
      });
      setOnlineUsers(users);
    });

    return () => unsubscribe();
  }, []);

  // Set up presence disconnection
  useEffect(() => {
    if (isSignedIn && auth.currentUser) {
      const uid = auth.currentUser.uid;
      const userRef = ref(db, `users/${uid}`);
      
      // Set up disconnect handler
      const onDisconnectRef = ref(db, `.info/connected`);
      onValue(onDisconnectRef, (snapshot) => {
        if (snapshot.val() === true) {
          // When user disconnects (closes tab, etc.), set isOnline to false
          const disconnectRef = ref(db, `users/${uid}`);
          set(disconnectRef, {
            name: name,
            isOnline: false,
            lastActive: Date.now()
          });
        }
      });
    }
  }, [isSignedIn, auth.currentUser, db, name]);

  // Send chat message
  const sendChat = async () => {
    if (!msg.trim()) return;
    try {
      const chatRef = push(chatListRef);
      const now = new Date();
      const formattedTime = `${now.toLocaleDateString()} ${now.toLocaleTimeString()}`;
      await set(chatRef, {
        name,
        message: msg,
        time: formattedTime,
        uid: auth.currentUser?.uid || 'anonymous',
      });
      setMsg('');
    } catch (error) {
      console.error('Error sending message:', error);
      setError('Failed to send message. Please try again.');
    }
  };

  return (
    <div className="Body">
      {!isSignedIn ? (
        <div className="GoogleLoginPage">
          <p>Hey 👋🏻, Sign in with Google to chat!</p>
          {error && <p className="error-message">{error}</p>}
          <button onClick={googleLogin} disabled={isLoading}>
            {isLoading ? 'Signing in...' : 'Google Sign In'}
          </button>
        </div>
      ) : (
        <div className="master-container">
          <div className="chat-area">
            <div className="header">
              <section className="top-nav">
                <div className="user-info">
                  <img
                    src={profilePic}
                    alt="Profile"
                    className="profilePic"
                    title="Click to logout"
                  />
                  <span>{name}</span>
                </div>
                <input id="menu-toggle" type="checkbox" />
                <label className="menu-button-container" htmlFor="menu-toggle">
                  <div className="menu-button"></div>
                </label>
                <ul className="menu">
                  <li onClick={handleLogout}>Logout</li>
                </ul>
              </section>
            </div>
            <div className="online-users">
              <h3>Online Users ({onlineUsers.length})</h3>
              <ul>
                {onlineUsers.map((user, index) => (
                  <li key={index}>{user}</li>
                ))}
              </ul>
            </div>
            <div className="chat-container" ref={chatContainerRef}>
              {chat.length === 0 ? (
                <div className="empty-chat-message">
                  No messages yet. Be the first to say hello!
                </div>
              ) : (
                chat.map((c) => (
                  <div
                    className={`container${c.name === name ? ' me' : ''}`}
                    key={c.id}
                  >
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
                ))
              )}
              {error && <p className="error-message chat-error">{error}</p>}
            </div>
            <div className="inputArea">
              <input
                type="text"
                placeholder="Enter your message!"
                value={msg}
                onChange={(e) => setMsg(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    sendChat();
                  }
                }}
                disabled={!isSignedIn}
              />
              <button onClick={sendChat} disabled={!isSignedIn || !msg.trim()}>
                Send
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;