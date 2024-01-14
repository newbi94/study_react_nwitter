import { createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import { useState } from "react";
import { auth } from "../firebase";
import { Link, useNavigate } from "react-router-dom";
import { FirebaseError } from "firebase/app";
import {
  Form,
  Error,
  Input,
  Switcher,
  Title,
  Wrapper,
} from "../components/auth-components";
import GithubButton from "../components/github-btn";

export default function CreateAccount() {
  
  const navigate = useNavigate();

  const [isLoading, setLoading] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  
  const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    
    const {
      target: { name, value },
    } = e;
    if (name === "name") {
      setName(value);
    } else if (name === "email") {
      setEmail(value);
    } else if (name === "password") {
      setPassword(value);
    }
  };
  
  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    if (isLoading || name === "" || email === "" || password === "") return;
    //로딩중이거나, 이름,이메일,비밀번호중 하나라도 작성하지 않으면 즉시 함수 종료.
    try {
      setLoading(true);
      //작성완료시 로딩상태로 바뀌어 submit버튼도 loading...으로 바뀐다.
      const credentials = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );//user의 정보를 저장하고 로그인시켜주는 단계
      console.log(credentials.user);
      await updateProfile(credentials.user, {
        displayName: name,
      });//이름도 입력값으로 받았으니 displayName에 이름을 부여해준다
      navigate("/");//다시 홈화면으로 보내주는 코드
    } catch (e) {
      if (e instanceof FirebaseError) {
        setError(e.message);
      };// " e instanceof FirebaseError " 도움말 참조할 것 암튼 firebase의 에러종류일시, 라는 의미인듯
      // user생성이 되지 않았을경우 실행될 구문을 입력하는 위치
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <Wrapper>
      <Title>Join 𝕏</Title>
      <Form onSubmit={onSubmit}>
        <Input
          onChange={onChange}
          name="name"
          value={name}
          placeholder="Name"
          type="text"
          required
        />
        <Input
          onChange={onChange}
          name="email"
          value={email}
          placeholder="Email"
          type="email"
          required
        />
        <Input
          onChange={onChange}
          name="password"
          value={password}
          placeholder="Password"
          type="password"
          required
        />
        <Input
          type="submit"
          value={isLoading ? "Loading..." : "Create Account"}
        />
      </Form>
      {error !== "" ? <Error>{error}</Error> : null}
      <Switcher>
        Already have an account? <Link to="/login">Log in &rarr;</Link>
      </Switcher>
      <GithubButton />
    </Wrapper>
  );
  }  //  " &rarr; " -> 오른쪽화살표 