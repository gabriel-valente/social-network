import React, { useEffect, useState } from 'react';
import { Button, LinearProgress, makeStyles, TextField } from '@material-ui/core';
import './CreatePost.css';
import UploadPost from 'actions/UploadPost';

const useStyles = makeStyles({
	input: {
		marginBottom: '1rem',
	},
});

const CreatePost = (props) => {
	const classes = useStyles();
	const [data, setData] = useState({
		caption: '',
		imageUrl: '',
	});
	const [progress, setProgress] = useState(0);
	const [uploadState, setUploadState] = useState('none');
	const [error, setError] = useState('');

	useEffect(() => {
		if (uploadState === 'success') {
			setData({ caption: '', imageUrl: '' });
		} else if (uploadState.includes('error: ')) {
			setError('Error uploading, please try again later');
		}
	}, [uploadState]);

	const handleImageChange = (e) => {
		if (e.target.files[0]) {
			setData({ ...data, imageUrl: URL.createObjectURL(e.target.files[0]) });
		}
	};

	return (
		<div className='createPost'>
			<h2 className='createPostTitle'>Add new Post</h2>
			<div className='createPostImageContainer'>
				{data.imageUrl && <img className='createPostImage' src={data.imageUrl} alt='post' />}
				<div className='createPostImageButtons'>
					<Button variant='contained' color='primary' size='large' component='label'>
						Select Image
						<input
							type='file'
							name='input-image'
							id='input-image'
							accept='image/png, image/jpeg'
							hidden
							onChange={(e) => handleImageChange(e)}
						/>
					</Button>
				</div>
			</div>
			{data.imageUrl && (
				<>
					<div className='createPostText'>
						<TextField
							className={classes.input}
							id='input-caption'
							label='Caption'
							variant='outlined'
							multiline
							rows={4}
							value={data.caption}
							onChange={(e) => setData({ ...data, caption: e.target.value })}
						/>
					</div>
					{progress > 0 && <LinearProgress className='createPostProgress' variant='determinate' value={progress} />}
					<p className='createPostError'>{error}</p>
					<Button
						className='createPostButton'
						variant='contained'
						color='primary'
						size='large'
						onClick={() => UploadPost({ data, setProgress, setUploadState })}>
						Make Post
					</Button>
				</>
			)}
		</div>
	);
};

export default CreatePost;
