import React, { useState } from 'react';
import LogoutIcon from '@mui/icons-material/Logout';
import PersonIcon from '@mui/icons-material/Person';
import ForumIcon from '@mui/icons-material/Forum';
import SearchIcon from '@mui/icons-material/Search';
import './Header.css';
import { auth, db } from 'firebase';
import {
	Avatar,
	FormControl,
	IconButton,
	InputAdornment,
	InputLabel,
	List,
	ListItem,
	ListItemAvatar,
	ListItemText,
	makeStyles,
	OutlinedInput,
} from '@material-ui/core';
import { useNavigate } from 'react-router-dom';

const useStyles = makeStyles((theme) => ({
	floater: {
		display: 'flex',
		flexDirection: 'column',
		position: 'absolute',
		top: '40px',
		backgroundColor: 'white',
		width: '100%',
	},
}));

const Header = (props) => {
	var navigate = useNavigate();
	const classes = useStyles();
	const [search, setSearch] = useState('');
	const [searchResults, setSearchResults] = useState([]);
	const [dropOpen, setDropOpen] = useState(false);
	const user = JSON.parse(localStorage.getItem('authUser'));
	var timerSearch;

	const handleSearch = () => {
		const queryText = search.replace(/ /g, '').toLowerCase();

		const results = [];
		const promises = [
			db
				.collection('users')
				.where('username_search', '>=', queryText)
				.where('username_search', '<=', queryText + '\ufffd')
				.get()
				.then((data) => {
					if (!data.empty) {
						data.forEach((doc) => {
							if (!results.find((res) => res.id === doc.id)) {
								results.push({ id: doc.id, ...doc.data() });
							}
						});
					}
				}),
			db
				.collection('users')
				.where('name_search', '>=', queryText)
				.where('name_search', '<=', queryText + '\ufffd')
				.get()
				.then((data) => {
					if (!data.empty) {
						data.forEach((doc) => {
							if (!results.find((res) => res.id === doc.id)) {
								results.push({ id: doc.id, ...doc.data() });
							}
						});
					}
				}),
		];

		Promise.all(promises).then(() => {
			setSearchResults(results);
			setDropOpen(true);
		});
	};

	const ChangeDropDownFocus = () => {
		const searchInput = document.getElementById('input-search');
		const dropDown = document.getElementById('dropdown');
		if (document.activeElement !== searchInput && !dropDown?.matches(':hover') && !dropDown?.matches(':focus'))
			setDropOpen(false);
		else setDropOpen(true);
	};

	return (
		<div className='header'>
			<img
				className='headerImage'
				src='https://www.instagram.com/static/images/web/mobile_nav_type_logo.png/735145cfe0a4.png'
				alt='logo'
				onClick={() => navigate('/')}
			/>
			<FormControl variant='outlined' size='small' placeholder='Search'>
				<InputLabel htmlFor='input-search'>Search</InputLabel>
				<OutlinedInput
					id='input-search'
					type='text'
					value={search}
					onKeyUp={(e) => {
						clearTimeout(timerSearch);
						if (e.target.value) timerSearch = setTimeout(() => handleSearch(), 1000);
					}}
					onKeyDown={() => clearTimeout(timerSearch)}
					onChange={(e) => setSearch(e.target.value)}
					onFocus={() => ChangeDropDownFocus()}
					onBlur={() => ChangeDropDownFocus()}
					endAdornment={
						<InputAdornment position='end'>
							<IconButton aria-label='search' edge='end' onClick={(e) => handleSearch()}>
								<SearchIcon />
							</IconButton>
						</InputAdornment>
					}
					labelWidth={51}
					onKeyPress={(e) => (e.key === 'Enter' || e.type === 'click' ? handleSearch() : null)}
				/>
				{dropOpen && (
					<List className={classes.floater} id='dropdown' dense>
						{searchResults.map((result) => (
							<ListItem
								key={result.id}
								id='dropdown'
								button
								onClick={() =>
									navigate({
										pathname: '/profile',
										search: `?uid=${result.id}`,
									})
								}>
								<ListItemAvatar>
									<Avatar src={result.imageUrl} />
								</ListItemAvatar>
								<ListItemText>{result.username}</ListItemText>
							</ListItem>
						))}
					</List>
				)}
			</FormControl>
			<div className='headerButtons'>
				<IconButton
					aria-label='profile'
					onClick={() =>
						navigate({
							pathname: '/profile',
							search: `?uid=${user.uid}`,
						})
					}>
					<PersonIcon />
				</IconButton>
				<IconButton aria-label='messages' onClick={() => navigate('/messages')}>
					<ForumIcon />
				</IconButton>
				<IconButton
					aria-label='logout'
					onClick={() => {
						auth.signOut();
					}}>
					<LogoutIcon />
				</IconButton>
			</div>
		</div>
	);
};

export default Header;
