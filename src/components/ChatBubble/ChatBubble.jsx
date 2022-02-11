import React from 'react';
import './ChatBubble.css';

const ChatBubble = ({ userId, content, timestamp }) => {
	const authUser = JSON.parse(localStorage.getItem('authUser'));
	return (
		<div>
			{userId === authUser.uid ? (
				<div className='bubble local'>{content}</div>
			) : (
				<div className='bubble remote'>{content}</div>
			)}
		</div>
	);
};

export default ChatBubble;
