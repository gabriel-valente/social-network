import React, { useEffect, useState } from 'react';
import './Messages.css';
import Header from 'components/Header/Header';
import { useLocation, useNavigate } from 'react-router-dom';
import { Avatar, IconButton, List, ListItem, ListItemAvatar, ListItemText, Typography } from '@material-ui/core';
import ChatIcon from '@mui/icons-material/Chat';
import Chat from 'components/Chat/Chat';
import { fetchChats } from 'redux/reducers/messageReducer';
import store from 'redux/store';
import { fetchProfile } from 'redux/reducers/userReducer';

const Messages = () => {
	var navigate = useNavigate();
	const [createChat, setCreateChat] = useState(false);
	const [chatArray, setChatArray] = useState([]);
	let fetched = false;

	useEffect(() => {
		const handleChange = () => {
			if (store.getState().message.chats.length === 0 && !fetched) {
				fetched = true;
				fetchChats().then(() => {
					updateChats();
				});
			} else updateChats();
		};

		const updateChats = () => {
			const chats = store.getState().message.chats;
			const temp = [];

			chats.forEach((chat) => {
				var otherUser = { id: chat.users.find((user) => user !== store.getState().user.authenticated) };

				if (!store.getState().user.users.find((user) => user.uid === otherUser.id)) {
					fetchProfile(otherUser.id).then(() => {
						const usr = store.getState().user.users.find((user) => user.uid === otherUser.id);
						otherUser = { ...otherUser, username: usr.username, imageUrl: usr.imageUrl };

						if (!temp.find((c) => c.id === chat.id))
							temp.push({ id: chat.id, username: otherUser.username, imageUrl: otherUser.imageUrl });
					});
				} else {
					const usr = store.getState().user.users.find((user) => user.uid === otherUser.id);
					otherUser = { ...otherUser, username: usr.username, imageUrl: usr.imageUrl };

					if (!temp.find((c) => c.id === chat.id))
						temp.push({ id: chat.id, username: otherUser.username, imageUrl: otherUser.imageUrl });
				}
			});

			setChatArray(temp);
		};

		const unsub = store.subscribe(handleChange);
		handleChange();

		return () => {
			unsub();
		};
	}, []);

	return (
		<div className='app'>
			<Header />
			<div className='appMessagesBox'>
				<div className='appChats'>
					<div className='appChatsHeader'>
						<Typography variant='h6'>Chats</Typography>
						<IconButton onClick={() => setCreateChat(true)}>
							<ChatIcon />
						</IconButton>
					</div>
					<List className='chatsList'>
						{chatArray &&
							chatArray.map((chat) => (
								<ListItem
									key={chat.id}
									button
									onClick={() => {
										navigate({
											pathname: '/messages',
											search: `?chat=${chat.id}`,
										});
									}}>
									<ListItemAvatar>
										<Avatar src={chat.imageUrl} />
									</ListItemAvatar>
									<ListItemText>{chat.username}</ListItemText>
								</ListItem>
							))}
					</List>
				</div>
				<div className='appCurrentChat'>
					<Chat createChat={createChat} setCreateChat={setCreateChat} />
				</div>
			</div>
		</div>
	);
};

export default Messages;
