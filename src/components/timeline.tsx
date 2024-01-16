import { collection, getDocs, orderBy, query } from "firebase/firestore";
import { useEffect, useState } from "react";
import { styled } from "styled-components";
import { db } from "../firebase";
import Tweet from "./tweet";

export interface ITweet {
  id: string;
  photo?: string;
  tweet: string;
  userId: string;
  username: string;
  createdAt: number;
}
//photo 뒤에 ?이 붙은건 required가 아니라는 뜻.

const Wrapper = styled.div``;

export default function Timeline() {
  const [tweets, setTweet] = useState<ITweet[]>([]);
  const fetchTweets = async () => {
    const tweetsQuery = query(
      collection(db, "tweets"),
      orderBy("createdAt", "desc")
    );
    //생성날짜 내림차순으로 정리해서 tweetQuery에 담고

    const spanshot = await getDocs(tweetsQuery);
    //정보 덩어리를 가져와서
    const tweets = spanshot.docs.map((doc) => {
      const { tweet, createdAt, userId, username, photo } = doc.data();
      return {
        tweet,
        createdAt,
        userId,
        username,
        photo,
        id: doc.id,
      };
    });//getDocs한 tweetQuery는 여러 doc을 가지고 있는데 그 것을 한묶음으로 setTweet에
    //넣어서 사용할 수 없으니, 결국 map으로 펼쳐 doc객체 하나씩 setTweet에 담아주는 코딩인거 같은데
    //왜 굳이 doc.data는 이미 userid:~ , createdAt: ~ , 이런식으로 정리된 객체인데 string화 되어있는 것도 아니고
    //다시 const { ~ } = doc.data() return { ~ } 해야하는지 이부분이 이해가 안되고 있다.
    
    //id는 { database {collection {document }} } 로 구성되어 있는
    //firestore의 database구조에서 맨끝 doc이 아니라 collection쪽에
    //써있는 것이 id기 때문에 id: doc.id로 써준다(?)
    setTweet(tweets);
  };
  
 /*  WHY CANT WHY CANT WHY CANT WHY CANT WHY CANT WHY CANT
 
 const spanshot = await getDocs(tweetsQuery);
  const tweets = spanshot.docs.map( (doc) =>  
                setTweet(doc) )
};
    WHY CANT WHY CANT WHY CANT WHY CANT WHY CANT WHY CANT */

  useEffect(() => {
    fetchTweets();
  }, []);
  return (
    <Wrapper>
      {tweets.map((tweet) => (
        <Tweet key={tweet.id} {...tweet} />
      ))}
    </Wrapper>
  );
}