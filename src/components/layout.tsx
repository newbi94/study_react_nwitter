import { Outlet } from "react-router-dom";

export default function Layout() {
  return (
    <>
      <h2>layout</h2>
      <Outlet />
    </>
  );
}// <Layout />의 children으로 있는 하위페이지가 <Outlet />자리에 렌더링