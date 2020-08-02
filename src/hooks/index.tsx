import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { ThemeProvider } from 'styled-components';
import { useColorScheme } from 'react-native';

import themes from '../styles/themes';

import { CartProvider } from './cart';

const AppProvider: React.FC = ({ children }) => {
  const deviceTheme = useColorScheme();
  const theme = themes[deviceTheme || 'light'];

  return (
    <CartProvider>
      <NavigationContainer>
        <ThemeProvider theme={theme}>{children}</ThemeProvider>
      </NavigationContainer>
    </CartProvider>
  );
};

export default AppProvider;
