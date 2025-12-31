import 'package:flutter/material.dart';
import '../../services/api_service.dart';
import '../../services/socket_service.dart';

class ChatDetailScreen extends StatefulWidget {
  final String chatId;
  final String name;

  const ChatDetailScreen({
    super.key,
    required this.chatId,
    required this.name,
  });

  @override
  State<ChatDetailScreen> createState() => _ChatDetailScreenState();
}

class _ChatDetailScreenState extends State<ChatDetailScreen> {
  final TextEditingController _controller = TextEditingController();
  final ApiService _api = ApiService();
  final SocketService _socket = SocketService();
  List<dynamic> _messages = [];
  bool _isLoading = true;

  @override
  void initState() {
    super.initState();
    _loadMessages();
    _socket.onMessage((data) {
      if (data['chatId'] == widget.chatId && mounted) {
        setState(() => _messages.add(data['message']));
      }
    });
  }

  @override
  void dispose() {
    _socket.offMessage();
    super.dispose();
  }

  Future<void> _loadMessages() async {
    try {
      final data = await _api.get('/chats/${widget.chatId}/messages');
      if (mounted) {
        setState(() {
          _messages = data['messages'] ?? [];
          _isLoading = false;
        });
      }
    } catch (e) {
      if (mounted) setState(() => _isLoading = false);
    }
  }

  void _sendMessage() {
    if (_controller.text.trim().isEmpty) return;
    
    // Optimistic UI update
    // Real impl would wait for ack or rely on socket
    _socket.sendMessage(widget.chatId, _controller.text, 'text');
    _controller.clear();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: Text(widget.name)),
      body: Column(
        children: [
          Expanded(
            child: _isLoading 
                ? const Center(child: CircularProgressIndicator())
                : ListView.builder(
                    padding: const EdgeInsets.all(16),
                    itemCount: _messages.length,
                    itemBuilder: (context, index) {
                      final msg = _messages[index];
                      final isMe = msg['senderId'] == 'me'; // Logic needed
                      return Align(
                        alignment: isMe 
                            ? Alignment.centerRight 
                            : Alignment.centerLeft,
                        child: Container(
                          margin: const EdgeInsets.symmetric(vertical: 4),
                          padding: const EdgeInsets.all(12),
                          decoration: BoxDecoration(
                            color: isMe ? Colors.blue[100] : Colors.grey[200],
                            borderRadius: BorderRadius.circular(8),
                          ),
                          child: Text(msg['content'] ?? ''),
                        ),
                      );
                    },
                  ),
          ),
          Padding(
            padding: const EdgeInsets.all(8.0),
            child: Row(
              children: [
                Expanded(
                  child: TextField(
                    controller: _controller,
                    decoration: const InputDecoration(
                      hintText: 'Type a message...',
                      border: OutlineInputBorder(),
                    ),
                  ),
                ),
                IconButton(
                  icon: const Icon(Icons.send),
                  onPressed: _sendMessage,
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}
