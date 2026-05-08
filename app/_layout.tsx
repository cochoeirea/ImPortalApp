import { useEffect } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { Platform } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AuthProvider } from '../context/AuthContext';
import { CartProvider } from '../context/CartContext';
import CartButton from '../components/CartButton';
import { COLORS } from '../constants/theme';

const headerStyle = { backgroundColor: COLORS.background } as const;

const baseHeaderOptions = {
  headerStyle,
  headerTintColor: COLORS.text,
  headerTitleStyle: { fontWeight: 'bold' as const },
  headerTitleAlign: (Platform.OS === 'web' ? 'left' : 'center') as 'left' | 'center',
  headerBackTitle: '',
  headerShadowVisible: false,
  headerRightContainerStyle: { paddingRight: 12 },
  headerLeftContainerStyle: { paddingLeft: 12 },
};

function RootLayoutNav() {
  return (
    <Stack>
      <Stack.Screen name="index" options={{ headerShown: false }} />
      <Stack.Screen name="login" options={{ headerShown: false }} />

      <Stack.Screen
        name="products/index"
        options={{
          ...baseHeaderOptions,
          title: 'ImPortal',
        }}
      />

      <Stack.Screen
        name="products/[id]"
        options={{
          ...baseHeaderOptions,
          title: 'Product Details',
          headerRight: () => <CartButton />,
        }}
      />

      <Stack.Screen
        name="cart"
        options={{
          ...baseHeaderOptions,
          title: 'My Cart',
        }}
      />
    </Stack>
  );
}

export default function RootLayout() {
  useEffect(() => {
    if (Platform.OS === 'web') {
      document.title = 'ImPortal';
    }
  }, []);

  return (
    <SafeAreaProvider>
      <CartProvider>
        <AuthProvider>
          <StatusBar style="dark" />
          <RootLayoutNav />
        </AuthProvider>
      </CartProvider>
    </SafeAreaProvider>
  );
}
