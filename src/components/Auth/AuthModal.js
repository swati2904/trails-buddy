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
  Flex,
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
      setError(error.message || 'Something went wrong');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <ToastContainer />
      <DialogTrigger>
        <Button variant='cta'>Review Trail</Button>
        {(close) => (
          <Dialog>
            <Flex justifyContent='space-between' alignItems='center'>
              <Heading>{mode === 'login' ? 'Login' : 'Sign Up'}</Heading>
              <ActionButton isQuiet onPress={close}>
                <Close />
              </ActionButton>
            </Flex>
            <Content>
              {error && <Text color='negative'>{error}</Text>}

              {mode === 'signup' && (
                <TextField
                  label='Username'
                  value={username}
                  onChange={setUsername}
                  marginTop='size-100'
                  isRequired
                />
              )}

              <TextField
                label='Email'
                value={email}
                onChange={setEmail}
                type='email'
                marginTop='size-100'
                isRequired
              />

              <TextField
                label='Password'
                value={password}
                onChange={setPassword}
                type='password'
                marginTop='size-100'
                isRequired
              />

              <Button
                variant='cta'
                onPress={handleSubmit}
                marginTop='size-200'
                isDisabled={isLoading}
              >
                {mode === 'login' ? 'Login' : 'Sign Up'}
              </Button>

              <Text marginTop='size-100'>
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
            </Content>
          </Dialog>
        )}
      </DialogTrigger>
    </>
  );
};

export default AuthModal;
