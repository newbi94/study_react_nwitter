import { RouterProvider, createBrowserRouter } from "react-router-dom";
import Layout from "./components/layout";
import Home from "./routes/home";
import Profile from "./routes/profile";
import Login from "./routes/login";
import CreateAccount from "./routes/create-account";
import { createGlobalStyle, styled } from "styled-components";
import reset from "styled-reset";
import { useEffect, useState } from "react";
import LoadingScreen from "./components/loading-screen";
import { auth } from "./firebase";
import ProtectedRoute from "./components/protected-route";

const router = createBrowserRouter([
  {
    path: "/",
    element: (
      <ProtectedRoute>
        <Layout />
      </ProtectedRoute>
    ),//<Layout />을 감싸주면 아래 chlidren으로 있는 <Home />, <Profile /> 모두 <ProtectedRoute> 안에 있게된다.

    children: [
      {
        path: "",
        element: <Home />,
      },
      {
        path: "profile",
        element: <Profile />,
      },
    ],
    //children [ ~~  ] 내부에 있는 각 element들은 path가 "/"인 <layout />과 함께 랜더링된다.
    //그 위치가 layout.tsx 안에 <Outlet />위치이다.
  },
  {
    path: "/login",
    element: <Login />,
  },
  {
    path: "/create-account",
    element: <CreateAccount />,
  },
]);
//<Login />과 <CreateAccount />는 children 범위 밖이므로 독립적으로 랜더링된다.

const GlobalStyles = createGlobalStyle`
  ${reset};
  * {
    box-sizing: border-box;
  }
  body {
    background-color: black;
    color:white;
    font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
  }
`;

const Wrapper = styled.div`
  height: 100vh;
  display: flex;
  justify-content: center;
`;

function App() {
  const [isLoading, setLoading] = useState(true);
  
  const init = async () => {
    await auth.authStateReady();
    setLoading(false);
  };//최초 main.tsx에서 App 렌더시 authStateReady -> firebase가 쿠기와 토큰을 읽고 백엔드와 소통해서
  // 로그인 여부를 확인하는 동안 기다린다. 
  
  useEffect(() => {
    init();
  }, []);
  
  return (
    <Wrapper>
      <GlobalStyles />
      {isLoading ? <LoadingScreen /> :
      <RouterProvider router={router} />}
    </Wrapper>
  );//<GlobalStyles />를 적용해 전역에 스타일을 동일하게 맞출 수 있다.
  //일일히 각 컴포넌트에 스타일을 기재하지 않아도 된다.
};

export default App;
