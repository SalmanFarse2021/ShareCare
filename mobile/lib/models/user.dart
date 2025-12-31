class User {
  final String id;
  final String name;
  final String email;
  final String? avatar;
  final String role;
  
  User({
    required this.id,
    required this.name,
    required this.email,
    this.avatar,
    this.role = 'user',
  });

  factory User.fromJson(Map<String, dynamic> json) {
    return User(
      id: json['_id'] ?? '',
      name: json['name'] ?? '',
      email: json['email'] ?? '',
      avatar: json['image'], // NextAuth often uses 'image'
      role: json['role'] ?? 'user',
    );
  }

  Map<String, dynamic> toJson() {
    return {
      '_id': id,
      'name': name,
      'email': email,
      'image': avatar,
      'role': role,
    };
  }
}
