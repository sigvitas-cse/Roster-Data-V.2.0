import { createBrowserRouter } from 'react-router-dom';
import App from '../App.jsx';
import Home from '../pages/Home.jsx';
import AdminDashboard from '../pages/adminDashboard.jsx';
import NewUserLoginPage from '../pages/RegisterPage.jsx';
import EmployeeDashboard from '../pages/EmployeeDashboard.jsx';
import ForgotPassword from '../pages/ForgotPassword.jsx';
import Insights from '../components/EmployeeDashboard/note.jsx';
import Note from '../components/AdminDashBoard/IndivisualComponents/note.jsx';
import Login from '../pages/LoginPage.jsx';
import ExploreData from '../components/Home/ExploreData';
import About from '../components/Home/About';
import PrivacyPolicy from '../components/Home/PrivacyPolicy';
import Contact from '../components/Home/Contact';
import MultipleSearchLogin from '../components/Home/MultipleSearchLogin.jsx';
import BigDataPage from '../components/Home/BigDataPage.jsx';
import ProfileDetail from '../pages/ProfileDetail.jsx';

const router = createBrowserRouter([
  {
    path: '/',
    element: <App />,
    children: [
      {
        path: '',
        element: <Home />,
      },
      {
        path: 'Login',
        element: <Login />,
      },
      {
        path: 'AdminDashboard',
        element: <AdminDashboard />,
      },
      {
        path: 'NewUserLoginPage',
        element: <NewUserLoginPage />,
      },
      {
        path: 'EmployeeDashBoard',
        element: <EmployeeDashboard />,
      },
      {
        path: 'ForgotPassword',
        element: <ForgotPassword />,
      },
      {
        path: 'insights',
        element: <Insights />,
      },
      {
        path: 'note',
        element: <Note />,
      },
      {
        path: 'explore',
        element: <ExploreData/>,
      },
      {
        path: 'about',
        element: <About />,
      },
      {
        path: 'contact',
        element: <Contact />,
      },
      {
        path: 'privacypolicy',
        element: <PrivacyPolicy />,
      },
      {
        path: 'MultipleSearchLogin',
        element: <MultipleSearchLogin />,
      },
      {
        path: 'bigdata',
        element: <BigDataPage />,
      },
      {
        path: 'bigdata/:page',
        element: <BigDataPage />,
      },
      {
        path: 'bigdata/:searchQuery/:page',
        element: <BigDataPage />,
      },
      {
        path: 'bigdata/:searchQuery/:profileId',
        element: <BigDataPage />,
      },
      {
        path: 'profile/:id',
        element: <ProfileDetail />,
      },

    ],
  },
]);

export default router;