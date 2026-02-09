/**
 * System Stack Navigator
 * 
 * Expo Router compatible Blank Stack from react-native-screen-transitions.
 * Provides premium screen transitions with gesture support.
 */

import type {
  ParamListBase,
  StackNavigationState,
} from '@react-navigation/native';
import { withLayoutContext } from 'expo-router';
import {
  createBlankStackNavigator,
  type BlankStackNavigationEventMap,
  type BlankStackNavigationOptions,
} from 'react-native-screen-transitions/blank-stack';

const { Navigator } = createBlankStackNavigator();

/**
 * Blank Stack Navigator wrapped for Expo Router compatibility.
 * Use this instead of the default Stack for custom transitions.
 */
export const Stack = withLayoutContext<
  BlankStackNavigationOptions,
  typeof Navigator,
  StackNavigationState<ParamListBase>,
  BlankStackNavigationEventMap
>(Navigator);
