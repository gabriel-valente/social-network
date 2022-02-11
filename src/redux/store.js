import { createStore, applyMiddleware, combineReducers } from 'redux';
import thunk from 'redux-thunk';
import { composeWithDevTools } from 'redux-devtools-extension';

import userReducer from './reducers/userReducer';
import postReducer from './reducers/postReducer';
import messageReducer from './reducers/messageReducer';

const composedEnhancer = composeWithDevTools({ trace: true });

const reducers = combineReducers({
	user: userReducer,
	post: postReducer,
	message: messageReducer,
});

const store = createStore(reducers, composedEnhancer(applyMiddleware(thunk)));

export default store;
