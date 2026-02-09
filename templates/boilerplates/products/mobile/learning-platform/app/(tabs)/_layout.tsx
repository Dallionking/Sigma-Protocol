import React from "react";
import { Tabs } from "expo-router";
import { StatusBar } from "expo-status-bar";

import { CustomTabBar } from "@/components/CustomTabBar";

export default function TabLayout() {
  return (
    <>
      <StatusBar style="light" />
      <Tabs
        tabBar={(props) => <CustomTabBar {...props} />}
        screenOptions={{
          headerShown: false,
        }}
      >
        <Tabs.Screen
          name="home"
          options={{
            title: "Home",
          }}
        />
        <Tabs.Screen
          name="learn"
          options={{
            title: "Learn",
          }}
        />
        <Tabs.Screen
          name="practice"
          options={{
            title: "Practice",
          }}
        />
        <Tabs.Screen
          name="schedule"
          options={{
            title: "Schedule",
          }}
        />
        <Tabs.Screen
          name="profile"
          options={{
            title: "Profile",
          }}
        />
      </Tabs>
    </>
  );
}
