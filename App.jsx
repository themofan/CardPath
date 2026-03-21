import { useState, useEffect } from 'react';
import { UserProvider, useUser } from './src/context/UserContext';
import CPLogin from './src/components/CPLogin';
import Quiz from './src/components/Quiz';
import CardPathApp from './src/components/CardPathApp';

function AppRouter() {
  const { profile, user, authLoading, signOut } = useUser();
  const [state, setState] = useState('loading');

  useEffect(() => {
    if (authLoading) return;

    if (!user) {
      setState('login');
    } else if (profile.onboarded) {
      setState('app');
    } else {
      setState('quiz');
    }
  }, [authLoading, user, profile.onboarded]);

  const handleSignOut = async () => {
    await signOut();
    setState('login');
  };

  if (state === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-secondary-500 text-sm">Loading...</div>
      </div>
    );
  }

  if (state === 'login') {
    return (
      <CPLogin
        onLogin={() => setState(profile.onboarded ? 'app' : 'quiz')}
        onSignUp={() => setState('quiz')}
      />
    );
  }

  if (state === 'quiz') {
    return <Quiz onComplete={() => setState('app')} />;
  }

  return <CardPathApp onRetakeQuiz={() => setState('quiz')} onSignOut={handleSignOut} />;
}

export default function App() {
  return <UserProvider><AppRouter /></UserProvider>;
}
