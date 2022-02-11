import React, { useEffect, useState } from 'react';
import './EditProfile.css';
import Header from 'components/Header/Header';
import { Button, IconButton, InputAdornment, LinearProgress, makeStyles, TextField } from '@material-ui/core';
import HistoryIcon from '@mui/icons-material/History';
import UpdateProfile from 'actions/UpdateProfile';
import store from 'redux/store';
import { fetchProfile } from 'redux/reducers/userReducer';
import { useNavigate } from 'react-router-dom';

const useStyles = makeStyles({
	input: {
		marginBottom: '1rem',
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
									<InputAdornment position='end'>
										<svg
											height='100%'
											width='100%'
											viewBox='0 0 20 20'
											style={{
												minHeight: '25px',
												minWidth: '25px',
												overflow: 'visible',
											}}>
											<circle cx='50%' cy='50%' r='10' stroke='lightgray' strokeWidth='4' fill='none' />
											<circle
												cx='50%'
												cy='50%'
												r='10'
												stroke='#6AA2E3'
												strokeWidth='2'
												fill='none'
												strokeLinecap='round'
												style={{ strokeDashoffset: '1%', strokeDasharray: '10%' }} // FIX THIS
											/>
										</svg>
									</InputAdornment>
								),
							}}
							onChange={(e) => setNewData({ ...newData, description: e.target.value })}
						/>
						{progress > 0 && <LinearProgress className='editProfileProgress' variant='determinate' value={progress} />}
						<Button
							variant='contained'
							color='primary'
							size='large'
							disabled={Object.entries(newData).toString() === Object.entries(profileData).toString()}
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
