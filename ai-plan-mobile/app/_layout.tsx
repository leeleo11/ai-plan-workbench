import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';

export default function Layout() {
  return (
    <>
      <StatusBar style="dark" />
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: '#F5F1E8' },
        }}
      >
        <Stack.Screen name="index" />
        <Stack.Screen name="chat" />
        <Stack.Screen name="generating" />
        <Stack.Screen name="plan" />
        <Stack.Screen name="personality" />
        <Stack.Screen name="stats" />
        <Stack.Screen name="task/[id]" />
      </Stack>
    </>
  );
}
