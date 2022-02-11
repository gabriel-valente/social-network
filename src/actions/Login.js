import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from 'firebase';
import store from 'redux/store';
import { setAuthenticated } from 'redux/actions/userAction';

const Login = (e, data) => {
	e.preventDefault();

	signInWithEmailAndPassword(auth, data.email, data.password)
		.then((success) => {
			localStorage.setItem('authUser', JSON.stringify(success.user));
			store.dispatch(setAuthenticated(success.user.uid));
		})
		.catch((error) => alert(error.message));
	return true;
};

export default Login;
