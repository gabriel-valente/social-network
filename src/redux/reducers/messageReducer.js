import { db } from 'firebase';
import { addChats, addMessages } from 'redux/actions/messageAction';
import { ADD_CHATS, ADD_MESSAGES } from 'redux/actionTypes';
import store from 'redux/store';

const initialState = {
	chats: [],
};

// eslint-disable-next-line import/no-anonymous-default-export
export default function (state = initialState, action) {
	switch (action.type) {
		case ADD_CHATS:
			return { ...state, chats: [...state.chats, ...action.payload.chats] };
		case ADD_MESSAGES:
			return {
				...state,
				chats: state.chats.map((chat) =>
					chat.id === action.payload.chat ? { ...chat, messages: [...chat.messages, ...action.payload.messages] } : chat
				),
			};
		default:
			return state;
	}
}

export const fetchChats = async () => {
	const user = store.getState().user.authenticated;
	const data = await db.collection('chats').where('users', 'array-contains', user).get();
	const temp = [];

	if (!data.empty) {
		const chats = store.getState().message.chats;

		data.forEach((doc) => {
			if (!chats.find((chat) => chat.id === doc.id)) temp.push({ id: doc.id, ...doc.data() });
		});
	}

	const orderedChats = temp.sort((a, b) => b.lastTimestamp - a.lastTimestamp);

	store.dispatch(addChats(orderedChats));
};

export const fetchMessages = async (chatId) => {
	const messages = [];
	const data = await db.collection('chats').doc(chatId).get();

	if (!data.exists) messages.push({ id: data.id, ...data.data() });

	store.dispatch(addMessages(chatId, messages));
};
