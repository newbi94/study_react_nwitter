/*import { styled } from "styled-components";
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
  updateDoc,
  onSnapshot,
} from "firebase/firestore";
import { ITweet } from "../components/timeline";
import Tweet from "../components/tweet";



export default function EditProfileForm ({tweet, id, photo, username, displayname  }) {
    const [avatar, setAvatar] = useState(user?.photoURL);
    const [tweets, setTweets] = useState<ITweet[]>([]);  
    const [editName, setEditName] = useState("");  
    
let unsubscribe: Unsubscribe | null = null;
    
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
      };
      
    
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
        console.log("Retrieved username from Firestore:", username);
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

}
*/