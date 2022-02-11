import { db } from 'firebase';

const GetProfile = async (profile) => {
  var temp = {
    uid: '',
    imageUrl: '',
    name: '',
    username: '',
    description: '',
    followers: [],
    following: [],
    posts: [],
  };
  const doc1 = await db.collection('users').doc(profile).get();
  if (doc1.exists) {
    const data = doc1.data();
    temp = {
      uid: profile,
      imageUrl: data.imageUrl,
      name: data.name,
      username: data.username,
      description: data.description,
      followers: data.followers,
      following: data.following,
      posts: data.posts,
    };
  }

  return temp;
};

export default GetProfile;
