import { styled } from "styled-components";
import { auth, db, storage } from "../firebase";
import { useEffect, useState } from "react";
import { getDownloadURL, ref, uploadBytes,} from "firebase/storage";
import { updateProfile } from "firebase/auth";
import {
  collection,
  getDocs,
  limit,
  orderBy,
  query,
  where,
  doc,
  updateDoc,
} from "firebase/firestore";
import { ITweet } from "../components/timeline";
import Tweet from "../components/tweet";


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
const TextArea = styled.textarea`
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
`;
export default function Profile({ userId }: ITweet) {
  const user = auth.currentUser;
  
  const [avatar, setAvatar] = useState(user?.photoURL);
  const [tweets, setTweets] = useState<ITweet[]>([]);
  const [isEdit, setIsEdit] = useState(false);
  const [editName, setEditName] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  
  const onClick = () => {
    setIsEdit(true);
  }

  const onChange = (e : React.ChangeEvent<HTMLTextAreaElement>) => {
    setEditName(e.target.value)
    console.log(editName)
  }



  const onAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
   
    const { files } = e.target;
   
    if (!user) return;
   
    if (files && files.length === 1) {
      const file = files[0];
      
      const locationRef = ref(storage, `avatars/${user?.uid}`);
      //이미 올린 사진이 있을 때, 다시 프로필을 누르고 사진을 선택하면 덮어쓰기가 된다.
      //원래 user.uid뒤에 id(=doc.id)로된 이미지 파일까지를 ref로 잡던데..
      //-> 1개의 계정당 트윗은 여러개, 각 트윗당 사진은 1개씩이기 때문에
      //각 트윗당 (=각각의 doc이 존재,user.uid) 사진 (id(doc.id))이 필요하지만
      //프로필은 1개의 계정당 1개라서 avatars 폴더 내부에 user.uid로 된 이미지파일을 바로 저장한다.
      //
      const result = await uploadBytes(locationRef, file);
      const avatarUrl = await getDownloadURL(result.ref);
      setAvatar(avatarUrl);
      await updateProfile(user, {
        photoURL: avatarUrl,
      });
    }
  };

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const user = auth.currentUser;
    
    console.log(user)
    if (!user || isLoading || editName=="" || editName.length > 20)
      return;

    try {
      setIsLoading(true);
      /*const tweetQuery = query(
        collection(db, "tweets"),
        where("userId", "==", user?.uid)
      );
      const snapshot = await getDocs(tweetQuery);
    const editDocName = snapshot.docs.map((doc) => {
      const { tweet, createdAt, userId, username, photo } = doc.data();
      return {
        tweet,
        createdAt,
        userId,
        username : editName,
        photo,
        id: doc.id,
      };
    });
     시도중 */
      if(editName){
        await updateProfile(user, {
          displayName: editName,
          })
       
     //await updateDoc(tweetRef, {username:editName});
    }
  setIsEdit(false)
  setEditName("");
}catch (e) {
  console.log(e);
} finally {
  
  setIsLoading(false)
}
};

  const fetchTweets = async () => {
    const tweetQuery = query(
      collection(db, "tweets"),
      where("userId", "==", user?.uid),
      //where은 필터의 역할을 하는데 firebase는 때때로 너무 flexible해서 이와 같은 필터를 사용할 때,
      //firebase에게 이러한 필터를 사용할 것이라고 알려줘야 한다.
      //때문에 최초 where을 이용해서 필터를 작성하고 실행했을 때, 에러코드에 나오는 링크로 들어가
      //필터를 등록하면 사용할 수 있게된다.
      orderBy("createdAt", "desc"),
      limit(25)
    );
  
    const snapshot = await getDocs(tweetQuery);
    const tweets = snapshot.docs.map((doc) => {
      const { tweet, createdAt, userId, username, photo } = doc.data();
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
  };
  useEffect(() => {
    fetchTweets();
  }, []);
  //timeline.tsx에서 사용했던 방식과 같은 방식이지만 onSnapshot 메소드로 realtime 방식은 사용하지 않는다.

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
        <Form onSubmit={onSubmit}>
          <TextArea
            defaultValue={user?.displayName}
            onChange={onChange}
            />
          <SubmitBtn
        type="submit"
        value={isLoading ? "changing..." : "Done"}
      />
        </Form>
        ) :
          (
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