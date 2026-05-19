import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import toast from "react-hot-toast";

axios.defaults.baseURL = import.meta.env.VITE_SERVER_URL;

const AppContext = createContext();

export const AppContextProvider = ({ children }) => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [chats, setChats] = useState([]);
  const [selectedChat, setSelectedChat] = useState(null);
  const [theme, setTheme] = useState(localStorage.getItem("theme") || "light");
  const [token, setToken] = useState(localStorage.getItem("token") || null);
  const [loadingUser, setLoadingUser] = useState(true);

  const fetchUser = useCallback(async () => {
    try {
      const { data } = await axios.get("/api/user/data", {
        headers: { Authorization: token },
      });

      if (data.success) {
        setUser(data.user);
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.message);
    } finally {
      setLoadingUser(false);
    }
  }, [token]);

  const fetchUserChats = useCallback(async () => {
    if (!token) return;

    try {
      const { data } = await axios.get("/api/chat/get", {
        headers: { Authorization: token },
      });

      if (data.success) {
        // If the user has no chats, create one
        if (data.chats.length === 0) {
          await axios.get("/api/chat/create", {
            headers: { Authorization: token },
          });

          // Fetch chats again after creating one
          const { data: newData } = await axios.get("/api/chat/get", {
            headers: { Authorization: token },
          });

          if (newData.success) {
            setChats(newData.chats);
            if (newData.chats.length > 0) {
              setSelectedChat(newData.chats[0]);
            }
          }
        } else {
          setChats(data.chats);
          setSelectedChat(data.chats[0]);
        }
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.message);
    }
  }, [token]);

  const createNewChat = useCallback(async () => {
    try {
      if (!user) {
        return toast.error("Login to create a new chat");
      }

      navigate("/");

      await axios.get("/api/chat/create", {
        headers: { Authorization: token },
      });

      await fetchUserChats();
    } catch (error) {
      toast.error(error.message);
    }
  }, [user, token, navigate, fetchUserChats]);

  useEffect(() => {
    if (theme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
    localStorage.setItem("theme", theme);
  }, [theme]);

  useEffect(() => {
    if (user) {
      fetchUserChats();
    } else {
      setChats([]);
      setSelectedChat(null);
    }
  }, [user, fetchUserChats]);

  useEffect(() => {
    if (token) {
      fetchUser();
    } else {
      setUser(null);
      setLoadingUser(false);
    }
  }, [token, fetchUser]);

  const value = {
    navigate,
    user,
    setUser,
    fetchUser,
    chats,
    setChats,
    selectedChat,
    setSelectedChat,
    theme,
    setTheme,
    createNewChat,
    loadingUser,
    fetchUserChats,
    token,
    setToken,
    axios,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

export const useAppContext = () => useContext(AppContext);
