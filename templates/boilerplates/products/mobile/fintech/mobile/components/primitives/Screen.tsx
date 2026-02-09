import React from 'react';
import { 
  View, 
  ScrollView, 
  StyleSheet, 
  ViewProps, 
  ScrollViewProps,
  KeyboardAvoidingView,
  Platform,
  RefreshControl,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { colors, layout } from '@/lib/theme';
import { moderateScale } from '@/lib/utils/responsive';

interface ScreenProps extends ViewProps {
  children: React.ReactNode;
  /** Use safe area insets */
  safeArea?: boolean;
  /** Add horizontal padding */
  padded?: boolean;
  /** Enable scrolling */
  scroll?: boolean;
  /** Keyboard avoiding behavior */
  keyboardAvoiding?: boolean;
  /** Pull to refresh */
  onRefresh?: () => void;
  refreshing?: boolean;
  /** Extra bottom padding for tab bar screens */
  tabBarPadding?: boolean;
  /** ScrollView props when scroll is enabled */
  scrollViewProps?: ScrollViewProps;
  /** Content container style for scroll mode */
  contentContainerStyle?: ScrollViewProps['contentContainerStyle'];
}

export function Screen({ 
  children, 
  safeArea = true, 
  padded = true,
  scroll = false,
  keyboardAvoiding = false,
  onRefresh,
  refreshing = false,
  tabBarPadding = false,
  scrollViewProps,
  contentContainerStyle,
  style,
  ...props 
}: ScreenProps) {
  const insets = useSafeAreaInsets();
  
  // Build content
  let content = children;
  
  // Wrap in ScrollView if needed
  if (scroll) {
    content = (
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          styles.scrollContent,
          padded && styles.padded,
          tabBarPadding && { paddingBottom: layout.tabBarHeight },
          contentContainerStyle,
        ]}
        keyboardShouldPersistTaps="handled"
        refreshControl={
          onRefresh ? (
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor={colors.primary.DEFAULT}
              colors={[colors.primary.DEFAULT]}
            />
          ) : undefined
        }
        {...scrollViewProps}
      >
        {children}
      </ScrollView>
    );
  } else if (padded) {
    content = (
      <View style={[styles.content, styles.padded, tabBarPadding && { paddingBottom: layout.tabBarHeight }]}>
        {children}
      </View>
    );
  }
  
  // Wrap in KeyboardAvoidingView if needed
  if (keyboardAvoiding) {
    content = (
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.flex}
        keyboardVerticalOffset={safeArea ? 0 : insets.top}
      >
        {content}
      </KeyboardAvoidingView>
    );
  }
  
  // Wrap in SafeAreaView or View
  const Container = safeArea ? SafeAreaView : View;
  
  return (
    <Container 
      style={[
        styles.container,
        !scroll && !padded && style,
      ]} 
      {...props}
    >
      <StatusBar style="light" />
      {content}
    </Container>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.neutral[0],
  },
  flex: {
    flex: 1,
  },
  content: {
    flex: 1,
  },
  padded: {
    paddingHorizontal: layout.screenPaddingHorizontal,
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: moderateScale(24),
  },
});
