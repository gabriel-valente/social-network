import { ADD_CHATS } from 'redux/actionTypes';

export const addChats = (chats) => {
	return {
		type: ADD_CHATS,
		payload: { chats },
	};
};

export const addMessages = (chat, messages) => {
	return {
		type: ADD_CHATS,
		payload: { chat: chat, messages: messages },
	};
};
