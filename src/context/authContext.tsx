import React, { useCallback, useContext, useEffect, useState } from "react";

interface User {
  id: number;
  username: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  loading: boolean;
  isAuthenticated: boolean;
  signin: (username: string, password: string) => Promise<void>;
  signup: (username: string, password: string) => Promise<void>;
  signout: () => void;
}

const context = React.createContext<AuthContextType>({
  user: null,
  token: null,
  loading: true,
  isAuthenticated: false,
  signin: async () => {},
  signup: async () => {},
  signout: () => {},
});

interface Props {
  children: React.ReactNode;
}

const AuthProvider = ({ children }: Props) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(
    localStorage.getItem("token")
  );
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!token) {
      setLoading(false);
      return;
    }

    fetch("/api/auth/me", {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => {
        if (!res.ok) throw new Error("Invalid token");
        return res.json();
      })
      .then((data) => {
        setUser({ id: data.id, username: data.username });
      })
      .catch(() => {
        localStorage.removeItem("token");
        setToken(null);
        setUser(null);
      })
      .finally(() => setLoading(false));
  }, [token]);

  const signin = useCallback(async (username: string, password: string) => {
    const res = await fetch("/api/auth/signin", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error);
    localStorage.setItem("token", data.token);
    setToken(data.token);
    setUser(data.user);
  }, []);

  const signup = useCallback(
    async (username: string, password: string) => {
      const res = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      localStorage.setItem("token", data.token);
      setToken(data.token);
      setUser(data.user);
    },
    []
  );

  const signout = useCallback(() => {
    localStorage.removeItem("token");
    setToken(null);
    setUser(null);
  }, []);

  return (
    <context.Provider
      value={{
        user,
        token,
        loading,
        isAuthenticated: !!user,
        signin,
        signup,
        signout,
      }}
    >
      {children}
    </context.Provider>
  );
};

export default AuthProvider;

export const useAuth = () => {
  return useContext(context);
};
