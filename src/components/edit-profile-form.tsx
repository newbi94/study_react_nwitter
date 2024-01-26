import { styled } from "styled-components";
import { auth, db } from "../firebase";
import { useState } from "react";
import { updateProfile } from "firebase/auth";
import {
  collection,
  getDocs,
  query,
  where,
  updateDoc,
} from "firebase/firestore";

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

export default function EditProfileForm ({ setIsEdit }) {
 
  const [editName, setEditName] = useState("");  
  const [isLoading, setIsLoading] = useState(false);

  const user = auth.currentUser;

  const onChange = (e : React.ChangeEvent<HTMLTextAreaElement>) => {
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
      console.log("username updated");
  };
  
      return (
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
      )
}