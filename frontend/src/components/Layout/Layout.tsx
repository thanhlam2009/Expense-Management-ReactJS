// Main Layout Component - Copy từ base.html structure
import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';
import Footer from './Footer';
import FlashMessages from './FlashMessages';
import { useAuth } from '../../context/AuthContext';

export default function Layout() {
  const { user } = useAuth();

  return (
    <>
      <Navbar currentUser={user} />
      
      <FlashMessages messages={[]} />
      
      <main className="container mt-4">
        <Outlet />
      </main>
      
      <Footer />
    </>
  );
}
