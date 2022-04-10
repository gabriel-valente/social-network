import { createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import firebase from 'firebase/compat';
import { auth, db } from 'firebase';
import store from 'redux/store';
import { setAuthenticated } from 'redux/actions/userAction';

const Register = async (e, data) => {
	e.preventDefault();
	var error;

	if (data.name.length < 3) {
		return 'Name must be at least three characters long.';
	} else if (data.username.length < 3) {
		return 'Username must be at least three characters long.';
	}

	await db
		.collection('users')
		.where('username', '==', data.username)
		.get()
		.then(async (querySnapshot) => {
			if (querySnapshot.size > 0) {
				error = 'Username already exists.';
			} else {
				await createUserWithEmailAndPassword(auth, data.email, data.password)
					.then(async (userCredentials) => {
						await db
							.collection('users')
							.doc(userCredentials.user.uid)
							.set({
								name: data.name,
								username: data.username,
								name_search: data.name.replace(/ /g, '').toLowerCase(),
								username_search: data.username.replace(/ /g, '').toLowerCase(),
								imageUrl: '',
								posts: [],
								following: [],
								followers: [],
								description: '',
								createdAt: firebase.firestore.FieldValue.serverTimestamp(),
								updatedAt: firebase.firestore.FieldValue.serverTimestamp(),
							});
						updateProfile(userCredentials.user, { displayName: data.username });

						localStorage.setItem('authUser', JSON.stringify(userCredentials.user));
						store.dispatch(setAuthenticated(userCredentials.user.uid));
					})
					.catch((err) => {
						switch (err.code) {
							case 'auth/email-already-in-use':
								error = 'Email already in use.';
								break;
							case 'auth/invalid-display-name':
								error = 'Username cannot be empty.';
								break;
							case 'auth/invalid-email':
								error = "Email isn't in a valid format.";
								break;
							case 'auth/weak-password':
								error = 'Password must be at least six characters.';
								break;
							default:
								error = 'Something went wrong.';
								break;
						}
					});
			}
		});

	console.log(error);
	return error;
};

export default Register;
