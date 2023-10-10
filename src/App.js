import { useEffect, useState } from 'react';
import './App.css';
import './Onlinebox.css';
import { getDatabase , onChildAdded, push, ref, set} from "firebase/database";

import { GoogleAuthProvider } from "firebase/auth";
import { getAuth, signInWithPopup} from "firebase/auth";
import { setPersistence, browserSessionPersistence } from "firebase/auth";
import Obox from './Onlinebox';


function App() {
  const [name,setName]=useState("");
  const [msg,setmsg]=useState('');
  const [chat,setchat]=useState([])
  const [isSignedIn, setIsSignedIn]=useState(false);
  const db= getDatabase();
  const chatListRef = ref(db, 'chats');
  const provider=new GoogleAuthProvider();
  const auth = getAuth();
  setPersistence(auth, browserSessionPersistence);

  const googleLogin=()=>{
    
    signInWithPopup(auth, provider)
    
    .then((result) => {
    // This gives you a Google Access Token. You can use it to access the Google API.
    const credential = GoogleAuthProvider.credentialFromResult(result);
    const token = credential.accessToken;
    // The signed-in user info.
    const user = result.user;
    setIsSignedIn(true);
    // IdP data available using getAdditionalUserInfo(result)
    setName(result.user.displayName);
    // console.log(result,token);
    // ...
  }).catch((error) => {
    // Handle Errors here.
    const errorCode = error.code;
    const errorMessage = error.message;
    // The email of the user's account used.
    const email = error.customData.email;
    // The AuthCredential type that was used.
    const credential = GoogleAuthProvider.credentialFromError(error);
    // ...
  });
  }

  useEffect(()=>{
    onChildAdded(chatListRef,(data)=>{
        setchat(chat=>[...chat,data.val()])
      });
    
  },[])
  const sendChat=()=>{

    const chatRef = push(chatListRef);

    set(chatRef, {
      name, message:msg
    });
    // const c=[...chat];
    // c.push({name:name,message:msg});
    // setchat(c);
    setmsg(''); 
  }
  return (
   <div className='Body'>
      {!isSignedIn ? (
        <div>
          <p>Hey, sign in with Google to chat</p>
          <button onClick={googleLogin}>Google Sign In</button>
        </div>
      ) : (
        // Your chat application code here
      <div className='master-container'>
      <Obox></Obox>
      <div className='chat-area'>
      <h3>User : {name}</h3>
      <div className='chat-container'>
        {
          chat.map(c=><div className={`container${c.name===name?' me':""}`}>
          <p className='chatbox'>
            <strong>{c.name} : </strong><br/>
            <span>{c.message}</span>
          </p>
        </div>)
        
        }
        <div id='snap'></div>
        <div className='inputArea'>
          <input type='text' placeholder='Enter your message !'
  
          onInput={e=>setmsg(e.target.value)} value={msg}
          onKeyDown={e=>{if(e.key==='Enter'){
            sendChat();
          }}}
          ></input> <button onClick={e=>sendChat()}>Send</button>
        </div>
      </div>
      </div>
      </div>
      )}        
   </div>
  );
}
export default App;
