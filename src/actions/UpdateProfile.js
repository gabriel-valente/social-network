import firebase, { db, storage } from 'firebase';
import ImageHandling from './ImageHandling';
import { nanoid } from 'nanoid';
import { getAuth, updateProfile } from 'firebase/auth';
import store from 'redux/store';
import { updateUser } from 'redux/actions/userAction';

const UpdateProfile = (props) => {
	const { data, setProgress } = props;
	if (data.name.length < 3) {
		return 'Enter your name.';
	} else if (data.username.length < 3) {
		return 'Username must be at least three charactes.';
	}

	db.collection('users')
		.where('username', '==', data.username)
		.get()
		.then((querySnapshot) => {
			const docSnapshots = querySnapshot.docs;

			for (var i in docSnapshots) {
				const uid = docSnapshots[i].id;

				if (uid !== data.uid) {
					return 'Username already exists.';
				}
			}

			if (data.imageUrl.includes('blob:')) {
				data.image = ImageHandling('profile', data.imageUrl);

				const imageName = nanoid(16) + '.jpeg'; // generate random string (16 characters - 1000uid/sec = ~5 million years to have a 1% probability of collision)
				// Set path and image name
				const uploadTask = storage.ref(`profile/${imageName}`).put(data.image);

				uploadTask.on(
					'state_changed', // Update status of upload
					(snapshot) => {
						const progress = Math.round((snapshot.bytesTransferred / snapshot.totalBytes) * 100);
						setProgress(progress);
					},
					(error) => {
						// Error on upload
						console.log(error);
					},
					() => {
						storage
							.ref(`profile/${imageName}`)
							.getDownloadURL()
							.then((url) => {
								const currentUser = getAuth().currentUser; // Get current user
								setProgress(0); // Reset progress
								console.log(currentUser);
								// Check if the file is in the app database and not anywhere else
								if (
									currentUser.photoURL !== null &&
									currentUser.photoURL.includes(
										'https://firebasestorage.googleapis.com/v0/b/socialnetwork-73196.appspot.com/o/profile%2F'
									)
								) {
									// Delete old image
									storage.refFromURL(currentUser.photoURL).delete().then();
								}

								// Update profile
								updateProfile(currentUser, {
									displayName: data.username,
									photoURL: url,
								}).then(() => localStorage.setItem('authUser', JSON.stringify(getAuth().currentUser)));

								const updateData = {
									name: data.name,
									username: data.username,
									name_search: data.name.replace(/ /g, '').toLowerCase(),
									username_search: data.username.replace(/ /g, '').toLowerCase(),
									imageUrl: url,
									description: data.description,
									updatedAt: firebase.firestore.FieldValue.serverTimestamp(),
								};

								store.dispatch(updateUser({ uid: getAuth().currentUser.uid, ...data }));
								db.collection('users')
									.doc(getAuth().currentUser.uid)
									.update(updateData)
									.then(() => true);
							});
					}
				);
				return true;
			} else {
				// Update profile
				updateProfile(getAuth().currentUser, {
					displayName: data.username,
				}).then(() => localStorage.setItem('authUser', JSON.stringify(getAuth().currentUser)));

				const updateData = {
					name: data.name,
					username: data.username,
					description: data.description,
					updatedAt: firebase.firestore.FieldValue.serverTimestamp(),
				};

				store.dispatch(updateUser({ uid: getAuth().currentUser.uid, ...data }));
				db.collection('users')
					.doc(getAuth().currentUser.uid)
					.update(updateData)
					.then(() => true);
			}
		});
};

export default UpdateProfile;
