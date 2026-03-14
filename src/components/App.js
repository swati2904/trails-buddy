import React from 'react';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import ShellLayout from './Shell/ShellLayout';
import HomePage from '../pages/HomePage';
import ExplorePage from '../pages/ExplorePage';
import TrailDetailPage from '../pages/TrailDetailPage';
import ParkPage from '../pages/ParkPage';
import SimplePage from '../pages/SimplePage';
import SignInPage from '../pages/SignInPage';
import SignUpPage from '../pages/SignUpPage';
import FavoritesPage from '../pages/FavoritesPage';
import ListsPage from '../pages/ListsPage';
import ProfilePage from '../pages/ProfilePage';
import SettingsPage from '../pages/SettingsPage';
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
            <Route path='/trail/:slug' element={<TrailDetailPage />} />
            <Route path='/parks/:slug' element={<ParkPage />} />
            <Route path='/signin' element={<SignInPage />} />
            <Route path='/signup' element={<SignUpPage />} />
            <Route
              path='/pricing'
              element={<SimplePage title='Pricing' subtitle='Plan comparison and checkout are pending backend entitlement endpoints.' />}
            />
            <Route
              path='/about'
              element={<SimplePage title='About' subtitle='Company profile and brand story page placeholder.' />}
            />
            <Route
              path='/help'
              element={<SimplePage title='Help Center' subtitle='Knowledge base and support contacts page placeholder.' />}
            />
            <Route
              path='/press'
              element={<SimplePage title='Press' subtitle='Media resources and press updates page placeholder.' />}
            />
            <Route path='/my-favorites' element={<FavoritesPage />} />
            <Route path='/my-lists' element={<ListsPage />} />
            <Route path='/profile' element={<ProfilePage />} />
            <Route path='/settings' element={<SettingsPage />} />
            <Route
              path='/404'
              element={<SimplePage title='Page Not Found' subtitle='The route you requested was not found.' />}
            />
            <Route path='*' element={<Navigate to='/404' replace />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
};

export default App;
