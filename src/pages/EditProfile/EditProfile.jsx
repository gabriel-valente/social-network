import React, { useEffect, useState } from 'react';
import './EditProfile.css';
import Header from 'components/Header/Header';
import { Button, IconButton, InputAdornment, LinearProgress, makeStyles, TextField } from '@material-ui/core';
import HistoryIcon from '@mui/icons-material/History';
import UpdateProfile from 'actions/UpdateProfile';
import store from 'redux/store';
import { fetchProfile } from 'redux/reducers/userReducer';
import { useNavigate } from 'react-router-dom';
import { Typography } from '@mui/material';

const useStyles = makeStyles({
	input: {
		marginBottom: '1rem',
	},
	adornment: {
		display: 'flex',
		flexDirection: 'column',
		justifyContent: 'flex-end',
		alignContent: 'start',
		height: '113px',
		width: '67.44px',
		marginTop: -18,
		marginBottom: -18,
		marginRight: -13,
		border: '0px solid green',
		borderRadius: '4px',
		overflow: 'hidden',
	},
	counterDiv: {
		height: '0%',
		width: '100%',
		borderRadius: '4px',
		backgroundColor: '#3f51b5',
		overflow: 'hidden',
	},
	counterText: {
		textAlign: 'center',
		color: '#FFFFFF',
		lineHeight: '30px',
	},
});

const EditProfile = (props) => {
	const classes = useStyles();
	const navigate = useNavigate();
	const authUser = JSON.parse(localStorage.getItem('authUser'));
	const [progress, setProgress] = useState(0);
	const [profileData, setProfileData] = useState({
		imageUrl: '',
		name: '',
		username: '',
		description: '',
	});
	const [newData, setNewData] = useState({
		imageUrl: '',
		name: '',
		username: '',
		description: '',
	});

	useEffect(() => {
		if (store.getState().user.users.length === 0) fetchProfile(authUser.uid);

		const handleChange = () => {
			const data = store.getState().user.users.find((user) => user.uid === authUser.uid);

			if (data) {
				setProfileData(data);
				unsub();
			}
		};

		const unsub = store.subscribe(handleChange);
		handleChange();
	}, []);

	const handleImageChange = (e) => {
		if (e.target.files[0]) {
			setNewData({ ...newData, imageUrl: URL.createObjectURL(e.target.files[0]) });
		}
	};

	useEffect(() => {
		setNewData(profileData);
	}, [profileData]);

	return (
		<div className='app'>
			<Header {...props} />
			<div className='appEditProfile'>
				<div className='appEditProfileHeader'>
					<div className='appEditProfileImageContainer'>
						<img className='appEditProfileImage' src={newData.imageUrl} alt='profile' />
						<div className='appEditProfileImageButtons'>
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
							{newData.imageUrl !== profileData.imageUrl && (
								<IconButton
									color='primary'
									size='medium'
									onClick={() => {
										setNewData({ ...newData, imageUrl: profileData.imageUrl });
										document.getElementById('input-image').value = '';
									}}>
									<HistoryIcon />
								</IconButton>
							)}
						</div>
					</div>
					<div className='appEditProfileText'>
						<TextField
							className={classes.input}
							id='input-name'
							label='Name'
							variant='outlined'
							required
							value={newData.name}
							onChange={(e) => setNewData({ ...newData, name: e.target.value })}
						/>
						<TextField
							className={classes.input}
							id='input-username'
							label='Username'
							variant='outlined'
							required
							value={newData.username}
							onChange={(e) => setNewData({ ...newData, username: e.target.value })}
						/>
						<TextField
							className={classes.input}
							id='input-description'
							label='Description'
							variant='outlined'
							multiline
							rows={4}
							value={newData.description}
							InputProps={{
								endAdornment: (
									<div className={classes.adornment}>
										<div className={classes.counterDiv} id='counterDiv'>
											<Typography className={classes.counterText} variant='body1'>
												{newData.description.length}
											</Typography>
										</div>
									</div>
								),
							}}
							onChange={(e) => {
								var text = e.target.value;
								var counter = document.getElementById('counterDiv');
								counter.style.height = (text.length * 100) / 300 + '%';

								if (text.length > 300) {
									counter.style.backgroundColor = '#f44336';
								} else {
									counter.style.backgroundColor = '#3f51b5';
								}
								setNewData({ ...newData, description: text });
							}}
						/>
						{progress > 0 && <LinearProgress className='editProfileProgress' variant='determinate' value={progress} />}
						<Button
							variant='contained'
							color='primary'
							size='large'
							disabled={
								Object.entries(newData).toString() === Object.entries(profileData).toString() ||
								newData.description.length > 300
							}
							onClick={() => {
								if (UpdateProfile({ data: newData, setProgress: setProgress }))
									navigate({
										pathname: '/profile',
										search: `?uid=${authUser.uid}`,
									});
							}}>
							Submit changes
						</Button>
					</div>
				</div>
			</div>
		</div>
	);
};

export default EditProfile;
