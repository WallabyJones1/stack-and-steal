import { useWallet } from "@solana/wallet-adapter-react";
import { createContext, useContext, useEffect } from "react";

export const AutoConnectContext = createContext({});

export function useAutoConnect() {
  return useContext(AutoConnectContext);
}

export const AutoConnectProvider = ({ children }) => {
  const { autoConnect, setAutoConnect } = useWallet();

  useEffect(() => {
    // This can be used to manage auto-connection logic if needed.
    // For now, it just ensures the provider is in place.
  }, [autoConnect, setAutoConnect]);

  return (
    <AutoConnectContext.Provider value={{ autoConnect, setAutoConnect }}>
      {children}
    </AutoConnectContext.Provider>
  );
};
