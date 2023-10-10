import { useEffect, useState } from "react";
import { getAuth, onAuthStateChanged } from "firebase/auth";

function Obox() {
  const auth = getAuth();
  const [usernames, setUsernames] = useState([]);
  const [uid, setUid] = useState(null); // Declare and initialize the uid variable

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setUid(user.uid); // Assign the uid value from the authenticated user
        setUsernames((prevUsernames) => {
          const updatedUsernames = prevUsernames.filter((name) => name.uid !== user.uid);
          return [...updatedUsernames, { uid: user.uid, displayName: user.displayName, online: true }];
        });
      } else {
        setUid(null); // Reset the uid value if the user is not authenticated
        setUsernames((prevUsernames) =>
          prevUsernames.filter((name) => name.uid !== uid)
        );
      }
    });

    return () => unsubscribe(); // Clean up the observer when the component unmounts
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