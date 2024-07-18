import  { createContext, useState, useEffect, useContext } from "react";
import { useAuthContext } from "./AuthContext";
import io from "socket.io-client";

const SocketContext = createContext();

export const useSocketContext = () => {
  return useContext(SocketContext);
};

export const SocketContextProvider = ({ children }) => {
  const { authUser } = useAuthContext();
  const [socketInstance, setSocketInstance] = useState(null);
  const [onlineUsers, setOnlineUsers] = useState([]);

  useEffect(() => {
    if (authUser) {
      const newSocket = io("http://localhost:5000", {
        query: {
          userId: authUser._id,
        },
      });

      newSocket.on("connect", () => {
        console.log("Socket connected");
      });

      newSocket.on("getOnlineUsers", (users) => {
        setOnlineUsers(users);
      });

      newSocket.on("disconnect", () => {
        console.log("Socket disconnected");
      });

      setSocketInstance(newSocket);

      return () => {
        newSocket.close();
        setSocketInstance(null);
      };
    } else {
      if (socketInstance) {
        socketInstance.close();
        setSocketInstance(null);
      }
    }
  }, [authUser]);

  return (
    <SocketContext.Provider value={{ socket: socketInstance, onlineUsers }}>
      {children}
    </SocketContext.Provider>
  );
};
