import { addDoc, collection, updateDoc } from "firebase/firestore";
import { useState } from "react";
import { styled } from "styled-components";
import { auth, db, storage } from "../firebase";
import { getDownloadURL, ref, uploadBytes } from "firebase/storage";

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 10px;
`;

const TextArea = styled.textarea`
  border: 2px solid white;
  padding: 20px;
  border-radius: 20px;
  font-size: 16px;
  color: white;
  background-color: black;
  width: 100%;
  resize: none;
  font-family: system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto,
    Oxygen, Ubuntu, Cantarell, "Open Sans", "Helvetica Neue", sans-serif;
  &::placeholder {
    font-size: 16px;
  }
  &:focus {
    outline: none;
    border-color: #1d9bf0;
  }
`;
//resize: none; -> TextArea는 기본적으로 텍스트창의 넓이 조절이 마우스로 가능한데 그 기능을 없애준 것이다.
//&::placeholder { ~ } -> placeholder의 폰트 사이즈를 바꾸는 방법
//&:focus { ~ } -> TextArea를 활성화하여 글을 쓰려할 때, 스타일링하는 것이다.

const AttachFileButton = styled.label`
  padding: 10px 0px;
  color: #1d9bf0;
  text-align: center;
  border-radius: 20px;
  border: 1px solid #1d9bf0;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
`;

const AttachFileInput = styled.input`
  display: none;
`;
//아래에서 설명했듯 input창은 예쁘게 스타일링하기가 어렵다고 한다.
//때문에 버튼을 만들어 htmlFor로 인풋창을 연결하고 인풋창은 보이지 않게 설정하여
//버튼을 꾸며주는 방법을 택한 것.
const SubmitBtn = styled.input`
  background-color: #1d9bf0;
  color: white;
  border: none;
  padding: 10px 0px;
  border-radius: 20px;
  font-size: 16px;
  cursor: pointer;
  &:hover,
  &:active {
    opacity: 0.9;
  }
`;//&:hover, &:active { ~ } 마우스를 SubmitBtn위에 가져다 대거나 (hover),
//활성화 시킬 때 (active) 불투명도(opacity)를 0.9로 한다.

export default function PostTweetForm() {
  
  const [isLoading, setLoading] = useState(false);
  const [tweet, setTweet] = useState("");
  const [file, setFile] = useState<File | null>(null);
  
  const onChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setTweet(e.target.value);
  };
  
  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { files } = e.target;
    if (files && files.length === 1) {
      setFile(files[0]);
    }
  };
  //때떄로 files에 한 배열만 들어가야 하는데 두개 이상이 들어갈 때가 있어서
  //{ }로 감싸준거고 그아래 length로 배열이 한개만 있을 때 setFile하게끔 한다.
  //length 이전에 files는 files의 존재 유무확인이다. null이 아니라면 ok라는 것.

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const user = auth.currentUser;
    //유저의 로그인 여부와 유저 정보를 불러와서 아래에서 써먹는다.
    if (!user || isLoading || tweet === "" || tweet.length > 180) return;
    //위와 같은 조건에서는 break.
    try {
      setLoading(true);
      const doc = await addDoc(collection(db, "tweets"), {
        //addDoc함수는 문서를 생성하는 함수라서 promise로 반환한다.
        //따라서 비동기로 돌리기 때문에 async await이 따라오는 것으로 추정
        //addDoc -> 문서 생성, deleteDoc -> 문서 삭제, getDocs -> 문서 가져오기

        tweet,
        createdAt: Date.now(),
        username: user.displayName || "Anonymous",
        userId: user.uid,
      });  
      if (file) {
        const locationRef = ref(
          storage,
          `tweets/${user.uid}/${doc.id}`
        );
        const result = await uploadBytes(locationRef, file);
        const url = await getDownloadURL(result.ref);
        await updateDoc(doc, {
          photo: url,
        });
      }
      setTweet("");
      setFile(null);
    } catch (e) {
      console.log(e);
    } finally {
      setLoading(false);
    }
  };// addDoc( collection(x, y)), { z } ) -> Document생성하는데 x => firestore의 인스턴스가 필요
  //firebase.ts에서 export const db = getFirestore(app); 를 이용해 db로 가져옴
  //y-> collection 이름, z-> 저장될 내용들

  return (
    <Form onSubmit={onSubmit}>
      <TextArea
        required
        rows={5}
        maxLength={180}
        onChange={onChange}
        value={tweet}
        placeholder="What is happening?!"
      />
      <AttachFileButton htmlFor="file">
        {file ? "Photo added ✅" : "Add photo"}
      </AttachFileButton>
      <AttachFileInput
        onChange={onFileChange}
        type="file"
        id="file"
        accept="image/*"
      />
      <SubmitBtn
        type="submit"
        value={isLoading ? "Posting..." : "Post Tweet"}
      />
    </Form>
  );
  //htmlFor="file"은 아래 <AttachFileInput> 내에 id="file"로 이어진다.
  //input은 스타일링하기가 어렵기 때문에 <AttachFileButton>에다가 htmlFor로 연결하여
  //<AttachFileButton>을 꾸며주는 거라고 한다.
  //<AttachFileButton>  <AttachFileInput>
}//accept="image/*" -> 이미지파일만 받을 것이고, 파일형식은 어떤 것이든 상관없다.