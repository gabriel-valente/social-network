import firebase, { storage, db } from 'firebase';
import { getAuth, updateProfile } from 'firebase/auth';
import { nanoid } from 'nanoid';
import { updateUser } from 'redux/actions/userAction';
import store from 'redux/store';

const UploadImage = (props) => {
	const imageName = nanoid(16) + '.jpeg'; // generate random string (16 characters - 1000uid/sec = ~5 million years to have a 1% probability of collision)
	const { path, data, setProgress, setUploadState } = props;

	// Set path and image name
	const uploadTask = storage.ref(`${path}/${imageName}`).put(data.image);

	uploadTask.on(
		'state_changed', // Update status of upload
		(snapshot) => {
			const progress = Math.round(
				(snapshot.bytesTransferred / snapshot.totalBytes) * 100
			);
			setProgress(progress);
		},
		(error) => {
			// Error on upload
			console.log(error);
		},
		() => {
			// Upload completed
			storage
				.ref(`${path}/${imageName}`)
				.getDownloadURL()
				.then((url) => {
					if (path === 'profile') {
						const currentUser = getAuth().currentUser; // Get current user
						setProgress(0); // Reset progress

						// Check if the file is in the app database and not anywhere else
						if (
							currentUser.photoURL.includes(
								'https://firebasestorage.googleapis.com/v0/b/socialnetwork-73196.appspot.com/o/profile%2F'
							)
						) {
							// Delete old image
							storage
								.refFromURL(currentUser.photoURL)
								.delete()
								.then(() => {
									console.log('Old image deleted');
								})
								.catch((error) => {
									console.log(error);
								});
						}

						// Update profile
						updateProfile(currentUser, {
							displayName: data.username,
							photoURL: url,
						}).then(() => {
							localStorage.setItem('authUser', JSON.stringify(getAuth().currentUser));
							store.dispatch(updateUser({ uid: getAuth().currentUser.uid, ...data }));
						});

						const updateData = {
							name: data.name,
							username: data.username,
							imageUrl: url,
							description: data.description,
							updatedAt: firebase.firestore.FieldValue.serverTimestamp(),
						};

						db.collection('users').doc(currentUser.uid).update(updateData);
					} else if (path === 'post') {
						// Add post to the database
						db.collection('posts')
							.add({
								userId: data.uid,
								username: data.username,
								imageUrl: url,
								caption: data.caption,
								timestamp: firebase.firestore.FieldValue.serverTimestamp(),
								likes: [],
							})
							.then((res) => {
								db.collection('users')
									.doc(data.uid)
									.update({ posts: firebase.firestore.FieldValue.arrayUnion(res.id) })
									.then(() => {
										setUploadState('success');
										setProgress(0); // Reset progress
									})
									.catch((error) => {
										setUploadState('error: ' + error.message);
										console.log(error);
									});
							})
							.catch((error) => {
								setUploadState('error: ' + error.message);
								console.log(error);
							});
					}
				});
		}
	);
};

export default UploadImage;
