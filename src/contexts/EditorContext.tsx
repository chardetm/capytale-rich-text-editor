import * as React from "react";
import { createContext, ReactNode, useContext, useState } from "react";

type StateGetter = () => Promise<{ html: string; json: string }>;

type ContextShape = {
  getState?: StateGetter;
  setGetState?: (StringGetter) => void;
};

const Context: React.Context<ContextShape> = createContext({
  getState: null,
  setGetState: null,
});

export const EditorContext = ({
  children,
}: {
  children: ReactNode;
}): JSX.Element => {
  const [getState, setGetState] = useState<StateGetter>(null);
  return (
    <Context.Provider
      value={{
        getState: getState,
        setGetState: setGetState,
      }}
    >
      {children}
    </Context.Provider>
  );
};

export const useEditorContext = (): ContextShape => {
  return useContext(Context);
};
