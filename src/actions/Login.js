import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from 'firebase';
import store from 'redux/store';
import { setAuthenticated } from 'redux/actions/userAction';

const Login = async (e, data) => {
	e.preventDefault();
	var error;

	await signInWithEmailAndPassword(auth, data.email, data.password)
		.then((success) => {
			localStorage.setItem('authUser', JSON.stringify(success.user));
			store.dispatch(setAuthenticated(success.user.uid));
		})
		.catch((err) => {
			switch (err.code) {
				case 'auth/invalid-email':
					error = 'Email or Password are incorrect.';
					break;
				case 'auth/wrong-password':
					error = 'Email or Password are incorrect.';
					break;
				case 'auth/too-many-requests':
					error = 'Too many attempts, try again later.';
					break;
				default:
					error = 'Something went wrong.';
					break;
			}
		});
	return error;
};

export default Login;
