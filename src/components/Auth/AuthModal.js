import React, { useState } from 'react';
import {
  Dialog,
  DialogTrigger,
  Heading,
  Content,
  TextField,
  Text,
  ActionButton,
  Divider,
  Flex,
  View,
} from '@adobe/react-spectrum';
import { useAuth } from '../../contexts/AuthContext';
import { loginUser, signupUser } from '../../api/authApi';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Close from '@spectrum-icons/workflow/Close';
import { useTranslation } from 'react-i18next';
import CustomButton from '../Common/CustomButton';

const AuthModal = ({ onSuccess }) => {
  const { t } = useTranslation();

  const [mode, setMode] = useState('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();

  const validateEmail = (email) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(String(email).toLowerCase());
  };

  const validatePassword = (password) => {
    return password.length >= 6;
  };

  const validateUsername = (username) => {
    return username.length >= 3;
  };

  const isFormValid = () => {
    if (mode === 'signup' && !validateUsername(username)) {
      setError('Please enter a valid username (at least 3 characters).');
      return false;
    }
    if (!validateEmail(email)) {
      setError('Please enter a valid email.');
      return false;
    }
    if (!validatePassword(password)) {
      setError('Please enter a valid password (at least 6 characters).');
      return false;
    }
    setError('');
    return true;
  };

  const handleSubmit = async () => {
    if (!isFormValid()) {
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      if (mode === 'login') {
        const {
          token,
          email: userEmail,
          username: userUsername,
        } = await loginUser({
          email,
          password,
        });
        login(token, userEmail, userUsername);
        toast.success('You have successfully logged in!');
        onSuccess();
      } else {
        await signupUser({ username, email, password });
        toast.success(
          'Your account has been successfully created. Please log in.'
        );
        setMode('login');
      }
    } catch (error) {
      setError(
        error.response?.data?.message ||
          error.message ||
          'Something went wrong. Please try again.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <DialogTrigger>
      <CustomButton>{t('common.review_trail')}</CustomButton>
      {(close) => (
        <Dialog>
          <ActionButton
            isQuiet
            onPress={close}
            UNSAFE_style={{ position: 'absolute', right: '1rem', top: '1rem' }}
          >
            <Close />
          </ActionButton>
          <Heading>
            {mode === 'login' ? t('auth.login') : t('auth.signup')}
          </Heading>
          <Divider />

          <Content>
            {error && <Text color='negative'>{error}</Text>}

            <Flex direction='column' gap='size-100'>
              {mode === 'signup' && (
                <TextField
                  label={t('auth.username')}
                  value={username}
                  onChange={setUsername}
                  isRequired
                />
              )}

              <TextField
                label={t('auth.email')}
                value={email}
                onChange={setEmail}
                type='email'
                isRequired
              />

              <TextField
                label={t('auth.password')}
                value={password}
                onChange={setPassword}
                type='password'
                isRequired
              />

              <CustomButton
                onPress={handleSubmit}
                isDisabled={isLoading || !isFormValid()}
                UNSAFE_style={{ width: '100px', borderRadius: '5px' }}
              >
                {mode === 'login' ? t('auth.login') : t('auth.signup')}
              </CustomButton>

              <View>
                <Text>
                  {mode === 'login' ? (
                    <>
                      {t('auth.no_account')}{' '}
                      <CustomButton
                        variant='secondary'
                        onPress={() => setMode('signup')}
                      >
                        {t('auth.signup')}
                      </CustomButton>
                    </>
                  ) : (
                    <>
                      {t('auth.already_have_account')}{' '}
                      <CustomButton
                        variant='secondary'
                        onPress={() => setMode('login')}
                      >
                        {t('auth.login')}
                      </CustomButton>
                    </>
                  )}
                </Text>
              </View>
            </Flex>
          </Content>
        </Dialog>
      )}
    </DialogTrigger>
  );
};

export default AuthModal;
