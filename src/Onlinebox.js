import { useEffect, useState } from "react";
import { getAuth, onAuthStateChanged } from "firebase/auth";

function Obox() {
  const [usernames, setUsernames] = useState([]);

  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        // User is signed in
        const uid = user.uid;
        // Update the usernames state with the current user's display name and online status
        setUsernames((prevUsernames) => {
          const updatedUsernames = prevUsernames.filter((name) => name.uid !== uid);
          return [...updatedUsernames, { uid, displayName: user.displayName, online: true }];
        });
      } else {
        // User is signed out
        // Remove the current user's display name from the usernames state
        setUsernames((prevUsernames) =>
          prevUsernames.filter((name) => name.uid !== uid)
        );
      }
    });

    // Clean up the observer when the component unmounts
    return () => unsubscribe();
  }, []);

  return (
    <div className="online-area">
      <div className="head">
        <h3>
          Online Members<span>__NuM</span>
        </h3>
        <div className="members">
          {/* Display the usernames and their online status */}
          {usernames.map((user) => (
            <div key={user.uid}>
              {user.displayName} - {user.online ? "Online" : "Offline"}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default Obox;