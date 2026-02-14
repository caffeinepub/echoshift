import { useEffect } from 'react';
import { useSession } from '../state/session';
import { generateUsername } from './username';

export function useLocalUsername() {
  const { username, setUsername } = useSession();

  useEffect(() => {
    if (!username) {
      const newUsername = generateUsername();
      setUsername(newUsername);
    }
  }, [username, setUsername]);

  const resetUsername = () => {
    const newUsername = generateUsername();
    setUsername(newUsername);
  };

  return {
    username: username || '',
    resetUsername,
  };
}
