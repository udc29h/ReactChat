import { useEffect, useState } from 'react';
import './App.css';
import { getDatabase , onChildAdded, push, ref, set} from "firebase/database";

import { GoogleAuthProvider } from "firebase/auth";
import { getAuth, signInWithPopup} from "firebase/auth";




function App() {
  const [name,setName]=useState("");
  const [msg,setmsg]=useState('');
  const [chat,setchat]=useState([])
  const db= getDatabase();
  const chatListRef = ref(db, 'chats');
  const provider=new GoogleAuthProvider();
  const auth = getAuth();

  const googleLogin=()=>{
    
    signInWithPopup(auth, provider)
    .then((result) => {
    // This gives you a Google Access Token. You can use it to access the Google API.
    const credential = GoogleAuthProvider.credentialFromResult(result);
    const token = credential.accessToken;
    // The signed-in user info.
    const user = result.user;
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
    <div>
      <button onClick={e=>{googleLogin()}}>GoogleSignIN</button>
    </div>
    <h3>User : {name}</h3>
    <div className='chat-container'>
      {
        chat.map(c=><div className={`container${c.name===name?' me':""}`}>
        <p className='chatbox'>
          <strong>{c.name} : </strong>
          <span>{c.message}</span>
        </p>
      </div>)
      
      }
      <div id='snap'></div>
      <div className='inputArea'>
        <input type='text' placeholder='Enter your message !'

        onInput={e=>setmsg(e.target.value)} value={msg}
          
        ></input> <button onClick={e=>sendChat()}>Send</button>
      </div>
    </div>
   </div>
  );
}
export default App;
