import { Navigate } from "react-router-dom";
import { auth } from "../firebase";

export default function ProtectedRoute({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = auth.currentUser;
  //currentUser 는 User || null 을 결과값으로 주는 로그인 여부 확인 코드이다.
  if (user === null) {
    return <Navigate to="/login" />;
  }//로그인 상태가 아닐시 로그인 페이지로 되돌려 보내는 코드.
  return children;
};//로그인 상태라면 <ProtectedRoute>로 감싼 컴포넌트인 <Layout />가 렌더링 될거고
//당연히 그 children 컴포넌트인 home과 profile중에 home이 기본으로 렌더링된다.
//그 상태로 url에 profile을 추가 입력하면 layout 과 profile이 렌더링 되는 것.

//위 fucntion ~부분에서 ProtectedRoute는 감싼 컴포넌트를 인자로 받아온다.