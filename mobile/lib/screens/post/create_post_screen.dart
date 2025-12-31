import 'dart:io';
import 'package:flutter/material.dart';
import 'package:image_picker/image_picker.dart';
import '../../services/api_service.dart';
import '../map/map_picker_screen.dart';

class CreatePostScreen extends StatefulWidget {
  const CreatePostScreen({super.key});

  @override
  State<CreatePostScreen> createState() => _CreatePostScreenState();
}

class _CreatePostScreenState extends State<CreatePostScreen> {
  final _formKey = GlobalKey<FormState>();
  final _titleController = TextEditingController();
  final _descController = TextEditingController();
  String _type = 'OFFER';
  bool _isLoading = false;
  File? _selectedImage;
  Map<String, double>? _location;
  final ImagePicker _picker = ImagePicker();

  Future<void> _pickImage() async {
    final XFile? image = await _picker.pickImage(source: ImageSource.gallery);
    if (image != null) {
      setState(() {
        _selectedImage = File(image.path);
      });
    }
  }

  Future<void> _submit() async {
    if (_formKey.currentState!.validate()) {
      setState(() => _isLoading = true);
      try {
        final api = ApiService();
        String? imageUrl;

        // Upload Image if selected
        if (_selectedImage != null) {
          imageUrl = await api.uploadImage(_selectedImage!.path);
        }

        await api.post('/posts', {
          'title': _titleController.text,
          'description': _descController.text,
          'type': _type,
          'images': imageUrl != null ? [imageUrl] : [],
          'location': _location ?? {'lat': 37.77, 'lng': -122.41},
        });
        
        if (mounted) {
          ScaffoldMessenger.of(context).showSnackBar(
            const SnackBar(content: Text('Post created successfully!')),
          );
          Navigator.pop(context); // Or reset form
        }
      } catch (e) {
        if (mounted) {
          ScaffoldMessenger.of(context).showSnackBar(
            SnackBar(content: Text('Failed: $e')),
          );
        }
      } finally {
        if (mounted) setState(() => _isLoading = false);
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Create Post')),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16.0),
        child: Form(
          key: _formKey,
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              SegmentedButton<String>(
                segments: const [
                  ButtonSegment(value: 'OFFER', label: Text('Offering')),
                  ButtonSegment(value: 'REQUEST', label: Text('Requesting')),
                ],
                selected: {_type},
                onSelectionChanged: (Set<String> newSelection) {
                  setState(() => _type = newSelection.first);
                },
              ),
              const SizedBox(height: 24),

              TextFormField(
                controller: _titleController,
                decoration: const InputDecoration(
                  labelText: 'Title',
                  border: OutlineInputBorder(),
                ),
                validator: (value) => value!.isEmpty ? 'Required' : null,
              ),
              const SizedBox(height: 16),

              TextFormField(
                controller: _descController,
                decoration: const InputDecoration(
                  labelText: 'Description',
                  border: OutlineInputBorder(),
                ),
                maxLines: 4,
                validator: (value) => value!.isEmpty ? 'Required' : null,
              ),
              const SizedBox(height: 24),

              // Image Picker
              if (_selectedImage != null)
                Stack(
                  alignment: Alignment.topRight,
                  children: [
                    Image.file(
                      _selectedImage!, 
                      height: 200, 
                      width: double.infinity, 
                      fit: BoxFit.cover
                    ),
                    IconButton(
                      icon: const Icon(Icons.close, color: Colors.white),
                      onPressed: () => setState(() => _selectedImage = null),
                      style: IconButton.styleFrom(backgroundColor: Colors.black54),
                    ),
                  ],
                ),
              
              if (_selectedImage == null)
                OutlinedButton.icon(
                  onPressed: _pickImage,
                  icon: const Icon(Icons.add_a_photo),
                  label: const Text('Add Photo'),
                  style: OutlinedButton.styleFrom(
                    padding: const EdgeInsets.symmetric(vertical: 16),
                  ),
                ),
              
              const SizedBox(height: 16),
              
              // Location Picker
              ListTile(
                leading: const Icon(Icons.location_on),
                title: const Text('Location'),
                subtitle: Text(_location != null 
                    ? 'Lat: ${_location!['lat'].toStringAsFixed(3)}, Lng: ${_location!['lng'].toStringAsFixed(3)}' 
                    : 'Select Location'),
                trailing: const Icon(Icons.chevron_right),
                contentPadding: EdgeInsets.zero,
                onTap: () async {
                  final result = await Navigator.push(
                    context,
                    MaterialPageRoute(builder: (_) => const MapPickerScreen()),
                  );
                  if (result != null) {
                    setState(() => _location = result);
                  }
                },
              ),
              const SizedBox(height: 32),

              ElevatedButton(
                onPressed: _isLoading ? null : _submit,
                style: ElevatedButton.styleFrom(
                  padding: const EdgeInsets.symmetric(vertical: 16),
                ),
                child: _isLoading 
                    ? const CircularProgressIndicator() 
                    : const Text('Post'),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
