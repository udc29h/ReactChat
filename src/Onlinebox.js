import React, { useState, useEffect } from 'react';

const Obox = ({ onlineUsers }) => {
  const [uniqueUsers, setUniqueUsers] = useState([...new Set(onlineUsers)]);

  useEffect(() => {
    setUniqueUsers([...new Set(onlineUsers)]);
  }, [onlineUsers]);

  const handleUserOffline = (user) => {
    setUniqueUsers(prevUsers => prevUsers.filter(u => u !== user));
  };

  return (
    <div className='online-area'>
      <h3>Online Users:</h3>
      <p>Number of Online Users: {uniqueUsers.length}</p>
      <ul>
        {/* {users.map((user) => (
          <li key={user}>{user} <button onClick={() => handleUserOffline(user)}>Go Offline</button></li>
        ))} */}
      </ul>
    </div>
  );
};

export default Obox