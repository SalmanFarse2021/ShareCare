import 'package:flutter/material.dart';
import '../../services/api_service.dart';
import '../../models/point.dart';
import 'create_point_screen.dart';
import 'edit_point_screen.dart';

class MyPointsScreen extends StatefulWidget {
  const MyPointsScreen({super.key});

  @override
  State<MyPointsScreen> createState() => _MyPointsScreenState();
}

class _MyPointsScreenState extends State<MyPointsScreen> {
  final ApiService _api = ApiService();
  List<Point> _points = [];
  bool _isLoading = true;

  @override
  void initState() {
    super.initState();
    _loadPoints();
  }

  Future<void> _loadPoints() async {
    try {
      // Adjust endpoint to fetch user's points
      final data = await _api.get('/points?manager=me'); 
      if (mounted) {
        setState(() {
          _points = (data['points'] as List)
              .map((json) => Point.fromJson(json))
              .toList();
          _isLoading = false;
        });
      }
    } catch (e) {
      if (mounted) setState(() => _isLoading = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('My Donation Points'),
        actions: [
          IconButton(
            icon: const Icon(Icons.add),
            onPressed: () {
              Navigator.push(
                context, 
                MaterialPageRoute(builder: (_) => const CreatePointScreen()),
              ).then((_) => _loadPoints());
            },
          ),
        ],
      ),
      body: _isLoading 
          ? const Center(child: CircularProgressIndicator())
          : _points.isEmpty
              ? const Center(child: Text('You manage no points'))
              : ListView.builder(
                  itemCount: _points.length,
                  itemBuilder: (context, index) {
                    final point = _points[index];
                    return Card(
                      margin: const EdgeInsets.all(8),
                      child: ListTile(
                        title: Text(point.name),
                        subtitle: Text(point.address),
                        trailing: Chip(label: Text(point.status)),
                        onTap: () {
                          Navigator.push(
                            context,
                            MaterialPageRoute(
                              builder: (_) => EditPointScreen(pointId: point.id),
                            ),
                          ).then((_) => _loadPoints());
                        },
                      ),
                    );
                  },
                ),
    );
  }
}
