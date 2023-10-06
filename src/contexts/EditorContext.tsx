import * as React from "react";
import { createContext, ReactNode, useContext, useState } from "react";

type StateGetter = (
  needJson?: boolean,
  needHtml?: boolean
) => Promise<{ html: null|string; json: null|string }>;

type ContextShape = {
  getState?: StateGetter;
  setGetState?: (f: () => StateGetter) => void;
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
