/* eslint-disable react/jsx-props-no-spreading */
import React, { useState } from 'react';

const UseradminContext = React.createContext();

export function UseradminProvider(props) {
  const [useradmin, setUseradmin] = useState(null);

  return (
    <UseradminContext.Provider
      {...props}
      value={{
        useradmin,
        setUseradmin,
      }}
    />
  );
}


export const useUseradmin = () => {
  const context = React.useContext(UseradminContext);
  if (!context) throw new Error('useUseradmin must be used in UseradminProvider');

  return context;
};
