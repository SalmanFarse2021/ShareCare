import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../services/auth_service.dart';
import '../../models/user.dart';
import '../points/my_points_screen.dart';

class ProfileScreen extends StatelessWidget {
  const ProfileScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final auth = Provider.of<AuthService>(context);
    final user = auth.currentUser;

    if (user == null) {
      return const Center(child: Text('Not logged in'));
    }

    return Scaffold(
      appBar: AppBar(
        title: const Text('Profile'),
        actions: [
          IconButton(
            icon: const Icon(Icons.settings),
            onPressed: () {
              ScaffoldMessenger.of(context).showSnackBar(
                  const SnackBar(content: Text('Settings not implemented yet')));
            },
          ),
        ],
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16),
        child: Column(
          children: [
            // Avatar
            CircleAvatar(
              radius: 50,
              backgroundImage: user.avatar != null 
                  ? NetworkImage(user.avatar!) 
                  : null,
              child: user.avatar == null 
                  ? const Icon(Icons.person, size: 50) 
                  : null,
            ),
            const SizedBox(height: 16),
            
            // Name
            Text(
              user.name,
              style: Theme.of(context).textTheme.headlineMedium,
            ),
            Text(
              user.email,
              style: Theme.of(context).textTheme.bodyLarge?.copyWith(
                color: Colors.grey[600],
              ),
            ),
            const SizedBox(height: 32),

            // Use Cards for different sections
            _buildActionCard(
              context, 
              icon: Icons.favorite, 
              title: 'My Donations', 
              onTap: () {},
            ),
            _buildActionCard(
              context, 
              icon: Icons.history, 
              title: 'Request History', 
              onTap: () {},
            ),
              if (user.role == 'manager') // Example role check
              _buildActionCard(
                context, 
                icon: Icons.store, 
                title: 'Manage Points', 
                onTap: () {
                  Navigator.push(
                    context,
                    MaterialPageRoute(builder: (_) => const MyPointsScreen()), // Import this!
                  );
                },
              ),
            
            const SizedBox(height: 24),
            
            // Logout
            OutlinedButton.icon(
              onPressed: () => auth.logout(),
              icon: const Icon(Icons.logout),
              label: const Text('Logout'),
              style: OutlinedButton.styleFrom(
                foregroundColor: Colors.red,
                side: const BorderSide(color: Colors.red),
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildActionCard(BuildContext context, {
    required IconData icon, 
    required String title, 
    required VoidCallback onTap,
  }) {
    return Card(
      margin: const EdgeInsets.only(bottom: 12),
      child: ListTile(
        leading: Icon(icon, color: Theme.of(context).primaryColor),
        title: Text(title),
        trailing: const Icon(Icons.chevron_right),
        onTap: onTap,
      ),
    );
  }
}
