import 'package:flutter/material.dart';

class FilterWidget extends StatefulWidget {
  final Function(Map<String, dynamic>) onFilterChanged;
  final Function(String) onSearch;

  const FilterWidget({
    super.key, 
    required this.onFilterChanged,
    required this.onSearch,
  });

  @override
  State<FilterWidget> createState() => _FilterWidgetState();
}

class _FilterWidgetState extends State<FilterWidget> {
  final TextEditingController _searchController = TextEditingController();
  
  // Filter States
  String _selectedType = 'all';
  double _distance = 10.0;
  String _status = 'active';
  String _sortBy = 'nearest';

  void _applyFilters() {
    widget.onFilterChanged({
      'type': _selectedType,
      'radius': _distance,
      'status': _status,
      'sort': _sortBy,
    });
  }

  void _showAdvancedFilters() {
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      builder: (context) => StatefulBuilder(
        builder: (context, setModalState) {
          return Padding(
            padding: const EdgeInsets.all(24.0),
            child: Column(
              mainAxisSize: MainAxisSize.min,
              crossAxisAlignment: CrossAxisAlignment.stretch,
              children: [
                Text(
                  'Filters', 
                  style: Theme.of(context).textTheme.headlineSmall,
                ),
                const SizedBox(height: 24),
                
                // Distance Slider
                Text('Distance: ${_distance.toInt()} km'),
                Slider(
                  value: _distance,
                  min: 1,
                  max: 50,
                  divisions: 49,
                  label: '${_distance.toInt()} km',
                  onChanged: (val) {
                    setModalState(() => _distance = val);
                  },
                ),
                const SizedBox(height: 16),
                
                // Status Dropdown
                DropdownButtonFormField<String>(
                  value: _status,
                  decoration: const InputDecoration(labelText: 'Status'),
                  items: const [
                    DropdownMenuItem(value: 'active', child: Text('Available')),
                    DropdownMenuItem(value: 'all', child: Text('All')),
                  ],
                  onChanged: (val) => setModalState(() => _status = val!),
                ),
                const SizedBox(height: 16),

                // Sort Dropdown
                DropdownButtonFormField<String>(
                  value: _sortBy,
                  decoration: const InputDecoration(labelText: 'Sort By'),
                  items: const [
                    DropdownMenuItem(value: 'nearest', child: Text('Nearest')),
                    DropdownMenuItem(value: 'newest', child: Text('Newest')),
                    DropdownMenuItem(value: 'urgency', child: Text('Urgency')),
                  ],
                  onChanged: (val) => setModalState(() => _sortBy = val!),
                ),
                const SizedBox(height: 32),
                
                ElevatedButton(
                  onPressed: () {
                    Navigator.pop(context);
                    setState(() {}); // Update main widget UI if needed
                    _applyFilters();
                  },
                  child: const Text('Apply Filters'),
                ),
                const SizedBox(height: 16),
              ],
            ),
          );
        },
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Column(
      children: [
        // Search Bar & Filter Button
        Padding(
          padding: const EdgeInsets.all(16.0),
          child: Row(
            children: [
              Expanded(
                child: TextField(
                  controller: _searchController,
                  decoration: InputDecoration(
                    hintText: 'Search...',
                    prefixIcon: const Icon(Icons.search),
                    border: OutlineInputBorder(
                      borderRadius: BorderRadius.circular(30),
                    ),
                    contentPadding: const EdgeInsets.symmetric(horizontal: 20),
                  ),
                  onSubmitted: widget.onSearch,
                ),
              ),
              const SizedBox(width: 8),
              IconButton.filledTonal(
                icon: const Icon(Icons.tune),
                onPressed: _showAdvancedFilters,
              ),
            ],
          ),
        ),

        // Quick Types (Horizontal Chips)
        SizedBox(
          height: 40,
          child: ListView(
            scrollDirection: Axis.horizontal,
            padding: const EdgeInsets.symmetric(horizontal: 16),
            children: [
              _buildTypeChip('all', 'All'),
              const SizedBox(width: 8),
              _buildTypeChip('food', 'Food'),
              const SizedBox(width: 8),
              _buildTypeChip('clothes', 'Clothes'),
              const SizedBox(width: 8),
              _buildTypeChip('essentials', 'Essentials'),
              const SizedBox(width: 8),
              _buildTypeChip('donation_point', '📍 Points'),
            ],
          ),
        ),
        const SizedBox(height: 8), // Spacing below chips
      ],
    );
  }

  Widget _buildTypeChip(String value, String label) {
    final isSelected = _selectedType == value;
    return ChoiceChip(
      label: Text(label),
      selected: isSelected,
      onSelected: (bool selected) {
        if (selected) {
          setState(() {
            _selectedType = value;
          });
          _applyFilters();
        }
      },
      selectedColor: Theme.of(context).primaryColorContainer,
      labelStyle: TextStyle(
        color: isSelected ? Theme.of(context).primaryColor : null,
      ),
    );
  }
}
