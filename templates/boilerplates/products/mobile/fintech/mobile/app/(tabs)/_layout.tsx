import { Tabs } from 'expo-router';
import { Platform, StyleSheet, View } from 'react-native';
import { colors } from '@/lib/theme';
import { NeonText, Icon, type IconName } from '@/components/primitives';
import { moderateScale, verticalScale, fontSize } from '@/lib/utils/responsive';

type TabIconProps = {
  focused: boolean;
  icon: IconName;
  label: string;
};

function TabIcon({ focused, icon, label }: TabIconProps) {
  return (
    <View style={styles.tabIconContainer}>
      <View style={[styles.tabIconWrapper, focused && styles.tabIconFocused]}>
        <Icon 
          name={icon} 
          size={moderateScale(22)} 
          focused={focused}
          color={focused ? 'primary' : 'muted'}
        />
      </View>
      <NeonText 
        variant="label" 
        color={focused ? 'primary' : 'muted'}
        glow={focused}
        style={styles.tabLabel}
        numberOfLines={1}
      >
        {label}
      </NeonText>
    </View>
  );
}

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: styles.tabBar,
        tabBarShowLabel: false,
        tabBarActiveTintColor: colors.primary.DEFAULT,
        tabBarInactiveTintColor: colors.neutral[400],
      }}
    >
      <Tabs.Screen
        name="home"
        options={{
          title: 'Home',
          tabBarIcon: ({ focused }) => (
            <TabIcon focused={focused} icon="home" label="Home" />
          ),
        }}
      />
      <Tabs.Screen
        name="income"
        options={{
          title: 'Income',
          tabBarIcon: ({ focused }) => (
            <TabIcon focused={focused} icon="income" label="Income" />
          ),
        }}
      />
      <Tabs.Screen
        name="ai"
        options={{
          title: 'AI',
          tabBarIcon: ({ focused }) => (
            <TabIcon focused={focused} icon="ai" label="AI" />
          ),
        }}
      />
      <Tabs.Screen
        name="account"
        options={{
          title: 'Account',
          tabBarIcon: ({ focused }) => (
            <TabIcon focused={focused} icon="account" label="Account" />
          ),
        }}
      />
      {/* Hidden screens - accessible via navigation but not shown in tab bar */}
      <Tabs.Screen
        name="withdraw"
        options={{
          href: null,
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: colors.neutral[50],
    borderTopWidth: 1,
    borderTopColor: colors.neutral[200],
    height: Platform.OS === 'ios' ? verticalScale(88) : verticalScale(70),
    paddingTop: verticalScale(8),
    paddingBottom: Platform.OS === 'ios' ? verticalScale(28) : verticalScale(8),
    ...Platform.select({
      ios: {
        shadowColor: colors.primary.DEFAULT,
        shadowOffset: { width: 0, height: -4 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
      },
      web: {
        boxShadow: `0 -4px 20px ${colors.glow}`,
      },
      android: {
        elevation: 8,
      },
    }),
  },
  tabIconContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    width: moderateScale(70),
    gap: verticalScale(4),
  },
  tabIconWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabIconFocused: {
    transform: [{ scale: 1.1 }],
  },
  tabLabel: {
    fontSize: fontSize(10),
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
});
