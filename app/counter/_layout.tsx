import { Link, Stack } from 'expo-router';
import { Pressable, Text } from 'react-native';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { theme } from '../../theme';

export default function Layout() {
  return (
    <Stack>
      <Stack.Screen
        name="index"
        options={{
          title: 'Counter',
          headerRight: () => {
            return (
              <Link href="/counter/history" asChild>
                <Pressable hitSlop={16}>
                  <MaterialCommunityIcons
                    name="history"
                    size={32}
                    color={theme.colorGrey}
                  />
                </Pressable>
              </Link>
            );
          },
        }}
      />
    </Stack>
  );
}
