import 'dart:convert';
import 'package:http/http.dart' as http;
import 'package:shared_preferences/shared_preferences.dart';
import '../config/constants.dart';

class ApiService {
  // Singleton pattern
  static final ApiService _instance = ApiService._internal();
  factory ApiService() => _instance;
  ApiService._internal();

  Future<Map<String, String>> _getHeaders() async {
    final prefs = await SharedPreferences.getInstance();
    final token = prefs.getString('auth_token');
    return {
      'Content-Type': 'application/json',
      if (token != null) 'Authorization': 'Bearer $token',
    };
  }

  Future<dynamic> get(String endpoint) async {
    final response = await http.get(
      Uri.parse('${AppConstants.baseUrl}$endpoint'),
      headers: await _getHeaders(),
    );
    return _handleResponse(response);
  }

  Future<dynamic> post(String endpoint, dynamic data) async {
    final response = await http.post(
      Uri.parse('${AppConstants.baseUrl}$endpoint'),
      headers: await _getHeaders(),
      body: jsonEncode(data),
    );
    return _handleResponse(response);
  }

  Future<String?> uploadImage(String filePath) async {
    try {
      final request = http.MultipartRequest(
        'POST',
        Uri.parse('${AppConstants.baseUrl}/upload'),
      );
      request.headers.addAll(await _getHeaders());
      request.files.add(await http.MultipartFile.fromPath('file', filePath));

      final streamedResponse = await request.send();
      final response = await http.Response.fromStream(streamedResponse);

      if (response.statusCode >= 200 && response.statusCode < 300) {
        final data = jsonDecode(response.body);
        return data['url']; // Assuming API returns { url: '...' }
      } else {
        throw Exception('Upload failed: ${response.statusCode}');
      }
    } catch (e) {
      print('Upload error: $e');
      rethrow;
    }
  }

    return _handleResponse(response);
  }

  Future<dynamic> put(String endpoint, dynamic data) async {
    final response = await http.put(
      Uri.parse('${AppConstants.baseUrl}$endpoint'),
      headers: await _getHeaders(),
      body: jsonEncode(data),
    );
    return _handleResponse(response);
  }

  dynamic _handleResponse(http.Response response) {
    if (response.statusCode >= 200 && response.statusCode < 300) {
      if (response.body.isEmpty) return null;
      return jsonDecode(response.body);
    } else {
      throw Exception('Request failed: ${response.statusCode} - ${response.body}');
    }
  }
}
