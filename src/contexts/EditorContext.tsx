import * as React from "react";
import { createContext, ReactNode, useContext, useState } from "react";

type StateGetter = (
  needJson?: boolean,
  needHtml?: boolean
) => Promise<{ html: null | string; json: null | string }>;

type ContextShape = {
  getState?: StateGetter;
  setGetState?: (f: () => StateGetter) => void;
  canSave?: boolean;
  setCanSave?: (b: boolean) => void;
};

const Context: React.Context<ContextShape> = createContext({
  getState: null,
  setGetState: null,
  canSave: true,
  setCanSave: null,
});

export const EditorContext = ({
  children,
}: {
  children: ReactNode;
}): JSX.Element => {
  const [getState, setGetState] = useState<StateGetter>(null);
  const [canSave, setCanSave] = useState<boolean>(true);
  return (
    <Context.Provider
      value={{
        getState: getState,
        setGetState: setGetState,
        canSave: canSave,
        setCanSave: setCanSave,
      }}
    >
      {children}
    </Context.Provider>
  );
};

export const useEditorContext = (): ContextShape => {
  return useContext(Context);
};
