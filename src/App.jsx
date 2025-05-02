import { createBrowserRouter, RouterProvider,Outlet } from "react-router-dom";
import Navbar from './Components/Navbar';
import Login from './Components/Login';
import About from './Components/About';
import Contact from './Components/Contact';
import Home from './Components/Home';
import ErrorPage from './Components/ErrorPage';
import './App.css';
import Layout from './Components/Layout.jsx';
import StudentPage from './Components/StudentPage.jsx';
import FacultyPage from './Components/FacultyPage.jsx';
import HigherAuthorityPage from './Components/HigherAuthorityPage.jsx';
// const router = createBrowserRouter([
//   {
//     path: "/",
//     element: (
//       <div>
//         <Navbar />
//         <Login />
//       </div>
//     ),
//   },
//   {
//     path: "/about",
//     element: (
//       <div>
//         <Navbar />
//         <About />
//       </div>
//     ),
//   },
//   {
//     path: "/contact",
//     element: (
//       <div>
//         <Navbar />
//         <Contact />
//       </div>
//     ),
//   },
//   {
//     path: "/home",
//     element: (
//       <div>
//         <Navbar />
//         <Home />
//       </div>
//     ),
//   },
//   {
//     path: "*",
//     element: <ErrorPage />
//   }
// ]);

const router = createBrowserRouter([
  {
    path: "/",
    element: <Layout />,
    errorElement: <ErrorPage />,
    children: [
      { index: true, element: <Login /> },
      { path: "home", element: <Home />,
        children:[
          { path: "student", element: <StudentPage /> },
          { path: "faculty", element: <FacultyPage /> },
          { path: "higher-authority", element: <HigherAuthorityPage /> }
        ]
       },
      { path: "about", element: <About /> },
      { path: "contact", element: <Contact />},
    ],
  },
  {
    path: "*",
    element: <ErrorPage />
  }
]);
function App() {
  return <RouterProvider router={router} />;
}

export default App;
