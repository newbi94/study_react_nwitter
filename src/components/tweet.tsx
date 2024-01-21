import { styled } from "styled-components";
import { ITweet } from "./timeline";
import { auth, db, storage } from "../firebase";
import { deleteDoc, doc, updateDoc} from "firebase/firestore";
import {
  deleteObject,
  getDownloadURL,
  ref,
  uploadBytes,
} from "firebase/storage";
import { useState } from "react";

const Wrapper = styled.div`
  display: grid;
  grid-template-columns: 3fr 1fr;
  padding: 20px;
  border: 1px solid rgba(255, 255, 255, 0.5);
  border-radius: 15px;
`;

const Column = styled.div`
  &:last-child {
    place-self: end;
  }
`;

const Photo = styled.img`
  width: 100px;
  height: 100px;
  border-radius: 15px;
`;

const Username = styled.span`
  font-weight: 600;
  font-size: 15px;
`;

const Payload = styled.p`
  margin: 10px 0px;
  font-size: 18px;
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
//styled.textarea가 아니라 styled.div로 썼다가 한참을 헤맸다
//div로 쓰면 edit버튼을 눌러서 편집을 하려해도 글이 써지지 않는다.
const DeleteButton = styled.button`
  background-color: tomato;
  color: white;
  font-weight: 600;
  border: 0;
  font-size: 12px;
  padding: 5px 10px;
  text-transform: uppercase;
  border-radius: 5px;
  cursor: pointer;
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

const AttachFileButton = styled.label`
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

const AttachFileInput = styled.input`
  display: none;
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 10px;
`;

export default function Tweet({ username, photo, tweet, userId, id }: ITweet) {
  const [isLoading, setIsLoading] = useState(false);
  const [edit, setEdit] = useState(false);
  const [editText, setEditText] = useState("");
  const [editFile, setEditFile] = useState<File | null>(null);
  
  const user = auth.currentUser;
  
  const onDelete = async () => {
    const ok = confirm("Are you sure you want to delete this tweet?");
    if (!ok || user?.uid !== userId) return;
    try {
      await deleteDoc(doc(db, "tweets", id));
      if (photo) {
        const photoRef = ref(storage, `tweets/${user.uid}/${id}`);
        await deleteObject(photoRef);
      }
    } catch (e) {
      console.log(e);
    } finally {
      //
    }
  };

  const onChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setEditText(e.target.value);
    console.log(e.target.value)
  };

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { files } = e.target;
    if (files && files.length === 1) {
      setEditFile(files[0]);
    }
  };

  const onEdit = () => {
    setEdit(true)
    console.log(editText)
    console.log(editFile)
  };


  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const user = auth.currentUser;
    if (!user || isLoading || editText.length > 180)
      return;
    //if 항목에서 editText ===""를 제거해 편집버튼을 눌렀다가 그냥 ok를 누르면
    //원래상태 그대로 트윗되어있는 것으로 만들었다. defaultvalue설정이 있어서 가능하다(?).

    try {
      setIsLoading(true);
      const tweetRef = doc(db, "tweets", id);
      //tweetRef는 database내부에 tweets콜렉션 안에 id(=doc.id)로된 doc을 뜻한다.
      //여기서 db는 firebase.ts 에서 가져온 firestore다.
      if(editText){
        //edit버튼을 누르고 글을 지우거나 추가하거나 하는 onChange이벤트가 발생하면 editText값도 바뀌므로 실행된다.
      await updateDoc(tweetRef, {tweet: editText});
      //바뀐 editText로 tweetRef에 있는 tweet값을 수정한다. 따라서 글 내용도 바뀐다.
    }
       if (editFile) {
        //edit버튼을 누르고 change photo버튼을 눌러 사진을 선택해서 editFile에 file이 담기면 실행된다.
      const photoRef = ref(storage,`tweets/${user.uid}/${id}`)
        //photoRef는 storage내부에 tweets콜렉션 안에 user.uid로 된 doc에 id로 된 이미지파일을 뜻한다
        //db와 비슷하게 storage는 firebase.ts에서 가져온 storage다.
        await deleteObject(photoRef)
        //그것을 지우고
      const result = await uploadBytes(photoRef, editFile);
        //photoRef에 editFile을 업로드한다 . 즉 지워진 이미지파일의 id와 새로 업로드하는 이미지파일 id가 같다.
        //같아도 상관없는 것이 id= doc.id 인데 doc이라는 것이 1개의 트윗당 1개씩인데 트윗당 사진도 1개이기 때문에
        //id가 겹칠 일이 없다.
      const url = await getDownloadURL(result.ref);
      //방금 새로 올린 이미지파일의 URL주소를 url에 담고
      await updateDoc(tweetRef, {photo: url});
      //doc (X) tweetRef (o)
      //db안에 해당 트윗의 doc안에 photo: url 항목을 추가한다.

      //tweetRef 는 db속 주소, photoRef는 storage속 주소로써 서로 다른 것이다.
      //string 형태 데이터는 database로 , 파일형식의 데이터는 storage로 따로 저장하는 시스템에 따른 것으로 보인다.
      
      //글 편집과 사진 편집에 각각 if문을 추가하여 글만 수정하거나 사진만 수정, 
      //혹은 둘다 수정 아니면 그대로 ok버튼을 누르고 원상태를 유지할 수 있다.

      //사진 편집은 글 편집과 다르게 이미지파일을 지우고 다시 새로운 이미지를 업로드한 후,
      //그 이미지파일에서 URL을 따와서 db내 photo항목을 업데이트 한다.
      //글 편집처럼 이미지파일을 바꿔버리는 코드로 짧게 쓸 수 없나.

      // ???? tweetRef는 doc( ~ )으로 접근하고 photoRef 는 ref( ~ )로 접근하는 이유가 뭔지 모르겠다.
    }
      setEditText("");
      setEdit(false);
      setEditFile(null);
    }catch (e) {
      console.log(e);
    } finally {
      setIsLoading(false);
    }
  };
  return (
    <Wrapper>
      <Column>
        <Username>{username}</Username>
        {edit ? 
          <TextArea
            maxLength={180}
            defaultValue={tweet}
            //value={editText} 에서 defaultValue로 바꿨다 어차피 변하는 값은 아래 onChange로 감지하고 적용해서
            //ok버튼을 통해 onsubmit하면 edit상태가 바뀌어 <Payload>{tweet}</Payload>가 뜬다.
            onChange={onChange}
            id={id}
          /> : <Payload>{tweet}</Payload>}
        {user?.uid === userId ? (
          <DeleteButton onClick={onDelete}>Delete</DeleteButton>
        ) : null}
        {user?.uid === userId&&!edit ? ( 
          <EditButton onClick={onEdit}>Edit</EditButton>
        ) : userId&&edit? ( 
        <Form onSubmit={onSubmit}>
          <AttachFileButton htmlFor="editFile">
        {editFile ? "Photo Changed✅" : "Change Photo"}
      </AttachFileButton>
      <AttachFileInput
        onChange={onFileChange}
        type="file"
        id="editFile"
        accept="image/*"
      />
        <SubmitBtn
        type="submit"
        value={isLoading ? "Posting..." : "Done"}
      />
        </Form> ) : null}
      </Column>
      <Column>{photo ? <Photo src={photo} /> : null}</Column>
    </Wrapper>
  );
}