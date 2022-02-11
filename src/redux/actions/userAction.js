import { SET_AUTHENTICATED, SET_UNAUTHENTICATED, ADD_USER, UPDATE_USER, ADD_POST_TO_USER } from '../actionTypes';

export const setAuthenticated = (uid) => {
	return {
		type: SET_AUTHENTICATED,
		payload: { uid },
	};
};

export const setUnauthenticated = () => {
	return {
		type: SET_UNAUTHENTICATED,
	};
};

export const addUser = (user) => {
	return {
		type: ADD_USER,
		payload: user,
	};
};

export const updateUser = (user) => {
	return {
		type: UPDATE_USER,
		payload: user,
	};
};

export const addPostToUser = (user) => {
	return {
		type: ADD_POST_TO_USER,
		payload: user,
	};
};
