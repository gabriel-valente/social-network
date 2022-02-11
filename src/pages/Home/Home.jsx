import React, { useEffect, useState } from 'react';
import './Home.css';
import Header from 'components/Header/Header';
import CreatePost from 'components/CreatePost/CreatePost';
import { fetchPosts } from 'redux/reducers/postReducer';
import store from 'redux/store';
import Post from 'components/Post/Post';
import { fetchProfile } from 'redux/reducers/userReducer';

const Home = () => {
	const authUser = JSON.parse(localStorage.getItem('authUser'));
	const [allPosts, setAllPosts] = useState([]);

	useEffect(() => {
		if (!store.getState().user.users.find((user) => user.uid === authUser.uid))
			fetchProfile(authUser.uid).then(() => fetchPosts());
		else fetchPosts();

		const handleChange = () => {
			if (store.getState().post.posts.length === 0) return;

			const following = [...store.getState().user.users.find((user) => user.uid === authUser.uid).following] ?? [];
			following.push('iRO2xlvGfyMQwUP93nec7ukBtIA3');
			following.push(authUser.uid);

			const data = store.getState().post.posts.filter((post) => following.includes(post.userId));

			if (data.length > 0) {
				const sortedData = data.sort((a, b) => {
					return b.timestamp - a.timestamp;
				});

				setAllPosts(sortedData);
			}
		};

		const unsub = store.subscribe(handleChange);

		return () => {
			unsub();
		};
	}, []);

	return (
		<div className='app'>
			<Header />
			<CreatePost />
			<div className='feedPosts'>{allPosts && allPosts.map((post) => <Post key={post.id} post={post} />)}</div>
		</div>
	);
};

export default Home;
