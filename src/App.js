import React, { useEffect, useState } from 'react';
import { Route, Routes } from 'react-router-dom';
import { auth } from './firebase';

import store from './redux/store';

import Home from 'pages/Home/Home';
import FrontPage from 'pages/FrontPage/FrontPage';
import Messages from 'pages/Messages/Messages';
import Profile from 'pages/Profile/Profile';
//import Settings from 'pages/Settings/Settings';
import EditProfile from 'pages/EditProfile/EditProfile';
import { setAuthenticated, setUnauthenticated } from 'redux/actions/userAction';
import PostPage from 'pages/PostPage/PostPage';

const App = (props) => {
	const [user, setUser] = useState(null);

	const PrivateRoute = ({ children }) => {
		return localStorage.getItem('authUser') !== null ? children : <FrontPage {...props} />;
	};

	useEffect(() => {
		const unsub = auth.onAuthStateChanged((authUser) => {
			if (authUser) {
				localStorage.setItem('authUser', JSON.stringify(authUser));
				store.dispatch(setAuthenticated(authUser.uid));
				setUser(authUser);
			} else {
				localStorage.removeItem('authUser');
				store.dispatch(setUnauthenticated());
				setUser(null);
			}
		});

		return () => {
			unsub();
		};
	}, []);

	return (
		<Routes>
			<Route
				path='/'
				element={
					<PrivateRoute>
						<Home {...props} />
					</PrivateRoute>
				}
			/>
			<Route
				path='/profile'
				element={
					<PrivateRoute>
						<Profile {...props} />
					</PrivateRoute>
				}
			/>
			<Route
				path='/editProfile'
				element={
					<PrivateRoute>
						<EditProfile {...props} />
					</PrivateRoute>
				}
			/>
			<Route
				path='/post'
				element={
					<PrivateRoute>
						<PostPage {...props} />
					</PrivateRoute>
				}
			/>
			<Route
				path='/messages'
				element={
					<PrivateRoute>
						<Messages {...props} />
					</PrivateRoute>
				}
			/>
		</Routes>
	);
};

export default App;
