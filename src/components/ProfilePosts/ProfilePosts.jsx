import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { fetchPosts } from 'redux/reducers/postReducer';
import store from 'redux/store';
import './ProfilePosts.css';

const ProfilePosts = ({ posts, uid }) => {
	const navigate = useNavigate();
	const [allPosts, setAllPosts] = useState([]);

	useEffect(() => {
		if (store.getState().post.posts.length === 0) fetchPosts(posts);

		const handleChange = () => {
			const data = store.getState().post.posts;

			if (data) {
				const temp = [];

				const sortedData = data.sort((a, b) => {
					return b.timestamp - a.timestamp;
				});

				sortedData.forEach((element) => {
					if (element.userId === uid) temp.push(element);
				});

				setAllPosts(temp);
			}
		};

		const unsub = store.subscribe(handleChange);
		handleChange();

		return () => {
			unsub();
		};
	}, []);

	return (
		<div className='profilePosts'>
			<div className='profilePostsImageGrid'>
				{allPosts &&
					allPosts.map((post) => (
						<img
							className='profilePostImage'
							key={post.id}
							src={post.imageUrl}
							alt='post'
							onClick={() =>
								navigate({
									pathname: '/post',
									search: `?pid=${post.id}`,
								})
							}
						/>
					))}
			</div>
		</div>
	);
};

export default ProfilePosts;
