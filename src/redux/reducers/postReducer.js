import firebase from 'firebase/compat';
import { db } from 'firebase';
import { ADD_POSTS, SET_TIMESTAMP } from 'redux/actionTypes';
import store from 'redux/store';
import { addPosts, setTimestamp } from 'redux/actions/postAction';

const initialState = {
	timestamp: null,
	posts: [],
};

// eslint-disable-next-line import/no-anonymous-default-export
export default function (state = initialState, action) {
	switch (action.type) {
		case ADD_POSTS:
			return {
				...state,
				posts: [...action.payload.posts, ...state.posts],
				timestamp: action.payload.timestamp ? action.payload.timestamp : state.timestamp,
			};
		case SET_TIMESTAMP:
			return {
				...state,
				timestamp: action.payload.timestamp,
			};
		default:
			return state;
	}
}

export const fetchPosts = async (posts = null, position = 0) => {
	var temp = [];

	if (posts !== null) {
		const data = await db.collection('posts').where(firebase.firestore.FieldPath.documentId(), 'in', posts).get();

		if (!data.empty) {
			data.forEach((doc) => {
				temp.unshift({ id: doc.id, ...doc.data() });
			});
		}

		temp = temp.sort((a, b) => b.timestamp - a.timestamp);

		for (let i = 0; i < temp.length; i++) {
			const element = temp[i];

			element.comments?.sort((a, b) => b.timestamp - a.timestamp);

			temp[i] = element;
		}

		store.dispatch(addPosts({ posts: temp }));
	} else {
		const timestamp = store.getState().post.timestamp;

		// If its the first time fetching posts or if has lapsed more than 3 minutes
		if (timestamp === null || timestamp < Date.now() - 1000 * 60 * 3) {
			store.dispatch(setTimestamp());

			const promises = [];
			const auth = store.getState().user.authenticated;
			const following = [];
			const fTemp = [...store.getState().user.users.find((user) => user.uid === auth).following] ?? [];
			//TEMPORARY
			fTemp.push('iRO2xlvGfyMQwUP93nec7ukBtIA3');
			fTemp.push(auth);

			for (let i = 0; i < fTemp.length; i += 10) {
				if (i <= fTemp.length) {
					const iLimit = i + 10 < fTemp.length ? i + 10 : fTemp.length;
					const fSection = fTemp.slice(i, iLimit);
					following.push(fSection);
				}
			}

			const posts = store.getState().post.posts;

			following.forEach((f) => {
				promises.push(
					db
						.collection('posts')
						.where('userId', 'in', f)
						.get()
						.then((data) => {
							if (!data.empty) {
								data.forEach((doc) => {
									if (!posts.find((post) => post.id === doc.id)) {
										temp.unshift({ id: doc.id, ...doc.data() });
									}
								});
							}
						})
				);
			});

			Promise.all(promises).then(() => {
				for (let i = 0; i < temp.length; i++) {
					const element = temp[i];

					element.comments?.sort((a, b) => b.timestamp - a.timestamp);

					temp[i] = element;
				}

				store.dispatch(addPosts({ posts: temp, timestamp: Date.now() }));
			});
		}
	}
};
