/* eslint-disable react/jsx-props-no-spreading */
import React, { useState, useCallback } from 'react';
import superagent from 'superagent';
import { useUseradmin } from './useradminCtx';

const DeclarationsContext = React.createContext();

export function DeclarationsProvider(props) {
  const [availableMonths, _setAvailableMonths] = useState([]);
  const [selectedMonthId, _setSelectedMonthId] = useState(null);
  const [declarations, _setDeclarations] = useState([]);
  const [isLoading, _setIsLoading] = useState(true);
  const { logoutIfNeed } = useUseradmin();

  const setSelectedMonthId = useCallback(async (monthId) => {
    _setSelectedMonthId(monthId);
    _setIsLoading(true);

    await superagent.get(`/zen-admin-api/declarations?monthId=${monthId}`)
      .then(({ body }) => {
        _setIsLoading(false);
        _setDeclarations(body);
      })
      .catch(logoutIfNeed);
  }, [logoutIfNeed]);

  const init = useCallback(async () => {
    if (!availableMonths.length) {
      _setIsLoading(true);

      await superagent.get('/zen-admin-api/declarationsMonths')
        .then(({ body }) => {
          _setIsLoading(false);
          _setAvailableMonths(body);
          setSelectedMonthId(body[0].id);
        })
        .catch(logoutIfNeed);
    }
  }, [availableMonths.length, logoutIfNeed, setSelectedMonthId]);

  return (
    <DeclarationsContext.Provider
      {...props}
      value={{
        availableMonths,
        selectedMonthId,
        declarations,
        isLoading,
        // function
        setSelectedMonthId,
        init,
      }}
    />
  );
}


export const useDeclarations = () => {
  const context = React.useContext(DeclarationsContext);
  if (!context) throw new Error('useDeclarations must be used in DeclarationsProvider');

  return context;
};
