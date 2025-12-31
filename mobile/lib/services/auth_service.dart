import 'package:flutter/foundation.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'api_service.dart';
import '../models/user.dart';

class AuthService with ChangeNotifier {
  final ApiService _api = ApiService();
  User? _currentUser;
  bool _isAuthenticated = false;
  bool _isLoading = true;

  User? get currentUser => _currentUser;
  bool get isAuthenticated => _isAuthenticated;
  bool get isLoading => _isLoading;

  AuthService() {
    _loadUser();
  }

  Future<void> _loadUser() async {
    try {
      final prefs = await SharedPreferences.getInstance();
      final token = prefs.getString('auth_token');
      
      if (token != null) {
        // Verify token by fetching profile
        // Assuming your backend has a /users/me or similar endpoint
        // If not, we might need to trust the token or use Firebase Auth SDK directly
        // For this hybrid approach, we'll try to fetch user profile
        final data = await _api.get('/users/profile'); // Adjust endpoint as needed
        if (data != null) {
          _currentUser = User.fromJson(data);
          _isAuthenticated = true;
        }
      }
    } catch (e) {
      print('Auth check failed: $e');
      _logout();
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }

  Future<void> login(String email, String password) async {
    try {
      // Logic depends on your auth strategy
      // 1. If using Firebase Auth only:
      // final credential = await FirebaseAuth.instance.signInWithEmailAndPassword(...)
      // final token = await credential.user!.getIdToken();
      
      // 2. If using Custom API (wrapping Firebase Admin):
      // This is what the Next.js app likely does if it has a /login endpoint
      
      // We will assume option 2 for consistency with "Reuse API"
      // But usually Mobile Apps use Firebase SDK directly.
      // Let's assume we send creds to backend to get a custom token or session
      
      // FOR NOW: Simulating direct API login which returns a token/user
      final response = await _api.post('/auth/login', { // Ensure this route exists
        'email': email,
        'password': password,
      });

      // Assuming response contains { token: '...', user: {...} }
      // If NextAuth is used, it uses cookies. Mobile works better with Tokens.
      // You might need to adjust Backend to issue JWTs for mobile.
      
      // Placeholder logic:
      if (response != null && response['token'] != null) {
        final prefs = await SharedPreferences.getInstance();
        await prefs.setString('auth_token', response['token']);
        _currentUser = User.fromJson(response['user']);
        _isAuthenticated = true;
        notifyListeners();
      }
    } catch (e) {
      rethrow;
    }
  }

  Future<void> logout() async {
    await _logout();
    notifyListeners();
  }

  Future<void> _logout() async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.remove('auth_token');
    _currentUser = null;
    _isAuthenticated = false;
  }
}
