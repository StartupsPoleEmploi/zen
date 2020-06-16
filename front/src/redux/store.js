import { configureStore, getDefaultMiddleware } from '@reduxjs/toolkit';
import reducer from './reducers';

const store = configureStore({
  middleware: getDefaultMiddleware({
    /*
     * The serializableCheck middleware can be useful to warn if non serializable values
     * are stored in the store. However, at the time of writing, we use multiple of them
     * (Date objects), so it is disabled. We could however re-enable it after
     * modifying some code so the dates are only stored by their time or their ISOstring.
     */
    serializableCheck: false,
  }),

  reducer,
});

export default store;
