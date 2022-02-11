import React, { useEffect, useState } from 'react';
import './Chat.css';
import { useLocation } from 'react-router-dom';
import { Avatar, IconButton, TextField, Typography } from '@material-ui/core';
import SendIcon from '@mui/icons-material/Send';
import store from 'redux/store';
import { fetchMessages } from 'redux/reducers/messageReducer';
import ChatBubble from 'components/ChatBubble/ChatBubble';
import { db } from 'firebase';
import { onSnapshot } from 'firebase/firestore';

const Chat = () => {
	const location = useLocation();
	const url = location.search.split('=')[1];
	const [chatUserData, setChatUserData] = useState({});
	const [chatArray, setChatArray] = useState([]);
	const [message, setMessage] = useState('');

	useEffect(() => {
		if (url !== undefined) {
			const userId = store
				.getState()
				.message.chats.find((chat) => chat.id === url)
				.users.filter((user) => user !== store.getState().user.authenticated)[0];
			const uData = store.getState().user.users.filter((user) => user.uid === userId)[0];
			setChatUserData({ username: uData.username, imageUrl: uData.imageUrl });
			const query = db.collection('chats').doc(url);
			onSnapshot(query, (snapshot) => {
				setChatArray(snapshot.data().messages);

				var chat = document.getElementById('chatMessages');
				chat.scrollTop = chat.scrollHeight;
			});
		}
	}, [url]);

	const handleCreate = () => {};

	const handleSubmit = () => {};

	return (
		<div className='chat'>
			<div className='appChatsHeader'>
				<div className='chatUser'>
					<Avatar src={chatUserData.imageUrl} />
					<Typography variant='h6'>{chatUserData.username}</Typography>
				</div>
			</div>
			<div className='chatMessages' id='chatMessages'>
				{chatArray &&
					chatArray.map((message) => (
						<ChatBubble userId={message.userId} content={message.content} timestamp={message.timestamp} />
					))}
			</div>
			<div className='chatBottom'>
				<TextField
					className='chatInput'
					value={message}
					onChange={(e) => setMessage(e.target.value)}
					multiline
					minRows={2}
					maxRows={5}
				/>
				<IconButton
					className='sendButton'
					color='primary'
					disabled={message.length === 0}
					onClick={() => console.log('Send')}>
					<SendIcon />
				</IconButton>
			</div>
		</div>
	);
};

export default Chat;
