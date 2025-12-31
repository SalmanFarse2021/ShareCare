import 'package:flutter/material.dart';
import 'package:google_maps_flutter/google_maps_flutter.dart';

class MapPickerScreen extends StatefulWidget {
  final LatLng? initialLocation;

  const MapPickerScreen({super.key, this.initialLocation});

  @override
  State<MapPickerScreen> createState() => _MapPickerScreenState();
}

class _MapPickerScreenState extends State<MapPickerScreen> {
  late CameraPosition _cameraPosition;
  GoogleMapController? _mapController;
  bool _isLoading = false;

  @override
  void initState() {
    super.initState();
    _cameraPosition = CameraPosition(
      target: widget.initialLocation ?? const LatLng(37.7749, -122.4194), // SF Default
      zoom: 14,
    );
  }

  void _onCameraMove(CameraPosition position) {
    _cameraPosition = position;
  }

  void _confirmLocation() {
    // Return approximate address logic can be added here using Geocoding
    // For now returning coordinates
    Navigator.pop(context, {
      'lat': _cameraPosition.target.latitude,
      'lng': _cameraPosition.target.longitude,
      'address': 'Approximate Location' // Placeholder for geocoded address
    });
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Select Location'),
        actions: [
          IconButton(
            icon: const Icon(Icons.check),
            onPressed: _confirmLocation,
          ),
        ],
      ),
      body: Stack(
        children: [
          GoogleMap(
            initialCameraPosition: _cameraPosition,
            myLocationEnabled: true,
            myLocationButtonEnabled: true,
            onMapCreated: (controller) => _mapController = controller,
            onCameraMove: _onCameraMove,
          ),
          const Center(
            child: Icon(Icons.location_pin, size: 50, color: Colors.red),
          ),
          Positioned(
            bottom: 24,
            left: 16,
            right: 16,
            child: ElevatedButton(
              onPressed: _confirmLocation,
              style: ElevatedButton.styleFrom(
                padding: const EdgeInsets.symmetric(vertical: 16),
              ),
              child: const Text('Confirm Location'),
            ),
          ),
        ],
      ),
    );
  }
}
