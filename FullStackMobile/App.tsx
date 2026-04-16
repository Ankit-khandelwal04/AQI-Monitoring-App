import React, { useState, useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import UserLoginScreen from './src/screens/UserLoginScreen';
import UserSignUpScreen from './src/screens/UserSignUpScreen';
import AdminLoginScreen from './src/screens/AdminLoginScreen';
import AdminSignUpScreen from './src/screens/AdminSignUpScreen';
import OnboardingScreen from './src/screens/OnboardingScreen';
import HomeScreen from './src/screens/HomeScreen';
import GraphViewScreen from './src/screens/GraphViewScreen';
import TableViewScreen from './src/screens/TableViewScreen';
import BottomNav from './src/components/BottomNav';
import AdminDashboard from './src/screens/admin/AdminDashboard';
import ErrorBoundary from './src/components/ErrorBoundary';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { clearToken, getToken, getUser, UserProfile } from './src/utils/api';
import './global.css';

type AuthStatus = 'none' | 'user' | 'admin';
type AuthScreen = 'userLogin' | 'userSignUp' | 'adminLogin' | 'adminSignUp';
type MainScreen = 'home' | 'graph' | 'table';

function AppContent() {
  const [authStatus, setAuthStatus]     = useState<AuthStatus>('none');
  const [authScreen, setAuthScreen]     = useState<AuthScreen>('userLogin');
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [currentScreen, setCurrentScreen]  = useState<MainScreen>('home');
  const [selectedArea, setSelectedArea]     = useState('Cidco');
  const [selectedDate, setSelectedDate]     = useState(new Date());
  const [isLoading, setIsLoading]           = useState(true);
  const [currentUser, setCurrentUser]       = useState<UserProfile | null>(null);

  // ── Restore session from stored token ─────────────────────────────────────
  useEffect(() => {
    const restore = async () => {
      try {
        const token = await getToken();
        const user  = await getUser();
        if (token && user) {
          setCurrentUser(user);
          setAuthStatus(user.role as AuthStatus);
          if (user.role === 'user') {
            const seen = await AsyncStorage.getItem('hasSeenOnboarding');
            setShowOnboarding(seen !== 'true');
          }
        }
      } catch (_) {}
      finally { setIsLoading(false); }
    };
    restore();
  }, []);

  // ── Auth handlers ──────────────────────────────────────────────────────────
  const handleUserLogin = async (user: UserProfile) => {
    console.log('👤 handleUserLogin called with user:', user);
    setCurrentUser(user);
    setAuthStatus('user');
    const seen = await AsyncStorage.getItem('hasSeenOnboarding');
    console.log('📖 Onboarding seen:', seen);
    setShowOnboarding(seen !== 'true');
  };

  const handleUserSignUp = async (user: UserProfile) => {
    console.log('👤 handleUserSignUp called with user:', user);
    setCurrentUser(user);
    setAuthStatus('user');
    setShowOnboarding(true);
  };

  const handleAdminLogin = async (user: UserProfile) => {
    console.log('👨‍💼 handleAdminLogin called with user:', user);
    setCurrentUser(user);
    setAuthStatus('admin');
    setShowOnboarding(false);
  };

  const handleAdminSignUp = async (user: UserProfile) => {
    console.log('👨‍💼 handleAdminSignUp called with user:', user);
    setCurrentUser(user);
    setAuthStatus('admin');
    setShowOnboarding(false);
  };

  const handleOnboardingComplete = async () => {
    await AsyncStorage.setItem('hasSeenOnboarding', 'true');
    setShowOnboarding(false);
  };

  const handleLogout = async () => {
    await clearToken();
    await AsyncStorage.removeItem('hasSeenOnboarding');
    setCurrentUser(null);
    setAuthStatus('none');
    setAuthScreen('userLogin');
    setShowOnboarding(false);
    setCurrentScreen('home');
  };

  // ── Splash ─────────────────────────────────────────────────────────────────
  if (isLoading) {
    return <View style={styles.splash} />;
  }

  // ── Auth screens ───────────────────────────────────────────────────────────
  if (authStatus === 'none') {
    switch (authScreen) {
      case 'userLogin':
        return (
          <SafeAreaProvider>
            <UserLoginScreen
              onLogin={handleUserLogin}
              onNavigateToSignUp={() => setAuthScreen('userSignUp')}
              onNavigateToAdminLogin={() => setAuthScreen('adminLogin')}
            />
          </SafeAreaProvider>
        );
      case 'userSignUp':
        return (
          <SafeAreaProvider>
            <UserSignUpScreen
              onSignUp={handleUserSignUp}
              onNavigateToLogin={() => setAuthScreen('userLogin')}
            />
          </SafeAreaProvider>
        );
      case 'adminLogin':
        return (
          <SafeAreaProvider>
            <AdminLoginScreen
              onLogin={handleAdminLogin}
              onNavigateToUserLogin={() => setAuthScreen('userLogin')}
              onNavigateToAdminSignUp={() => setAuthScreen('adminSignUp')}
            />
          </SafeAreaProvider>
        );
      case 'adminSignUp':
        return (
          <SafeAreaProvider>
            <AdminSignUpScreen
              onSignUp={handleAdminSignUp}
              onNavigateToAdminLogin={() => setAuthScreen('adminLogin')}
            />
          </SafeAreaProvider>
        );
    }
  }

  // ── Onboarding (user only) ─────────────────────────────────────────────────
  if (showOnboarding) {
    return (
      <SafeAreaProvider>
        <OnboardingScreen onComplete={handleOnboardingComplete} />
      </SafeAreaProvider>
    );
  }

  // ── Admin dashboard ────────────────────────────────────────────────────────
  if (authStatus === 'admin') {
    return (
      <SafeAreaProvider>
        <AdminDashboard onLogout={handleLogout} />
      </SafeAreaProvider>
    );
  }

  // ── User main app ──────────────────────────────────────────────────────────
  const renderScreen = () => {
    switch (currentScreen) {
      case 'home':
        return (
          <HomeScreen
            onLogout={handleLogout}
            onViewGraph={(area, date) => {
              setSelectedArea(area);
              setSelectedDate(date);
              setCurrentScreen('graph');
            }}
            onViewTable={(area) => {
              setSelectedArea(area);
              setCurrentScreen('table');
            }}
          />
        );
      case 'graph':
        return (
          <GraphViewScreen
            selectedArea={selectedArea}
            selectedDate={selectedDate}
            onBack={() => setCurrentScreen('home')}
            onFilterDate={() => {}}
          />
        );
      case 'table':
        return (
          <TableViewScreen
            selectedArea={selectedArea}
            onBack={() => setCurrentScreen('home')}
          />
        );
      default:
        return (
          <HomeScreen
            onLogout={handleLogout}
            onViewGraph={(area, date) => {
              setSelectedArea(area);
              setSelectedDate(date);
              setCurrentScreen('graph');
            }}
            onViewTable={(area) => {
              setSelectedArea(area);
              setCurrentScreen('table');
            }}
          />
        );
    }
  };

  return (
    <SafeAreaProvider>
      <View style={styles.appContainer}>
        {renderScreen()}
        <BottomNav
          currentScreen={currentScreen}
          onNavigate={(s) => setCurrentScreen(s as MainScreen)}
        />
      </View>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  appContainer: { flex: 1, backgroundColor: '#f9fafb' },
  splash: { flex: 1, backgroundColor: '#eff6ff' },
});

// Wrap with ErrorBoundary to catch errors and prevent blank screen
export default function App() {
  return (
    <ErrorBoundary>
      <AppContent />
    </ErrorBoundary>
  );
}
