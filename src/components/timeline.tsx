import {
    collection,
    getDocs,
    limit,
    onSnapshot,
    orderBy,
    query,
  } from "firebase/firestore";
import { useEffect, useState } from "react";
import { styled } from "styled-components";
import { db } from "../firebase";
import Tweet from "./tweet";
import { Unsubscribe } from "firebase/auth";

export interface ITweet {
  id: string;
  photo?: string;
  tweet: string;
  userId: string;
  username: string;
  createdAt: number;
}
//photo 뒤에 ?이 붙은건 required가 아니라는 뜻.

const Wrapper = styled.div`
  display: flex;
  gap: 10px;
  flex-direction: column;
`;

export default function Timeline() {
  const [tweets, setTweet] = useState<ITweet[]>([]);
  
  let unsubscribe: Unsubscribe | null = null;
  const fetchTweets = async () => {
    const tweetsQuery = query(
      collection(db, "tweets"),
      orderBy("createdAt", "desc"),
      limit(25)
    );//onSnapshot함수는 실시간으로 이벤트를 콜백해준다. 하지만 사용시 비용이 지불되기 때문에
    //우리는 사용하지 않을때 unsubscribe할 것이다. 이용자가 이 timeline 컴포넌트를 마운트 하지 않고 있을 때는, 즉
    //이 화면을 보고 있지 않고 profile이라던지 login화면을 마운트하고 있는 상태에서는
    //unsubscribe하는 것이 당연히 절약적이겠다.
    //또한 limit은 만약 수백만개의 tweet이 존재할 때 그것들을 전부 query하지 않고
    //처음 25개만 하도록 설정하는 것. 여러모로 현명한 장치이다.
    
    unsubscribe = await onSnapshot(tweetsQuery, (snapshot) => {
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
      setTweet(tweets);
    });
  };
  //하단의 방식은 문서를 한번만 가져오고 상단의 방식은 쿼리에 리스너를 추가하여
    //실시간으로 편집,삭제,추가 등의 변화를 감지하여 setTweet에 적용시켜준다.

    /*const fetchTweets = async () => {
    const tweetsQuery = query(
      collection(db, "tweets"),
      orderBy("createdAt", "desc")
    );

    const snapshot = await getDocs(tweetsQuery);
    
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
    setTweet(tweets);
  };*/
   

  useEffect(() => {
    fetchTweets();
    return () => {
        unsubscribe && unsubscribe();
      };
  }, []);
  //useEffect의 hook인 clean up 함수이다.
  // a && b -> 여기서 쓰인 것은 삼항연산인데 a가 참이면 b로 넘어간다.
  //즉 unsubscribe가 null이 아니면 오른쪽 unsubscribe함수를 실행한다.
  return (
    <Wrapper>
      {tweets.map((tweet) => (
        <Tweet key={tweet.id} {...tweet} />
      ))}
    </Wrapper>
  );
}