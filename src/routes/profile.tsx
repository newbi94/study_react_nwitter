import { styled } from "styled-components";
import { auth, db, storage } from "../firebase";
import { useEffect, useState } from "react";
import { getDownloadURL, ref, uploadBytes,} from "firebase/storage";
import { updateProfile } from "firebase/auth";
import {
  collection,
  //getDocs,
  limit,
  orderBy,
  query,
  where,
  //updateDoc,
  onSnapshot,
} from "firebase/firestore";
import { ITweet } from "../components/timeline";
import Tweet from "../components/tweet";
import EditProfileForm from "../components/edit-profile-form"

const Wrapper = styled.div`
  display: flex;
  align-items: center;
  flex-direction: column;
  gap: 20px;
`;
const AvatarUpload = styled.label`
  width: 80px;
  overflow: hidden;
  height: 80px;
  border-radius: 50%;
  background-color: #1d9bf0;
  cursor: pointer;
  display: flex;
  justify-content: center;
  align-items: center;
  svg {
    width: 50px;
  }
`;

const AvatarImg = styled.img`
  width: 100%;
`;
const AvatarInput = styled.input`
  display: none;
`;
const Name = styled.span`
  font-size: 22px;
`;

const Tweets = styled.div`
  display: flex;
  width: 100%;
  flex-direction: column;
  gap: 10px;
`;
const EditButton = styled.button`
  background-color: white;
  color: black;
  font-weight: 600;
  border: 0;
  font-size: 12px;
  padding: 5px 10px;
  text-transform: uppercase;
  border-radius: 5px;
  cursor: pointer;
`;
/* const TextArea = styled.textarea`
  border: 1px solid white;
  padding: 20px;
  border-radius: 20px;
  font-size: 16px;
  color: white;
  background-color: black;
  width: 100%;
  resize: none;
  font-family: system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto,
    Oxygen, Ubuntu, Cantarell, "Open Sans", "Helvetica Neue", sans-serif;

  }
  &:focus {
    outline: none;
    border-color: #1d9bf0;
  }
`
const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 10px;
`;
const SubmitBtn = styled.input`
  background-color: white;
  color: black;
  font-weight: 600;
  border: 0;
  font-size: 12px;
  padding: 5px 10px;
  text-transform: uppercase;
  border-radius: 5px;
  cursor: pointer;
`; */
export default function Profile() {
  const user = auth.currentUser;
  
  const [avatar, setAvatar] = useState(user?.photoURL);
  const [tweets, setTweets] = useState<ITweet[]>([]);
  const [isEdit, setIsEdit] = useState(false);
  //const [editName, setEditName] = useState("");
  //const [isLoading, setIsLoading] = useState(false);
  
  const onAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
   const { files } = e.target;
   if (!user) return;
   if (files && files.length === 1) {
      const file = files[0];
      const locationRef = ref(storage, `avatars/${user?.uid}`);
      const result = await uploadBytes(locationRef, file);
      const avatarUrl = await getDownloadURL(result.ref);
      setAvatar(avatarUrl);
      await updateProfile(user, {
        photoURL: avatarUrl,
      });
    }
  };

   let unsubscribe: Unsubscribe | null = null;

   const onClick = () => {
    setIsEdit(true);
  }

  /*const onChange = (e : React.ChangeEvent<HTMLTextAreaElement>) => {
    setEditName(e.target.value)
    console.log(editName)
  }

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const user = auth.currentUser;
    if (!user || isLoading || editName=="" || editName.length > 20)
      return; 
      try {
      setIsLoading(true);
      if(editName){
        await fetch(editName);
        await updateProfile(user, {
        displayName: editName,
        })
      }
      setIsEdit(false);
      setEditName("");
      }catch (e){
      console.log(e);
      } finally {
      setIsLoading(false)
    }
  };

  const fetch = async (editName) => {
    const user = auth.currentUser;
    if (!user || !editName) {
      return;
    }
    const editQuery = query(
      collection(db, "tweets"),
      where("userId", "==", user.uid)
    );
    const snapshot = await getDocs(editQuery);
    snapshot.docs.forEach(async (doc) => {
      const docRef = doc.ref;
      await updateDoc(docRef, { username: editName });
      });
      console.log("Username updated in Firestore:", editName);
  };  */
  
  const fetchTweets = async () => {
    const tweetsQuery = query(
      collection(db, "tweets"),
      where("userId", "==", user?.uid),
      orderBy("createdAt", "desc"),
      limit(25)
    );

  unsubscribe = await onSnapshot(tweetsQuery, (snapshot) => {
  const tweets = snapshot.docs.map((doc) => {
    const { tweet, createdAt, userId, username, photo } = doc.data();
    console.log("username updated by onSnapshot");
    return {
      tweet,
      createdAt,
      userId,
      username,
      photo,
      id: doc.id,
    };
  });
  setTweets(tweets);
})
};
  useEffect(() => {
    fetchTweets();
    return () => {
       unsubscribe && unsubscribe();
     }
  }, []);

  return (
    <Wrapper>
      <AvatarUpload htmlFor="avatar">
        {avatar ? (
          <AvatarImg src={avatar} />
        ) : (
          <svg
            fill="currentColor"
            viewBox="0 0 20 20"
            xmlns="http://www.w3.org/2000/svg"
            aria-hidden="true"
          >
            <path d="M10 8a3 3 0 100-6 3 3 0 000 6zM3.465 14.493a1.23 1.23 0 00.41 1.412A9.957 9.957 0 0010 18c2.31 0 4.438-.784 6.131-2.1.43-.333.604-.903.408-1.41a7.002 7.002 0 00-13.074.003z" />
          </svg>
        )}
      </AvatarUpload>
      <AvatarInput
        onChange={onAvatarChange}
        id="avatar"
        type="file"
        accept="image/*"
      />
      {isEdit ? ( 
        <EditProfileForm
        setIsEdit={setIsEdit}
        />
        ) : (
          <>
          <Name>{user?.displayName ?? "Anonymous"}</Name>
          <EditButton onClick={onClick}>Edit</EditButton>
          </>
          )}
      <Tweets>
        {tweets.map((tweet) => (
          <Tweet key={tweet.id} {...tweet} />
        ))}
      </Tweets>
    </Wrapper>
  );
}
