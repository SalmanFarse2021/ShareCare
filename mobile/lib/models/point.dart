class Point {
  final String id;
  final String name;
  final String description;
  final String address;
  final double lat;
  final double lng;
  final String status; // active, pending, etc.
  final List<String> urgentNeeds;

  Point({
    required this.id,
    required this.name,
    required this.description,
    required this.address,
    required this.lat,
    required this.lng,
    this.status = 'active',
    this.urgentNeeds = const [],
  });

  factory Point.fromJson(Map<String, dynamic> json) {
    return Point(
      id: json['_id'] ?? '',
      name: json['name'] ?? '',
      description: json['description'] ?? '',
      address: json['address'] ?? '',
      lat: (json['location']?['coordinates']?[1] ?? 0.0).toDouble(),
      lng: (json['location']?['coordinates']?[0] ?? 0.0).toDouble(),
      status: json['status'] ?? 'active',
      urgentNeeds: (json['urgentNeeds'] as List?)?.map((e) => e.toString()).toList() ?? [],
    );
  }
}
