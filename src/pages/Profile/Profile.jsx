import React, { useEffect, useState } from 'react';
import './Profile.css';
import Header from 'components/Header/Header';
import { Avatar, Button, makeStyles } from '@material-ui/core';
import { useLocation, useNavigate } from 'react-router-dom';
import CreatePost from 'components/CreatePost/CreatePost';
import ProfilePosts from 'components/ProfilePosts/ProfilePosts';
import store from 'redux/store';
import { fetchProfile } from 'redux/reducers/userReducer';
import { db } from 'firebase';
import firebase from 'firebase/compat';
import { updateUser } from 'redux/actions/userAction';

const useStyles = makeStyles((theme) => ({
	avatar: {
		height: '150px',
		width: '150px',
	},
}));

const Profile = (props) => {
	var navigate = useNavigate();
	const classes = useStyles();
	const location = useLocation();
	const url = location.search.split('=')[1];
	var authUser = JSON.parse(localStorage.getItem('authUser'));
	const [profileData, setProfileData] = useState({
		uid: '',
		imageUrl: '',
		name: '',
		username: '',
		description: '',
		followers: [],
		following: [],
		posts: [],
	});

	useEffect(() => {
		var data = store.getState().user.users.find((user) => user.uid === url);
		if (!data) fetchProfile(url);

		const handleChange = () => {
			const data = store.getState().user.users.find((user) => user.uid === url);

			if (data) {
				setProfileData(data);
				unsub();
			}
		};

		const unsub = store.subscribe(handleChange);
		handleChange();
	}, [url]);

	const changeFollow = () => {
		if (!profileData.followers.includes(authUser.uid)) {
			// Updates the database and adds the user follow
			db.collection('users')
				.doc(profileData.uid)
				.update({ followers: firebase.firestore.FieldValue.arrayUnion(authUser.uid) });

			db.collection('users')
				.doc(authUser.uid)
				.update({ following: firebase.firestore.FieldValue.arrayUnion(profileData.uid) });

			profileData.followers.push(authUser.uid);
		} else {
			// Updates the database and removes the user follow
			db.collection('users')
				.doc(profileData.uid)
				.update({ followers: firebase.firestore.FieldValue.arrayRemove(authUser.uid) });

			db.collection('users')
				.doc(authUser.uid)
				.update({ following: firebase.firestore.FieldValue.arrayRemove(profileData.uid) });

			profileData.followers.splice(profileData.followers.indexOf(authUser.uid), 1);
		}

		fetchProfile(authUser.uid);
		store.dispatch(updateUser([profileData]));
		setProfileData({ ...profileData });
	};

	return (
		<div className='app'>
			<Header {...props} />
			<div className='appProfile'>
				<div className='appProfileHeader'>
					<Avatar alt='Profile Image' src={profileData.imageUrl} className={classes.avatar} />
					<div className='appProfileHeaderInfo'>
						<div className='appProfileHeaderNames'>
							<h2 className='appUsername'>@{profileData.username}</h2>
							<h2 className='appName'>{profileData.name}</h2>
						</div>
						<p className='appDescription'>{profileData.description}</p>
					</div>
				</div>
				<div className='appProfileStats'>
					<div className='appProfileStatText'>
						<h2>{profileData.posts?.length}</h2>
						<h2>Posts</h2>
					</div>
					<div className='appProfileStatText'>
						<h2>{profileData.following?.length}</h2>
						<h2>Following</h2>
					</div>
					<div className='appProfileStatText'>
						<h2>{profileData.followers?.length}</h2>
						<h2>Followers</h2>
					</div>
					<div className='appProfileStatButton'>
						{authUser.uid === profileData.uid ? (
							<Button variant='contained' color='primary' size='large' onClick={() => navigate('/editProfile')}>
								Edit Profile
							</Button>
						) : profileData.followers?.includes(authUser.uid) ? (
							<Button variant='contained' color='primary' size='large' onClick={() => changeFollow()}>
								Unfollow
							</Button>
						) : (
							<Button variant='contained' color='primary' size='large' onClick={() => changeFollow()}>
								Follow
							</Button>
						)}
					</div>
				</div>
			</div>
			<CreatePost />
			{profileData.posts?.length > 0 && <ProfilePosts posts={profileData.posts} uid={profileData.uid} />}
		</div>
	);
};

export default Profile;
