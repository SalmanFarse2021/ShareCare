import 'package:flutter/material.dart';
import '../../models/point.dart';

class PointDetailScreen extends StatelessWidget {
  final Point point;

  const PointDetailScreen({super.key, required this.point});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: Text(point.name)),
      body: SingleChildScrollView(
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            // Map Placeholder or Image
            Container(
              height: 200,
              color: Colors.grey[300],
              child: const Center(child: Icon(Icons.map, size: 50)),
            ),
            Padding(
              padding: const EdgeInsets.all(16.0),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    point.name,
                    style: Theme.of(context).textTheme.headlineMedium,
                  ),
                  const SizedBox(height: 8),
                  Row(
                    children: [
                      const Icon(Icons.location_on, size: 16),
                      const SizedBox(width: 4),
                      Expanded(child: Text(point.address)),
                    ],
                  ),
                  const SizedBox(height: 16),
                  const Text(
                    'About',
                    style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
                  ),
                  const SizedBox(height: 8),
                  Text(point.description),
                  const SizedBox(height: 24),
                  
                  if (point.urgentNeeds.isNotEmpty) ...[
                     const Text(
                      'Urgent Needs',
                      style: TextStyle(
                        fontSize: 18, 
                        fontWeight: FontWeight.bold,
                        color: Colors.red,
                      ),
                    ),
                    const SizedBox(height: 8),
                    Wrap(
                      spacing: 8,
                      children: point.urgentNeeds.map((need) => Chip(
                        label: Text(need),
                        backgroundColor: Colors.red[50],
                        labelStyle: TextStyle(color: Colors.red[800]),
                      )).toList(),
                    ),
                  ],
                  
                  const SizedBox(height: 32),
                  SizedBox(
                    width: double.infinity,
                    child: ElevatedButton.icon(
                      onPressed: () {
                        // Join team logic
                      },
                      icon: const Icon(Icons.group_add),
                      label: const Text('Join Team'),
                    ),
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }
}
