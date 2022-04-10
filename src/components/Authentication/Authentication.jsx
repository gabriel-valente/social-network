import React, { useState } from 'react';
import { Button, TextField, makeStyles } from '@material-ui/core';
import './Authentication.css';
import Register from 'actions/Register';
import Login from 'actions/Login';
import { useNavigate } from 'react-router-dom';

const useStyles = makeStyles({
	input: {
		marginBottom: '1rem',
	},
});

const Authentication = (props) => {
	const navigate = useNavigate();
	const classes = useStyles();
	const [authType, setAuthType] = useState('Login');
	const [form, setForm] = useState({
		name: '',
		username: '',
		email: '',
		password: '',
	});
	const [error, setError] = useState('');

	return (
		<div className='auth'>
			<h2>{authType}</h2>
			{authType === 'Login' ? (
				<form className='authForm'>
					<TextField
						className={classes.input}
						id='input-email'
						label='Email'
						variant='outlined'
						required
						value={form.email}
						onChange={(e) => setForm({ ...form, email: e.target.value })}
					/>
					<TextField
						className={classes.input}
						id='input-password'
						label='Password'
						variant='outlined'
						type='password'
						required
						value={form.password}
						onChange={(e) => setForm({ ...form, password: e.target.value })}
					/>
					<p className='authError'>{error}</p>
					<Button
						type='submit'
						variant='contained'
						color='primary'
						onClick={async (e) => {
							var suc = await Login(e, form);
							if (suc) navigate('');
						}}>
						Log In
					</Button>
					<p>
						Don't have an account?{' '}
						<a href='#' className='link-button' onClick={() => setAuthType('Register')}>
							Register Here
						</a>
						.
					</p>
				</form>
			) : (
				<form className='authForm'>
					<TextField
						className={classes.input}
						id='input-name'
						label='Name'
						variant='outlined'
						required
						value={form.name}
						onChange={(e) => setForm({ ...form, name: e.target.value })}
					/>
					<TextField
						className={classes.input}
						id='input-username'
						label='Username'
						variant='outlined'
						required
						value={form.username}
						onChange={(e) => setForm({ ...form, username: e.target.value })}
					/>
					<TextField
						className={classes.input}
						id='input-email'
						label='Email'
						variant='outlined'
						required
						value={form.email}
						onChange={(e) => setForm({ ...form, email: e.target.value })}
					/>
					<TextField
						className={classes.input}
						id='input-password'
						label='Password'
						variant='outlined'
						type='password'
						required
						value={form.password}
						onChange={(e) => setForm({ ...form, password: e.target.value })}
					/>
					<p className='authError'>{error}</p>
					<Button
						type='submit'
						variant='contained'
						color='primary'
						onClick={async (e) => {
							console.log('a');
							await Register(e, form).then((res) => {
								setError(res);
							});
						}}>
						Register
					</Button>
					<p>
						Already have an account?{' '}
						<a href='#' className='link-button' onClick={() => setAuthType('Login')}>
							Log in Here
						</a>
						.
					</p>
				</form>
			)}
		</div>
	);
};

export default Authentication;
