import 'package:flutter/material.dart';

class TeamManagementScreen extends StatelessWidget {
  final String pointId;

  const TeamManagementScreen({super.key, required this.pointId});

  @override
  Widget build(BuildContext context) {
    // Placeholder for Team Members List
    // In real app: Fetch from /api/points/:id/team
    return Scaffold(
      appBar: AppBar(title: const Text('Team Management')),
      body: ListView(
        children: [
          ListTile(
            leading: const CircleAvatar(child: Text('A')),
            title: const Text('Alice (Owner)'),
            subtitle: const Text('admin'),
          ),
          ListTile(
            leading: const CircleAvatar(child: Text('B')),
            title: const Text('Bob'),
            subtitle: const Text('Volunteer'),
            trailing: IconButton(
              icon: const Icon(Icons.remove_circle, color: Colors.red),
              onPressed: () {},
            ),
          ),
        ],
      ),
      floatingActionButton: FloatingActionButton(
        child: const Icon(Icons.person_add),
        onPressed: () {
          // Invite logic
        },
      ),
    );
  }
}
