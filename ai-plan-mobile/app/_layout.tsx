import { Tabs } from 'expo-router';
import { theme } from '../lib/theme';

export default function Layout() {
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: theme.berry,
        tabBarInactiveTintColor: '#999',
        tabBarStyle: {
          backgroundColor: theme.paper,
          borderTopColor: theme.line,
          borderTopWidth: 2,
        },
        headerStyle: {
          backgroundColor: theme.paper,
        },
        headerTintColor: theme.ink,
        headerTitleStyle: {
          fontWeight: 'bold',
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: '今日',
          tabBarLabel: '今日',
        }}
      />
      <Tabs.Screen
        name="plan"
        options={{
          title: '计划',
          tabBarLabel: '计划',
        }}
      />
      <Tabs.Screen
        name="generate"
        options={{
          title: '生成',
          tabBarLabel: '生成',
        }}
      />
      <Tabs.Screen
        name="review"
        options={{
          title: '批注',
          tabBarLabel: '批注',
        }}
      />
    </Tabs>
  );
}
