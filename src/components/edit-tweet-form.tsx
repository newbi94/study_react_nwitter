import { styled } from "styled-components";
import { ITweet } from "./timeline";
import { auth, db, storage } from "../firebase";
import { doc, updateDoc} from "firebase/firestore";
import {
  deleteObject,
  getDownloadURL,
  ref,
  uploadBytes,
} from "firebase/storage";
import { useState } from "react";


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
const SubmitBtn = styled.button`
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

export default function EditTweetForm ({ tweet, id }: ITweet) {

const [isLoading, setIsLoading] = useState(false);  
const [editText, setEditText] = useState("");
const [editFile, setEditFile] = useState<File | null>(null);

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

  const onSubmit = async (e) => {
    e.preventDefault();
    const user = auth.currentUser;
    if (!user || isLoading || editText.length > 180)
      return;
     
    try {
      setIsLoading(true);
      const tweetRef = doc(db, "tweets", id);
      
      if(editText){
      await updateDoc(tweetRef, {tweet: editText,});
    }
      if (editFile) {
      const photoRef = ref(
        storage,`tweets/${user.uid}/${id}`)
        await deleteObject(photoRef)
      
      const result = await uploadBytes(photoRef, editFile);
      const url = await getDownloadURL(result.ref);
      
      await updateDoc(tweetRef, {photo: url,});
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
    <Form onSubmit={onSubmit}>
    <TextArea
            maxLength={180}
            defaultValue={tweet}
            onChange={onChange}
            id={id}
          />
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
        value={isLoading ? "editing..." : "Done"}
      />
        </Form>
  )
}

