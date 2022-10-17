
import './App.css';
import api from './api';
import { useEffect, useState } from 'react';
function App() {
  const [user, setUser] = useState(null);
  async function getUser() {
    try {
      const response = await api.get('/user', { withCredentials: true });
      if (response.data !== false) {
        setUser(response.data);
      }
    } catch (error) {
      console.error(error);
    }
  };
  async function signOut() {
    try {
      const response = await api.post('/logout', { withCredentials: true });
      setUser(null);
      return response.data;
    } catch (error) {
      console.error(error);
    }
  }

  useEffect(() => {
    getUser();
  }, []);
  const handleSignOut = () => {
    const res = signOut();
    console.log(res);
  }
  const alink = process.env.NODE_ENV === "production" ? "/api/v1/auth/steam" : "http://localhost:3005/api/v1/auth/steam"
  return (
    <div className="App">
      {user === null ?
        <a href={alink}>Sign in</a>
        :
        <>
          <p>Hello user!</p>
          <button onClick={handleSignOut}>Sign Out</button>
        </>}
    </div>
  );
}

export default App;
