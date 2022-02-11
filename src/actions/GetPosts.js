import firebase from 'firebase/compat';
import { db } from 'firebase';

const GetPosts = async (posts = null, position = 0) => {
	const temp = [];

	if (posts !== null) {
		const data = await db
			.collection('posts')
			.orderBy('timestamp', 'desc')
			.where(firebase.firestore.FieldPath.documentId(), 'in', posts)
			.get();

		if (!data.empty) {
			data.forEach((doc) => {
				temp.push({
					id: doc.id,
					...doc.data(),
				});
			});
		}
	} else {
		const data = await db
			.collection('posts')
			.orderBy('timestamp', 'desc')
			.startAfter(position)
			.limit(10)
			.get();

		if (!data.empty) {
			data.forEach((doc) => {
				temp.push({
					id: doc.id,
					...doc.data(),
				});
			});
		}
	}
	return temp;
};

export default GetPosts;
