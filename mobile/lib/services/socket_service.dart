import 'package:socket_io_client/socket_io_client.dart' as IO;
import '../config/constants.dart';
import 'auth_service.dart';

class SocketService {
  static final SocketService _instance = SocketService._internal();
  factory SocketService() => _instance;
  SocketService._internal();

  IO.Socket? _socket;

  // Initialize connection
  void connect(String token) {
    if (_socket != null && _socket!.connected) return;

    _socket = IO.io(AppConstants.socketUrl, IO.OptionBuilder()
      .setTransports(['websocket'])
      .setExtraHeaders({'Authorization': 'Bearer $token'})
      .build());

    _socket!.onConnect((_) {
      print('Socket connected');
    });

    _socket!.onDisconnect((_) => print('Socket disconnected'));
  }

  void disconnect() {
    _socket?.disconnect();
  }

  // Send a message
  void sendMessage(String chatId, String content, String type) {
    _socket?.emit('send_message', {
      'chatId': chatId,
      'content': content,
      'type': type,
    });
  }

  // Listen for new messages in a specific chat
  void onMessage(Function(dynamic) callback) {
    _socket?.on('new_message', callback);
  }

  // Remove listener
  void offMessage() {
    _socket?.off('new_message');
  }
}
