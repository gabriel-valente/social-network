import React, { useEffect, useState } from 'react';
import './Chat.css';
import { useLocation, useNavigate } from 'react-router-dom';
import {
	Avatar,
	IconButton,
	List,
	ListItem,
	ListItemAvatar,
	ListItemText,
	makeStyles,
	TextField,
	Typography,
} from '@material-ui/core';
import SendIcon from '@mui/icons-material/Send';
import store from 'redux/store';
import { fetchChats, fetchMessages } from 'redux/reducers/messageReducer';
import ChatBubble from 'components/ChatBubble/ChatBubble';
import { db } from 'firebase';
import firebase from 'firebase/compat';
import { onSnapshot } from 'firebase/firestore';
import { fetchProfile } from 'redux/reducers/userReducer';

const useStyles = makeStyles({
	floater: {
		display: 'flex',
		flexDirection: 'column',
		backgroundColor: 'white',
		width: '100%',
	},
	notSelected: {
		margin: 'auto',
		fontSize: 'large',
		color: 'gray',
	},
});

const Chat = ({ createChat, setCreateChat }) => {
	var navigate = useNavigate();
	const classes = useStyles();
	const location = useLocation();
	const url = location.search.split('=')[1];
	const [chatUserData, setChatUserData] = useState({});
	const [chatArray, setChatArray] = useState([]);
	const [message, setMessage] = useState('');
	const [dropOpen, setDropOpen] = useState(false);
	const [searchResults, setSearchResults] = useState([]);
	const [search, setSearch] = useState('');

	const [timerSearch, setTimerSearch] = useState(null);

	useEffect(() => {
		var unsubscribe = function () {};
		const handleChange = () => {
			const handleChatUserData = (userId) => {
				const uData = store.getState().user.users.filter((user) => user.uid === userId)[0];

				setChatUserData({ username: uData.username, imageUrl: uData.imageUrl });
				const query = db.collection('chats').doc(url);
				unsubscribe();
				unsubscribe = onSnapshot(query, (snapshot) => {
					setChatArray(snapshot.data().messages);

					var chat = document.getElementById('chatMessages');
					chat.scrollTop = chat.scrollHeight;
				});
			};

			if (url !== undefined && store.getState().message.chats.length !== 0) {
				const currentChat = store.getState().message.chats.find((chat) => chat.id === url);
				if (currentChat) {
					const userId = currentChat.users.filter((user) => user !== store.getState().user.authenticated)[0];

					if (!store.getState().user.users.find((user) => user.uid === userId)) {
						fetchProfile(userId).then(() => {
							handleChatUserData(userId);
						});
					} else {
						handleChatUserData(userId);
					}
				}
			}
		};

		unsubscribe();
		const unsub = store.subscribe(handleChange);
		handleChange();

		return () => {
			unsubscribe();
			unsub();
		};
	}, [url]);

	useEffect(() => {
		if (createChat === true) {
			navigate({
				pathname: '/messages',
			});
		}
	}, [createChat]);

	const handleSearch = () => {
		if (search.trim().length !== 0) {
			const queryText = search.replace(/ /g, '').toLowerCase();

			const results = [];
			const promises = [
				db
					.collection('users')
					.where('username_search', '>=', queryText)
					.where('username_search', '<=', queryText + '\ufffd')
					.get()
					.then((data) => {
						if (!data.empty) {
							data.forEach((doc) => {
								if (!results.find((res) => res.id === doc.id) && doc.id !== store.getState().user.authenticated) {
									results.push({ id: doc.id, ...doc.data() });
								}
							});
						}
					}),
				db
					.collection('users')
					.where('name_search', '>=', queryText)
					.where('name_search', '<=', queryText + '\ufffd')
					.get()
					.then((data) => {
						if (!data.empty) {
							data.forEach((doc) => {
								if (!results.find((res) => res.id === doc.id) && doc.id !== store.getState().user.authenticated) {
									results.push({ id: doc.id, ...doc.data() });
								}
							});
						}
					}),
			];

			Promise.all(promises).then(() => {
				setSearchResults(results);
				setDropOpen(true);
			});
		}
	};

	const handleCreate = (user) => {
		const chat = store.getState().message.chats.find((chat) => chat.users.includes(user.id));
		if (chat) {
			setCreateChat(false);
			navigate({
				pathname: '/messages',
				search: `?chat=${chat.id}`,
			});
		} else {
			const chatRef = db.collection('chats').doc();
			setCreateChat({ ref: chatRef, users: [store.getState().user.authenticated, user.id] });
			navigate({
				pathname: '/messages',
				search: `?chat=${chatRef.id}`,
			});

			setChatUserData(user);
		}
	};

	const handleSend = () => {
		if (message.trim().length !== 0) {
			if (typeof createChat === 'object') {
				db.collection('chats')
					.doc(createChat.ref.id)
					.set({
						lastTimestamp: new Date(),
						messages: firebase.firestore.FieldValue.arrayUnion({
							content: message.trim(),
							timestamp: new Date(),
							userId: store.getState().user.authenticated,
						}),
						users: createChat.users,
					});

				fetchChats();
				navigate({
					pathname: '/messages',
					search: `?chat=${createChat.ref.id}`,
				});
				setCreateChat(false);
			} else {
				db.collection('chats')
					.doc(url)
					.update({
						lastTimestamp: new Date(),
						messages: firebase.firestore.FieldValue.arrayUnion({
							content: message.trim(),
							timestamp: new Date(),
							userId: store.getState().user.authenticated,
						}),
					});
			}

			setMessage('');
		}
	};

	return (
		<div className='chat'>
			{createChat === true && (
				<div className='appChatsHeaderSearch'>
					<TextField
						className='chatInput'
						placeholder='Username'
						value={search}
						onChange={(e) => setSearch(e.target.value)}
						onKeyUp={(e) => {
							setTimerSearch(clearTimeout(timerSearch));
							if (e.target.value) setTimerSearch(setTimeout(() => handleSearch(), 1000));
						}}
						onKeyDown={() => {
							setTimerSearch(clearTimeout(timerSearch));
						}}
					/>
					{dropOpen && (
						<List className={classes.floater} id='dropdown' dense>
							{searchResults.map((result) => (
								<ListItem key={result.id} id='dropdown' button onClick={() => handleCreate(result)}>
									<ListItemAvatar>
										<Avatar src={result.imageUrl} />
									</ListItemAvatar>
									<ListItemText>{result.username}</ListItemText>
								</ListItem>
							))}
						</List>
					)}
				</div>
			)}
			{(createChat === false && url !== undefined) || (typeof createChat === 'object' && url !== undefined) ? (
				<>
					<div className='appChatsHeader'>
						<div className='chatUser'>
							<Avatar src={chatUserData.imageUrl} />
							<Typography variant='h6'>{chatUserData.username}</Typography>
						</div>
					</div>
					<div className='chatMessages' id='chatMessages'>
						{chatArray &&
							chatArray.map((message, key) => {
								console.count('Chamadas');
								return (
									<ChatBubble
										key={key}
										userId={message.userId}
										content={message.content}
										timestamp={message.timestamp}
									/>
								);
							})}
					</div>
					<div className='chatBottom'>
						<TextField
							className='chatInput'
							value={message}
							onChange={(e) => setMessage(e.target.value)}
							multiline
							minRows={2}
							maxRows={5}
							onKeyDown={(e) => {
								if (e.key === 'Enter' && !e.shiftKey) handleSend();
							}}
						/>
						<IconButton
							className='sendButton'
							color='primary'
							disabled={message.trim().length === 0}
							onClick={() => handleSend()}>
							<SendIcon />
						</IconButton>
					</div>
				</>
			) : (
				<Typography className={classes.notSelected}>Select a chat or create a new one to start</Typography>
			)}
		</div>
	);
};

export default Chat;
