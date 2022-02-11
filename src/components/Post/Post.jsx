import React, { useEffect, useState } from 'react';
import { IconButton, TextField, Typography, makeStyles, Avatar } from '@material-ui/core';
import ThumbUpOutlinedIcon from '@mui/icons-material/ThumbUpOutlined';
import ThumbUpIcon from '@mui/icons-material/ThumbUp';
import ChatBubbleOutlineOutlinedIcon from '@mui/icons-material/ChatBubbleOutlineOutlined';
import DeleteIcon from '@mui/icons-material/Delete';
import SendIcon from '@mui/icons-material/Send';
import './Post.css';
import firebase from 'firebase/compat';
import { db } from 'firebase';
import { useNavigate } from 'react-router-dom';
import store from 'redux/store';
import { fetchProfile } from 'redux/reducers/userReducer';

const useStyles = makeStyles({
	avatar: {
		height: '50px',
		width: '50px',
		cursor: 'pointer',
	},
	caption: {
		margin: '10px',
		marginTop: '0px',
		borderBottom: '1px solid #ccc',
	},
	numbers: {
		verticalAlign: 'middle',
		fontSize: '16px',
		fontWeight: 'bold',
	},
	commentName: {
		display: 'flex',
		flexDirection: 'column',
		justifyContent: 'flex-start',
		alignItems: 'flex-end',
		fontSize: '16px',
		fontWeight: 'bold',
		paddingRight: '5px',
		borderRight: '1px solid #ccc',
		cursor: 'pointer',
	},
	commentText: {
		display: 'flex',
		flexDirection: 'column',
		justifyContent: 'center',
		alignItems: 'flex-start',
		fontSize: '16px',
		fontWeight: 'lighter',
		marginRight: '5px',
		paddingLeft: '5px',
		borderLeft: '1px solid #ccc',
		flex: 1,
	},
	deleteHover: {
		padding: '0 0 0 10px',
		borderRadius: 0,
		borderLeft: '2px solid #ccc',
		'&:hover': {
			backgroundColor: 'transparent',
			color: '#f44336',
		},
	},
});

const Post = ({ post }) => {
	const classes = useStyles();
	const navigate = useNavigate();
	const currentUser = JSON.parse(localStorage.getItem('authUser'));
	const [visibleInput, setVisibleInput] = useState(false);
	const [commentInput, setCommentInput] = useState('');
	const [currPost, setCurrPost] = useState(post);

	useEffect(() => {
		const handleChange = () => {
			const userList = store.getState().user.users;

			if (userList.find((user) => user.uid === post.userId)) {
				setCurrPost({
					...currPost,
					profilePicture: userList.find((user) => user.uid === post.userId).imageUrl,
				});
				unsub();
			} else {
				fetchProfile(post.userId);
			}
		};

		const unsub = store.subscribe(handleChange);
		handleChange();

		return () => {
			unsub();
		};
	}, []);

	const handleLike = () => {
		// If the user doesn't have a like in the post
		if (!currPost.likes.includes(currentUser.uid)) {
			// Updates the database and adds the user like
			db.collection('posts')
				.doc(currPost.id)
				.update({ likes: firebase.firestore.FieldValue.arrayUnion(currentUser.uid) });

			// Updates the local data
			currPost.likes.push(currentUser.uid);
		} else {
			// If the user has a like in the post
			// Updates the database and removes the user like
			db.collection('posts')
				.doc(currPost.id)
				.update({ likes: firebase.firestore.FieldValue.arrayRemove(currentUser.uid) });

			// Updates the local data
			currPost.likes.splice(currPost.likes.indexOf(currentUser.uid), 1);
		}

		setCurrPost({ ...currPost });
	};

	const handleComment = () => {
		if (commentInput.length === 0) return;

		// Updates the database and adds the comment
		db.collection('posts')
			.doc(currPost.id)
			.update({
				comments: firebase.firestore.FieldValue.arrayUnion({
					userId: currentUser.uid,
					username: currentUser.displayName,
					text: commentInput,
					timestamp: Date.now(),
				}),
			})
			.then(() => {
				setVisibleInput(false);
				setCommentInput('');
				currPost.comments?.unshift({
					userId: currentUser.uid,
					username: currentUser.displayName,
					text: commentInput,
					timestamp: Date.now(),
				});

				setCurrPost({ ...currPost });
			});
	};

	const handleDelete = (timestamp) => {
		const deleteComment = currPost.comments.filter(
			(comment) => comment.timestamp === timestamp && comment.userId === currentUser.uid
		);

		db.collection('posts')
			.doc(currPost.id)
			.update({
				comments: firebase.firestore.FieldValue.arrayRemove(deleteComment[0]),
			})
			.then(() => {
				currPost.comments.splice(currPost.comments.indexOf(deleteComment[0]), 1);
				setCurrPost({ ...currPost });
			});
	};

	return (
		<div className='postImageGrid' key={currPost.id}>
			<div className='postUserInfo'>
				<Avatar
					alt='Profile Image'
					src={currPost.profilePicture}
					className={classes.avatar}
					onClick={() =>
						navigate({
							pathname: '/profile',
							search: `?uid=${currPost.userId}`,
						})
					}
				/>
				<h3
					className='postName'
					onClick={() =>
						navigate({
							pathname: '/profile',
							search: `?uid=${currPost.userId}`,
						})
					}>
					{post.username}
				</h3>
			</div>
			<img className='postImage' key={currPost.id} src={currPost.imageUrl} alt='post' />
			<div className='postButtons'>
				<IconButton onClick={() => handleLike()}>
					{currPost.likes.includes(currentUser.uid) ? <ThumbUpIcon /> : <ThumbUpOutlinedIcon />}
				</IconButton>
				<Typography className={classes.numbers} variant='caption'>
					{currPost.likes?.length ?? 0}
				</Typography>
				<IconButton onClick={() => setVisibleInput(!visibleInput)}>
					<ChatBubbleOutlineOutlinedIcon />
				</IconButton>
				<Typography className={classes.numbers} variant='caption'>
					{currPost.comments?.length ?? 0}
				</Typography>
			</div>
			<Typography className={classes.caption} variant='subtitle1'>
				{currPost.caption}
			</Typography>
			{visibleInput && (
				<div className='postInputDrawer'>
					<TextField
						className='postInputComment'
						id='input-comment'
						label='Comment'
						variant='outlined'
						multiline
						autoFocus
						rows={2}
						value={commentInput}
						onChange={(e) => setCommentInput(e.target.value)}
					/>
					<IconButton
						color='primary'
						style={{ backgroundColor: 'transparent' }}
						disabled={commentInput.length === 0}
						onClick={() => handleComment()}>
						<SendIcon />
					</IconButton>
				</div>
			)}
			<div className='postCommentsList'>
				{currPost.comments?.length > 0 &&
					currPost.comments.map((comment, key) => {
						return (
							<div className='postComment' key={key}>
								<Typography
									className={classes.commentName}
									variant='caption'
									onClick={() =>
										navigate({
											pathname: '/profile',
											search: `?uid=${comment.userId}`,
										})
									}>
									{comment.username}
								</Typography>
								<Typography className={classes.commentText} variant='caption'>
									{comment.text}
								</Typography>
								{comment.userId === currentUser.uid && (
									<IconButton className={classes.deleteHover} onClick={() => handleDelete(comment.timestamp)}>
										<DeleteIcon />
									</IconButton>
								)}
							</div>
						);
					})}
			</div>
		</div>
	);
};

export default Post;
