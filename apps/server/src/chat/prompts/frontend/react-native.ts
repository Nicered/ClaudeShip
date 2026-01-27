/**
 * React Native (Bare) Development Prompt
 */

export const REACT_NATIVE_PROMPT = `## React Native Development Guide

### Project Structure

\`\`\`
frontend/
├── src/
│   ├── screens/             # Screen components
│   │   ├── HomeScreen.tsx
│   │   └── ProfileScreen.tsx
│   ├── components/          # Reusable components
│   │   ├── ui/              # Basic UI components
│   │   └── features/        # Feature-specific
│   ├── navigation/          # Navigation config
│   │   ├── RootNavigator.tsx
│   │   └── types.ts
│   ├── hooks/               # Custom hooks
│   ├── lib/                 # Utilities
│   ├── stores/              # State management
│   └── types/               # TypeScript types
├── android/                 # Android native code
├── ios/                     # iOS native code
├── index.js                 # Entry point
├── App.tsx                  # Root component
├── package.json
├── metro.config.js
└── tsconfig.json
\`\`\`

### Essential Dependencies

\`\`\`json
{
  "dependencies": {
    "react": "18.2.0",
    "react-native": "0.74.0",
    "@react-navigation/native": "^6.1.0",
    "@react-navigation/native-stack": "^6.9.0",
    "@react-navigation/bottom-tabs": "^6.5.0",
    "react-native-screens": "^3.29.0",
    "react-native-safe-area-context": "^4.8.0",
    "react-native-gesture-handler": "^2.14.0",
    "react-native-reanimated": "^3.6.0"
  },
  "devDependencies": {
    "@babel/core": "^7.23.0",
    "@babel/preset-env": "^7.23.0",
    "@babel/runtime": "^7.23.0",
    "@types/react": "^18.2.0",
    "typescript": "^5.3.0"
  }
}
\`\`\`

### Navigation Setup

**Root Navigator**:
\`\`\`tsx
// src/navigation/RootNavigator.tsx
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";

const Stack = createNativeStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator<TabParamList>();

function TabNavigator() {
  return (
    <Tab.Navigator>
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
    </Tab.Navigator>
  );
}

export function RootNavigator() {
  return (
    <NavigationContainer>
      <Stack.Navigator>
        <Stack.Screen
          name="Main"
          component={TabNavigator}
          options={{ headerShown: false }}
        />
        <Stack.Screen name="Details" component={DetailsScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
\`\`\`

**Navigation Types**:
\`\`\`tsx
// src/navigation/types.ts
import type { NativeStackScreenProps } from "@react-navigation/native-stack";

export type RootStackParamList = {
  Main: undefined;
  Details: { id: string };
};

export type RootStackScreenProps<T extends keyof RootStackParamList> =
  NativeStackScreenProps<RootStackParamList, T>;
\`\`\`

### Screen Component Pattern

\`\`\`tsx
// src/screens/HomeScreen.tsx
import { StyleSheet, View, Text, FlatList } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import type { RootStackScreenProps } from "../navigation/types";

export function HomeScreen({ navigation }: RootStackScreenProps<"Main">) {
  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>Home</Text>
      <FlatList
        data={items}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <TouchableOpacity
            onPress={() => navigation.navigate("Details", { id: item.id })}
          >
            <ItemCard item={item} />
          </TouchableOpacity>
        )}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    padding: 16,
  },
});
\`\`\`

### API Communication

\`\`\`tsx
// src/lib/api.ts
import { Platform } from "react-native";

// Android emulator uses 10.0.2.2 for localhost
const getBaseUrl = () => {
  if (__DEV__) {
    return Platform.OS === "android"
      ? "http://10.0.2.2:3001"
      : "http://localhost:3001";
  }
  return "https://api.example.com";
};

const API_URL = getBaseUrl();

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

### Critical Rules

1. **Use SafeAreaView** from react-native-safe-area-context
2. **Use FlatList** for lists, not ScrollView with map
3. **Handle Android back button** with BackHandler
4. **Test on both platforms** - iOS Simulator and Android Emulator
5. **Use StyleSheet.create** for performance
6. **Handle keyboard** with KeyboardAvoidingView

### Platform-Specific Code

\`\`\`tsx
import { Platform, StyleSheet } from "react-native";

const styles = StyleSheet.create({
  shadow: Platform.select({
    ios: {
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
    },
    android: {
      elevation: 4,
    },
  }),
});
\`\`\`

### Package Scripts

\`\`\`json
{
  "scripts": {
    "dev": "react-native start",
    "android": "react-native run-android",
    "ios": "react-native run-ios"
  }
}
\`\`\``;
