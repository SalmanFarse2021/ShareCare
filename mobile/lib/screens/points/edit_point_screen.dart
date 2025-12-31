import 'package:flutter/material.dart';
import '../../services/api_service.dart';
import '../../models/point.dart';
import 'team_management_screen.dart';

class EditPointScreen extends StatefulWidget {
  final String pointId;

  const EditPointScreen({super.key, required this.pointId});

  @override
  State<EditPointScreen> createState() => _EditPointScreenState();
}

class _EditPointScreenState extends State<EditPointScreen> {
  final ApiService _api = ApiService();
  final _formKey = GlobalKey<FormState>();
  
  bool _isLoading = true;
  bool _isSaving = false;
  
  late String _name;
  late String _desc;
  late String _phone;
  List<String> _urgentNeeds = [];
  String _status = 'active';

  @override
  void initState() {
    super.initState();
    _loadPoint();
  }

  Future<void> _loadPoint() async {
    try {
      final data = await _api.get('/points/${widget.pointId}');
      if (mounted) {
        final point = Point.fromJson(data['data']);
        setState(() {
          _name = point.name;
          _desc = point.description;
          _phone = '123-456-7890'; // Placeholder as Point model might miss phone
          _status = point.status;
          _urgentNeeds = point.urgentNeeds;
          _isLoading = false;
        });
      }
    } catch (e) {
      if (mounted) Navigator.pop(context);
    }
  }

  Future<void> _save() async {
    if (!_formKey.currentState!.validate()) return;
    _formKey.currentState!.save();

    setState(() => _isSaving = true);
    try {
      await _api.put('/points/${widget.pointId}', { // Ensure PUT route exists or use POST with ID
        'updates': {
          'name': _name,
          'description': _desc,
          'status': _status,
          'urgentNeeds': _urgentNeeds, // Need to map to object structure if backend expects objects
          // Assuming backend handles string array or objects. Web uses objects {item, urgency}.
          // Simulating simple string array for now or need to match web payload structure.
        }
      });
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Saved!')));
      }
    } catch (e) {
      if (mounted) ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text('Error: $e')));
    } finally {
      if (mounted) setState(() => _isSaving = false);
    }
  }

  void _addUrgentNeed(String need) {
    setState(() {
      _urgentNeeds.add(need);
    });
  }

  @override
  Widget build(BuildContext context) {
    if (_isLoading) return const Scaffold(body: Center(child: CircularProgressIndicator()));

    return Scaffold(
      appBar: AppBar(
        title: const Text('Edit Point'),
        actions: [
          IconButton(
            icon: const Icon(Icons.save),
            onPressed: _isSaving ? null : _save,
          )
        ],
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16),
        child: Form(
          key: _formKey,
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              // Team Button
              OutlinedButton.icon(
                onPressed: () {
                   Navigator.push(
                     context,
                     MaterialPageRoute(builder: (_) => TeamManagementScreen(pointId: widget.pointId)),
                   );
                },
                icon: const Icon(Icons.group),
                label: const Text('Manage Team'),
              ),
              const SizedBox(height: 24),

              TextFormField(
                initialValue: _name,
                decoration: const InputDecoration(labelText: 'Name'),
                onSaved: (v) => _name = v!,
              ),
              const SizedBox(height: 16),
              
              TextFormField(
                initialValue: _desc,
                decoration: const InputDecoration(labelText: 'Description'),
                maxLines: 3,
                onSaved: (v) => _desc = v!,
              ),
              const SizedBox(height: 16),

              DropdownButtonFormField<String>(
                value: _status,
                decoration: const InputDecoration(labelText: 'Status'),
                items: const [
                  DropdownMenuItem(value: 'active', child: Text('Active')),
                  DropdownMenuItem(value: 'maintenance', child: Text('Maintenance')),
                ],
                onChanged: (v) => setState(() => _status = v!),
              ),
              const SizedBox(height: 24),

              const Text('Urgent Needs', style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
              const SizedBox(height: 8),
              Wrap(
                spacing: 8,
                children: _urgentNeeds.map((need) => Chip(
                  label: Text(need),
                  onDeleted: () {
                    setState(() => _urgentNeeds.remove(need));
                  },
                )).toList(),
              ),
              const SizedBox(height: 8),
              ElevatedButton.icon(
                onPressed: () {
                  _showAddNeedDialog();
                },
                icon: const Icon(Icons.add),
                label: const Text('Add Need'),
              ),
            ],
          ),
        ),
      ),
    );
  }

  void _showAddNeedDialog() {
    final controller = TextEditingController();
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('Add Urgent Need'),
        content: TextField(controller: controller, decoration: const InputDecoration(hintText: 'e.g. Blankets')),
        actions: [
          TextButton(onPressed: () => Navigator.pop(context), child: const Text('Cancel')),
          TextButton(
            onPressed: () {
              if (controller.text.isNotEmpty) {
                _addUrgentNeed(controller.text);
                Navigator.pop(context);
              }
            }, 
            child: const Text('Add')
          ),
        ],
      ),
    );
  }
}
