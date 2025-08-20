import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useAuthCheck } from '@/context';
import ChatSheet from '@/components/chatsheet';
import { LogOut, User, MessageCircle } from 'lucide-react';

const Header = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuthCheck();

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/');
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  const handleProfile = () => {
    navigate('/profile');
  };

  return (
    <header className="bg-white shadow-sm border-b border-gray-200">
      <div className="container mx-auto px-4">
        <div className="flex justify-end items-center h-16 space-x-4">
          <Button variant="outline" onClick={handleProfile}>
            <User className="h-4 w-4 mr-2" />
            Profile
          </Button>
          
          <ChatSheet />
          
          <Button variant="outline" onClick={handleLogout}>
            <LogOut className="h-4 w-4 mr-2" />
            Logout
          </Button>
        </div>
      </div>
    </header>
  );
};

export default Header;
