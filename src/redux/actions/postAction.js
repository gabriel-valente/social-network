import { ADD_POSTS, SET_TIMESTAMP } from 'redux/actionTypes';

export const addPosts = (posts) => {
	return {
		type: ADD_POSTS,
		payload: { posts: posts.posts, timestamp: posts?.timestamp },
	};
};

export const setTimestamp = () => {
	return {
		type: SET_TIMESTAMP,
		payload: { timestamp: Date.now() },
	};
};
