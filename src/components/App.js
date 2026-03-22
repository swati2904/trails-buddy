import React from 'react';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import ShellLayout from './Shell/ShellLayout';
import HomePage from '../pages/HomePage';
import ExplorePage from '../pages/ExplorePage';
import TrailDetailPage from '../pages/TrailDetailPage';
import ParkPage from '../pages/ParkPage';
import ParksPage from '../pages/ParksPage';
import SignInPage from '../pages/SignInPage';
import SignUpPage from '../pages/SignUpPage';
import FavoritesPage from '../pages/FavoritesPage';
import ListsPage from '../pages/ListsPage';
import ListDetailPage from '../pages/ListDetailPage';
import ProfilePage from '../pages/ProfilePage';
import SettingsPage from '../pages/SettingsPage';
import PricingPage from '../pages/PricingPage';
import AboutPage from '../pages/AboutPage';
import HelpPage from '../pages/HelpPage';
import PressPage from '../pages/PressPage';
import NotFoundPage from '../pages/NotFoundPage';
import { AuthProvider } from '../state/AuthContext';

const App = () => {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route element={<ShellLayout />}>
            <Route path='/' element={<HomePage />} />
            <Route path='/explore' element={<ExplorePage />} />
            <Route path='/search' element={<ExplorePage />} />
            <Route path='/nearby' element={<ExplorePage />} />
            <Route path='/parks' element={<ParksPage />} />
            <Route path='/trail/:slug' element={<TrailDetailPage />} />
            <Route path='/parks/:slug' element={<ParkPage />} />
            <Route path='/signin' element={<SignInPage />} />
            <Route path='/signup' element={<SignUpPage />} />
            <Route path='/pricing' element={<PricingPage />} />
            <Route path='/about' element={<AboutPage />} />
            <Route path='/help' element={<HelpPage />} />
            <Route path='/press' element={<PressPage />} />
            <Route path='/my-favorites' element={<FavoritesPage />} />
            <Route path='/my-lists' element={<ListsPage />} />
            <Route path='/my-lists/:id' element={<ListDetailPage />} />
            <Route path='/profile' element={<ProfilePage />} />
            <Route path='/settings' element={<SettingsPage />} />
            <Route path='/404' element={<NotFoundPage />} />
            <Route path='*' element={<Navigate to='/404' replace />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
};

export default App;
