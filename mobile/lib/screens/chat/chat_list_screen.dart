import 'package:flutter/material.dart';
import '../../services/api_service.dart';
import 'chat_detail_screen.dart';

class ChatListScreen extends StatefulWidget {
  const ChatListScreen({super.key});

  @override
  State<ChatListScreen> createState() => _ChatListScreenState();
}

class _ChatListScreenState extends State<ChatListScreen> {
  final ApiService _api = ApiService();
  List<dynamic> _chats = [];
  bool _isLoading = true;

  @override
  void initState() {
    super.initState();
    _loadChats();
  }

  Future<void> _loadChats() async {
    try {
      final data = await _api.get('/chats'); // Adjust endpoint
      if (mounted) {
        setState(() {
          _chats = data['chats'] ?? [];
          _isLoading = false;
        });
      }
    } catch (e) {
      if (mounted) setState(() => _isLoading = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    if (_isLoading) return const Center(child: CircularProgressIndicator());

    if (_chats.isEmpty) {
      return const Center(child: Text('No messages yet'));
    }

    return ListView.builder(
      itemCount: _chats.length,
      itemBuilder: (context, index) {
        final chat = _chats[index];
        return ListTile(
          leading: const CircleAvatar(child: Icon(Icons.person)),
          title: Text(chat['participants']?[0]['name'] ?? 'User'), // Simplify
          subtitle: Text(chat['lastMessage']?['content'] ?? 'No messages'),
          onTap: () {
            Navigator.push(
              context,
              MaterialPageRoute(
                builder: (_) => ChatDetailScreen(
                  chatId: chat['_id'], 
                  name: chat['participants']?[0]['name'] ?? 'User'
                ),
              ),
            );
          },
        );
      },
    );
  }
}
