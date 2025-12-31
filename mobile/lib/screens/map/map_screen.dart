import 'package:flutter/material.dart';
import 'package:google_maps_flutter/google_maps_flutter.dart';

class MapScreen extends StatefulWidget {
  const MapScreen({super.key});

  @override
  State<MapScreen> createState() => _MapScreenState();
}

class _MapScreenState extends State<MapScreen> {
  static const CameraPosition _kInitialPosition = CameraPosition(
    target: LatLng(37.7749, -122.4194), // San Francisco Placeholder
    zoom: 14.4746,
  );

  @override
  Widget build(BuildContext context) {
    return const Scaffold(
      body: GoogleMap(
        mapType: MapType.normal,
        initialCameraPosition: _kInitialPosition,
        myLocationEnabled: true,
        myLocationButtonEnabled: true,
        // markers: Set<Marker>.of(_markers),
      ),
    );
  }
}
