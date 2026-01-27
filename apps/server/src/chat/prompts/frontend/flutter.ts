/**
 * Flutter Development Prompt
 */

export const FLUTTER_PROMPT = `## Flutter Development Guide

### Project Structure

\`\`\`
frontend/
├── lib/
│   ├── main.dart            # Entry point
│   ├── app.dart             # App widget with routing
│   ├── screens/             # Screen widgets
│   │   ├── home_screen.dart
│   │   └── profile_screen.dart
│   ├── widgets/             # Reusable widgets
│   │   ├── common/          # Generic widgets
│   │   └── features/        # Feature-specific widgets
│   ├── models/              # Data models
│   ├── services/            # API, storage services
│   ├── providers/           # State management
│   ├── utils/               # Utilities
│   └── constants/           # App constants
├── assets/                  # Images, fonts
├── android/                 # Android config
├── ios/                     # iOS config
├── pubspec.yaml             # Dependencies
└── analysis_options.yaml    # Lint rules
\`\`\`

### Essential Dependencies (pubspec.yaml)

\`\`\`yaml
dependencies:
  flutter:
    sdk: flutter
  go_router: ^14.0.0          # Navigation
  provider: ^6.1.0            # State management
  dio: ^5.4.0                 # HTTP client
  flutter_riverpod: ^2.5.0    # Alternative state management
  freezed_annotation: ^2.4.0  # Immutable models
  json_annotation: ^4.8.0     # JSON serialization

dev_dependencies:
  flutter_test:
    sdk: flutter
  flutter_lints: ^4.0.0
  build_runner: ^2.4.0
  freezed: ^2.4.0
  json_serializable: ^6.7.0
\`\`\`

### App Entry Point

\`\`\`dart
// lib/main.dart
import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'app.dart';
import 'providers/auth_provider.dart';

void main() {
  runApp(
    MultiProvider(
      providers: [
        ChangeNotifierProvider(create: (_) => AuthProvider()),
      ],
      child: const MyApp(),
    ),
  );
}
\`\`\`

### Navigation with go_router

\`\`\`dart
// lib/app.dart
import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';

final _router = GoRouter(
  initialLocation: '/',
  routes: [
    GoRoute(
      path: '/',
      builder: (context, state) => const HomeScreen(),
    ),
    GoRoute(
      path: '/profile/:id',
      builder: (context, state) {
        final id = state.pathParameters['id']!;
        return ProfileScreen(userId: id);
      },
    ),
  ],
);

class MyApp extends StatelessWidget {
  const MyApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp.router(
      title: 'My App',
      theme: ThemeData(
        colorScheme: ColorScheme.fromSeed(seedColor: Colors.blue),
        useMaterial3: true,
      ),
      routerConfig: _router,
    );
  }
}
\`\`\`

### Screen Widget Pattern

\`\`\`dart
// lib/screens/home_screen.dart
import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';

class HomeScreen extends StatefulWidget {
  const HomeScreen({super.key});

  @override
  State<HomeScreen> createState() => _HomeScreenState();
}

class _HomeScreenState extends State<HomeScreen> {
  List<Item> _items = [];
  bool _isLoading = true;

  @override
  void initState() {
    super.initState();
    _loadItems();
  }

  Future<void> _loadItems() async {
    try {
      final items = await ApiService.getItems();
      setState(() {
        _items = items;
        _isLoading = false;
      });
    } catch (e) {
      setState(() => _isLoading = false);
      // Handle error
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Home')),
      body: _isLoading
          ? const Center(child: CircularProgressIndicator())
          : ListView.builder(
              itemCount: _items.length,
              itemBuilder: (context, index) {
                final item = _items[index];
                return ListTile(
                  title: Text(item.name),
                  onTap: () => context.go('/details/\${item.id}'),
                );
              },
            ),
    );
  }
}
\`\`\`

### Data Models with Freezed

\`\`\`dart
// lib/models/user.dart
import 'package:freezed_annotation/freezed_annotation.dart';

part 'user.freezed.dart';
part 'user.g.dart';

@freezed
class User with _\$User {
  const factory User({
    required String id,
    required String name,
    required String email,
  }) = _User;

  factory User.fromJson(Map<String, dynamic> json) => _\$UserFromJson(json);
}
\`\`\`

### API Service with Dio

\`\`\`dart
// lib/services/api_service.dart
import 'package:dio/dio.dart';

class ApiService {
  static final _dio = Dio(BaseOptions(
    baseUrl: const String.fromEnvironment('API_URL', defaultValue: 'http://localhost:3001'),
    connectTimeout: const Duration(seconds: 10),
    receiveTimeout: const Duration(seconds: 10),
  ));

  static Future<List<Item>> getItems() async {
    final response = await _dio.get('/items');
    return (response.data as List)
        .map((json) => Item.fromJson(json))
        .toList();
  }

  static Future<Item> createItem(CreateItemInput input) async {
    final response = await _dio.post('/items', data: input.toJson());
    return Item.fromJson(response.data);
  }
}
\`\`\`

### State Management with Provider

\`\`\`dart
// lib/providers/auth_provider.dart
import 'package:flutter/material.dart';
import '../models/user.dart';

class AuthProvider extends ChangeNotifier {
  User? _user;

  User? get user => _user;
  bool get isLoggedIn => _user != null;

  void setUser(User user) {
    _user = user;
    notifyListeners();
  }

  void logout() {
    _user = null;
    notifyListeners();
  }
}
\`\`\`

### Critical Rules

1. **Use const constructors** for performance optimization
2. **Separate business logic** from UI (use services/providers)
3. **Use StatelessWidget** when no local state is needed
4. **Run build_runner** after changing Freezed models: \`dart run build_runner build\`
5. **Test on both iOS and Android** - platform-specific issues are common
6. **Handle async errors** with try-catch and show user feedback

### Package Scripts

Add these to your workflow:
\`\`\`bash
# Run app
flutter run

# Build runner for code generation
dart run build_runner build --delete-conflicting-outputs

# Analyze code
flutter analyze

# Run tests
flutter test
\`\`\``;
