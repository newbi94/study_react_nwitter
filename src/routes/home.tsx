import { styled } from "styled-components";
import PostTweetForm from "../components/post-tweet-form";

import Timeline from "../components/timeline";

const Wrapper = styled.div`
  display: grid;
  gap: 50px;
  overflow-y: scroll;
  grid-template-rows: 1fr 5fr;
`;
//overflow-y: scroll; -> 트윗 작성 양식은 그대로 고정된 상태로
//트윗들을 스크롤할 수 있게 해준다.


export default function Home() {
  return (
    <Wrapper>
      <PostTweetForm />
      <Timeline />
    </Wrapper>
  );
}