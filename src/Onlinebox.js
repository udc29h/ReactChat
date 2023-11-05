import React from 'react';

const Obox = ({ onlineUsers }) => {
  return (
    <div className='online-area'>
      <h3>Online Users:</h3>
      <p>Number of Online Users: {onlineUsers.length}</p>
      <ul>
        {onlineUsers.map((user) => (
          <li key={user}>{user}</li>
        ))}
      </ul>
    </div>
  );
};

export default Obox;  