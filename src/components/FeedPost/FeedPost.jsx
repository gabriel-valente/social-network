import React, { useEffect, useState } from 'react';
import store from 'redux/store';
import { fetchPosts } from 'redux/reducers/postReducer';
import Post from 'components/Post/Post';

const FeedPosts = () => {
	const [allPosts, setAllPosts] = useState([]);

	useEffect(() => {
		fetchPosts();

		const handleChange = () => {
			const data = store.getState().post.posts;

			if (data.length > 0) {
				const sortedData = data.sort((a, b) => {
					return b.timestamp - a.timestamp;
				});

				setAllPosts(sortedData);
				unsub();
			}
		};

		const unsub = store.subscribe(handleChange);
		handleChange();
	}, []);

	return <div className='feedPosts'>{allPosts && allPosts.map((post) => <Post key={post.id} post={post} />)}</div>;
};

export default FeedPosts;
