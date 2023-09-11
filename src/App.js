import { useEffect, useState } from 'react';
import './App.css';
import { getDatabase , onChildAdded, push, ref, set} from "firebase/database";



function App() {
  const [name,setName]=useState("");
  const [msg,setmsg]=useState('');
  const [chat,setchat]=useState([])
  const db= getDatabase();
  const chatListRef = ref(db, 'chats');

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
      {name?null:<input type='text' placeholder="Enter your name " onBlur={e=>setName(e.target.value)}></input>}</div>
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
