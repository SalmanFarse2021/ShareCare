import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:google_fonts/google_fonts.dart';

// Services
import 'services/auth_service.dart';

// Screens
import 'screens/auth/login_screen.dart';
import 'screens/dashboard/dashboard_screen.dart';

void main() async {
  WidgetsFlutterBinding.ensureInitialized();
  // await Firebase.initializeApp(); // Initialize Firebase - commented out until setup

  runApp(
    MultiProvider(
      providers: [
        ChangeNotifierProvider(create: (_) => AuthService()),
      ],
      child: const ShareCareApp(),
    ),
  );
}

class ShareCareApp extends StatelessWidget {
  const ShareCareApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'ShareCare',
      debugShowCheckedModeBanner: false,
      theme: ThemeData(
        colorScheme: ColorScheme.fromSeed(
          seedColor: const Color(0xFF2563EB), // Primary Blue
          brightness: Brightness.light,
        ),
        useMaterial3: true,
        textTheme: GoogleFonts.interTextTheme(
          Theme.of(context).textTheme,
        ),
      ),
      // Simple initial routing check
      home: Consumer<AuthService>(
        builder: (context, auth, _) {
          return auth.isAuthenticated 
              ? const DashboardScreen() 
              : const LoginScreen();
        },
      ),
    );
  }
}
