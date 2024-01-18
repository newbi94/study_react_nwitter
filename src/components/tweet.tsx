import { styled } from "styled-components";
import { ITweet } from "./timeline";
import { auth, db, storage } from "../firebase";
import { deleteDoc, doc, updateDoc} from "firebase/firestore";
import { deleteObject, ref } from "firebase/storage";
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

const SubmitButton = styled.button`
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


export default function Tweet({ username, photo, tweet, userId, id }: ITweet) {
  const [isLoading, setIsLoading] = useState(false);
  const [edit, setEdit] = useState(false);
  const [editText, setEditText] = useState("");
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

  const onEdit = () => {
    setEdit(true)
  };


  const onSubmit = async (e) => {
    e.preventDefault();
    const user = auth.currentUser;
    if (!user || isLoading || editText === "" || editText.length > 180)
      return;

    try {
      setIsLoading(true);
      const tweetRef = doc(db, "tweets", id);
      await updateDoc(tweetRef, {
        tweet: editText,
      });
      setEditText("")
      setEdit(false)
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
        ) : userId&&edit? ( <SubmitButton onClick={onSubmit}>Ok</SubmitButton> ) : null}
      </Column>
      <Column>{photo ? <Photo src={photo} /> : null}</Column>
    </Wrapper>
  );
}