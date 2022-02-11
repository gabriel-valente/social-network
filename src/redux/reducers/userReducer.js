import { db } from 'firebase';
import { addUser } from 'redux/actions/userAction';
import { ADD_POST_TO_USER, ADD_USER, SET_AUTHENTICATED, SET_UNAUTHENTICATED, UPDATE_USER } from 'redux/actionTypes';
import store from 'redux/store';

const initialState = {
	authenticated: '',
	users: [],
};

// eslint-disable-next-line import/no-anonymous-default-export
export default function (state = initialState, action) {
	switch (action.type) {
		case SET_AUTHENTICATED:
			return {
				...state,
				authenticated: action.payload.uid,
			};
		case SET_UNAUTHENTICATED:
			return initialState;
		case ADD_USER:
			return { ...state, users: [...state.users, action.payload] };
		case UPDATE_USER:
			return {
				...state,
				users: state.users.map((user) => (user.uid === action.payload.uid ? { ...user, ...action.payload } : user)),
			};
		case ADD_POST_TO_USER:
			return {
				...state,
				users: state.users.map((user) =>
					user.uid === action.payload.uid ? { ...user, posts: [...user.posts, action.payload.post] } : user
				),
			};
		default:
			return state;
	}
}

export const fetchProfile = (profile) => {
	return db
		.collection('users')
		.doc(profile)
		.get()
		.then((doc) => {
			if (doc.exists) {
				const data = doc.data();
				const storeData = store.getState().user.users.find((user) => user.uid === profile);

				if (!storeData)
					store.dispatch(
						addUser({
							uid: profile,
							imageUrl: data.imageUrl,
							name: data.name,
							username: data.username,
							description: data.description,
							followers: data.followers,
							following: data.following,
							posts: data.posts,
						})
					);
			}
		});
};
