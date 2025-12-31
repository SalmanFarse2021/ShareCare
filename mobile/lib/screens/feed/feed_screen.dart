import 'package:flutter/material.dart';
import '../../services/api_service.dart';
import '../../widgets/post_card.dart';
import '../../widgets/filter_widget.dart';

class FeedScreen extends StatefulWidget {
  const FeedScreen({super.key});

  @override
  State<FeedScreen> createState() => _FeedScreenState();
}

class _FeedScreenState extends State<FeedScreen> {
  final ApiService _api = ApiService();
  List<dynamic> _posts = [];
  bool _isLoading = true;
  String? _error;
  
  // Filter Props
  String _searchQuery = '';
  Map<String, dynamic> _filters = {
    'type': 'all',
    'radius': 10.0,
    'status': 'active',
    'sort': 'nearest',
  };

  @override
  void initState() {
    super.initState();
    _loadPosts();
  }

  Future<void> _loadPosts() async {
    setState(() => _isLoading = true);
    try {
      // Construct Query String
      final query = <String, String>{};
      if (_searchQuery.isNotEmpty) query['q'] = _searchQuery;
      if (_filters['type'] != 'all') {
         if (_filters['type'] == 'donation_point') {
             query['source'] = 'donation_point';
         } else {
             query['type'] = _filters['type'];
         }
      }
      query['radius'] = _filters['radius'].toString();
      query['status'] = _filters['status'];
      query['sort'] = _filters['sort'];

      // Build endpoint manually for now
      final queryString = query.entries.map((e) => '${e.key}=${e.value}').join('&');
      
      final data = await _api.get('/posts?$queryString');
      if (mounted) {
        setState(() {
          _posts = data['posts'] ?? [];
          _isLoading = false;
        });
      }
    } catch (e) {
      if (mounted) {
        setState(() {
          _error = e.toString();
          _isLoading = false;
        });
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    return Column(
      children: [
        FilterWidget(
          onSearch: (val) {
            _searchQuery = val;
            _loadPosts();
          },
          onFilterChanged: (newFilters) {
            _filters = newFilters;
            _loadPosts();
          },
        ),
        Expanded(
          child: _isLoading
              ? const Center(child: CircularProgressIndicator())
              : _error != null
                  ? Center(
                      child: Column(
                        mainAxisAlignment: MainAxisAlignment.center,
                        children: [
                          Text('Error: $_error'),
                          ElevatedButton(
                            onPressed: _loadPosts,
                            child: const Text('Retry'),
                          ),
                        ],
                      ),
                    )
                  : RefreshIndicator(
                      onRefresh: _loadPosts,
                      child: ListView.builder(
                        padding: const EdgeInsets.all(16),
                        itemCount: _posts.length,
                        itemBuilder: (context, index) {
                          final post = _posts[index];
                          return PostCard(
                            post: post,
                            onTap: () {
                              // Navigate to details
                            },
                          );
                        },
                      ),
                    ),
        ),
      ],
    );
  }
}
