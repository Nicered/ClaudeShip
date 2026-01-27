/**
 * Expo (React Native) Development Prompt
 */

export const EXPO_PROMPT = `## Expo (React Native) Development Guide

### Project Structure

\`\`\`
frontend/
├── app/                      # Expo Router pages (file-based routing)
│   ├── _layout.tsx          # Root layout
│   ├── index.tsx            # Home screen
│   ├── (tabs)/              # Tab navigation group
│   │   ├── _layout.tsx      # Tab layout
│   │   ├── home.tsx
│   │   └── profile.tsx
│   └── [id].tsx             # Dynamic route
├── components/              # Reusable components
│   ├── ui/                  # Basic UI components
│   └── features/            # Feature-specific components
├── constants/               # App constants (colors, etc.)
├── hooks/                   # Custom hooks
├── lib/                     # Utilities
├── assets/                  # Images, fonts
├── app.json                 # Expo config
├── package.json
└── tsconfig.json
\`\`\`

### Essential Dependencies

\`\`\`json
{
  "dependencies": {
    "expo": "~52.0.0",
    "expo-router": "~4.0.0",
    "expo-status-bar": "~2.0.0",
    "react": "18.3.1",
    "react-native": "0.76.0",
    "react-native-safe-area-context": "4.12.0",
    "react-native-screens": "~4.0.0",
    "react-native-reanimated": "~3.16.0",
    "react-native-gesture-handler": "~2.20.0",
    "@expo/vector-icons": "^14.0.0"
  },
  "devDependencies": {
    "@babel/core": "^7.25.0",
    "@types/react": "~18.3.0",
    "typescript": "~5.3.0"
  }
}
\`\`\`

### Navigation with Expo Router

**Root Layout (_layout.tsx)**:
\`\`\`tsx
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";

export default function RootLayout() {
  return (
    <>
      <StatusBar style="auto" />
      <Stack>
        <Stack.Screen name="index" options={{ headerShown: false }} />
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      </Stack>
    </>
  );
}
\`\`\`

**Tab Layout**:
\`\`\`tsx
import { Tabs } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

export default function TabLayout() {
  return (
    <Tabs screenOptions={{ tabBarActiveTintColor: "#007AFF" }}>
      <Tabs.Screen
        name="home"
        options={{
          title: "Home",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="home" size={size} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
\`\`\`

### Styling Approach

Use StyleSheet for performance:
\`\`\`tsx
import { StyleSheet, View, Text } from "react-native";

export function Card({ title, children }) {
  return (
    <View style={styles.card}>
      <Text style={styles.title}>{title}</Text>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  title: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 8,
  },
});
\`\`\`

### API Communication

\`\`\`tsx
// lib/api.ts
const API_URL = process.env.EXPO_PUBLIC_API_URL || "http://localhost:3001";

export async function fetcher<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const response = await fetch(\`\${API_URL}\${endpoint}\`, {
    headers: {
      "Content-Type": "application/json",
      ...options?.headers,
    },
    ...options,
  });

  if (!response.ok) {
    throw new Error(\`API Error: \${response.status}\`);
  }

  return response.json();
}
\`\`\`

### State Management

Use React Context or Zustand:
\`\`\`tsx
// stores/useAuthStore.ts
import { create } from "zustand";

interface AuthState {
  user: User | null;
  setUser: (user: User | null) => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  setUser: (user) => set({ user }),
}));
\`\`\`

### Critical Rules

1. **Always use SafeAreaView** for screen components
2. **Test on both iOS and Android** - use platform-specific code when needed
3. **Handle keyboard** with KeyboardAvoidingView for forms
4. **Use FlatList** for long lists (not ScrollView with map)
5. **Optimize images** with expo-image or cached images
6. **Handle loading states** - mobile users expect feedback

### Platform-Specific Code

\`\`\`tsx
import { Platform, StyleSheet } from "react-native";

const styles = StyleSheet.create({
  container: {
    paddingTop: Platform.OS === "ios" ? 20 : 0,
    ...Platform.select({
      ios: { shadowColor: "#000" },
      android: { elevation: 4 },
    }),
  },
});
\`\`\`

### Package Scripts

\`\`\`json
{
  "scripts": {
    "dev": "expo start",
    "android": "expo start --android",
    "ios": "expo start --ios",
    "web": "expo start --web"
  }
}
\`\`\``;
