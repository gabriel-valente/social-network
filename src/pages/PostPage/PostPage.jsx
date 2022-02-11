import React, { useEffect, useState } from 'react';
import './PostPage.css';
import Header from 'components/Header/Header';
import { useLocation } from 'react-router-dom';
import store from 'redux/store';
import { fetchPosts } from 'redux/reducers/postReducer';
import Post from 'components/Post/Post';

const PostPage = ({ setUser }) => {
	const location = useLocation();
	const url = location.search.split('=')[1];
	const [post, setPost] = useState();

	useEffect(() => {
		var data = store.getState().post.posts.find((post) => post.id === url);
		if (!data) fetchPosts([url]);

		const handleChange = () => {
			const data = store.getState().post.posts.find((post) => post.id === url);

			if (data) {
				setPost(data);
				unsub();
			}
		};

		const unsub = store.subscribe(handleChange);
		handleChange();
	}, [url]);

	return (
		<div className='app'>
			<Header />
			<div className='feedPosts'>{post && <Post post={post} />}</div>
		</div>
	);
};

export default PostPage;
