import React, { useState } from 'react';
import {
  Dialog,
  DialogTrigger,
  Heading,
  Content,
  Button,
  TextField,
  Text,
  ActionButton,
  Divider,
  Flex,
  View,
} from '@adobe/react-spectrum';
import { useAuth } from '../../contexts/AuthContext';
import { loginUser, signupUser } from '../../api/authApi';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Close from '@spectrum-icons/workflow/Close';

const AuthModal = ({ onSuccess }) => {
  const [mode, setMode] = useState('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();

  const handleSubmit = async () => {
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
      <Button variant='cta'>Review Trail</Button>
      {(close) => (
        <Dialog>
          <ActionButton
            isQuiet
            onPress={close}
            UNSAFE_style={{ position: 'absolute', right: '1rem', top: '1rem' }}
          >
            <Close />
          </ActionButton>
          <Heading>{mode === 'login' ? 'Login' : 'Sign Up'}</Heading>

          <Divider />

          <Content>
            {error && <Text color='negative'>{error}</Text>}

            <Flex direction='column' gap='size-100'>
              {mode === 'signup' && (
                <TextField
                  label='Username'
                  value={username}
                  onChange={setUsername}
                  isRequired
                />
              )}

              <TextField
                label='Email'
                value={email}
                onChange={setEmail}
                type='email'
                isRequired
              />

              <TextField
                label='Password'
                value={password}
                onChange={setPassword}
                type='password'
                isRequired
              />

              <Button
                variant='cta'
                onPress={handleSubmit}
                isDisabled={isLoading}
                UNSAFE_style={{ width: '100px', borderRadius: '5px' }}
              >
                {mode === 'login' ? 'Login' : 'Sign Up'}
              </Button>

              <View>
                <Text>
                  {mode === 'login' ? (
                    <>
                      Don't have an account?{' '}
                      <Button
                        variant='secondary'
                        onPress={() => setMode('signup')}
                      >
                        Sign Up
                      </Button>
                    </>
                  ) : (
                    <>
                      Already have an account?{' '}
                      <Button
                        variant='secondary'
                        onPress={() => setMode('login')}
                      >
                        Login
                      </Button>
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
