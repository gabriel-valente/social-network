import ImageHandling from './ImageHandling';
import firebase, { db, storage } from 'firebase';
import { nanoid } from 'nanoid';
import store from 'redux/store';
import { addPosts } from 'redux/actions/postAction';
import { addPostToUser } from 'redux/actions/userAction';

const UploadPost = (props) => {
	const imageName = nanoid(16); // generate random string (16 characters - 1000uid/sec = ~5 million years to have a 1% probability of collision)
	const user = JSON.parse(localStorage.getItem('authUser'));
	const { data, setProgress, setUploadState } = props;

	data.image = ImageHandling('post', data.imageUrl);

	// Set path and image name
	const uploadTask = storage.ref(`post/${imageName}.jpeg`).put(data.image);

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
			// Upload completed
			storage
				.ref(`post/${imageName}.jpeg`)
				.getDownloadURL()
				.then((url) => {
					const pst = {
						id: imageName + '_' + user.uid,
						imageUrl: url,
						caption: data.caption,
						timestamp: new Date(),
						likes: [],
					};

					const temp = {
						username: user.displayName,
						posts: firebase.firestore.FieldValue.arrayUnion(pst),
					};

					db.collection('posts')
						.doc(user.uid)
						.set(temp, { merge: true })
						.then(() => {
							pst.userId = user.uid;
							store.dispatch(addPosts({ posts: [pst] }));

							db.collection('users')
								.doc(user.uid)
								.update({ posts: firebase.firestore.FieldValue.arrayUnion(pst.id) })
								.then(() => {
									store.dispatch(addPostToUser({ uid: pst.userId, post: [pst.id] }));
									setUploadState('success');
									setProgress(0); // Reset progress
								})
								.catch((error) => {
									setUploadState('error: ' + error.message);
									console.log(error);
								});
						});
				});
		}
	);
};

export default UploadPost;
