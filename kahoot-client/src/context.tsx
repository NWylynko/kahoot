import { useState, useEffect, useContext, createContext } from 'react';
import { v4 as uuid } from 'uuid';

interface Store {
  gameId: string | null;
  setGameId: (gameId: string) => void;
  userId: string | null;
}

const Context = createContext<Store>({
  gameId: null,
  setGameId: () => {},
  userId: null,
});

export const useGlobalState = () => useContext(Context);

interface Props {
  children: JSX.Element | JSX.Element[];
}

export const GlobalStateProvider = ({ children }: Props): JSX.Element => {
  const [gameId, setGameId] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(window.localStorage.getItem("userId") || uuid());

  useEffect(() => {
    if (userId) {
      window.localStorage.setItem("userId", userId);
    }
  }, [userId]);

  return (
    <Context.Provider value={{ gameId, setGameId, userId }}>
      {children}
    </Context.Provider>
  );

};

