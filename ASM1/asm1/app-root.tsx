/**
 * Main App Component
 * Thành phần ứng dụng chính
 */

import React from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import HomeScreen from './src/screens/HomeScreen';

/**
 * Root App component
 * Thành phần gốc của ứng dụng
 */
export default function App() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <HomeScreen />
    </GestureHandlerRootView>
  );
}
