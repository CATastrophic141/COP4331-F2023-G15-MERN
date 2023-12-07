import 'dart:convert';
import 'dart:io';
import 'dart:typed_data';
import 'package:image_size_getter/file_input.dart';
import 'package:latlong2/latlong.dart';
import 'package:image_size_getter/image_size_getter.dart';

class User {

  final String userID;
  final String firstName;
  final String lastName;
  //TODO remove LocalPhoto array without breaking
  final List<Pin> pins;
  String token;

  User({required this.userID, required this.firstName, required this.lastName, required this.pins, required this.token});

  factory User.fromJson(Map<String, dynamic> json) {
    return User(
      userID: json['UserId'] as String,
      firstName: json['FirstName'] as String,
      lastName: json['LastName'] as String,
      token: json['Token']['accessToken'],
      pins: [],
    );
  }

  factory User.fromMap(Map<String, dynamic> map) {
    return User(
      userID: map['userId'] as String,
      firstName: map['firstName'] as String,
      lastName: map['lastName'] as String,
      token: map['Token'] as String,
      pins: [],
    );
  }

  void addPin(Pin pin) {
    pins.add(pin);
  }

  void setPins(List<Pin> pinList) {
    pins.clear();
    pins.addAll(pinList);
  }

  void setToken(String newToken) {
    token = newToken;
  }

}

class Photo {
  String pinID;
  Uint8List bytesImage;
  Size dimensions;
  String? description;

  Photo({required this.pinID, required this.bytesImage, required this.dimensions, this.description});

  factory Photo.fromBase64String(String base64String, String? description, String key) {
    final Uint8List bytes = const Base64Decoder().convert(base64String.split(',').last);
    return Photo(
      pinID: key,
      bytesImage: bytes,
      dimensions: ImageSizeGetter.getSize(MemoryInput(bytes)),
      description: description,
    );
  }

  factory Photo.fromFile(File file, String? description, String key) {
    return Photo(
      pinID: key,
      bytesImage: file.readAsBytesSync(),
      dimensions: ImageSizeGetter.getSize(FileInput(file)),
      description: description,
    );
  }

  String convertToBase64() {
    return const Base64Encoder().convert(bytesImage);
  }

  String convertFileToBase64(File file) {
    return const Base64Encoder().convert(file.readAsBytesSync());
  }

}

class Pin {
  final String name;
  final LatLng coordinates;

  Pin({required this.name, required this.coordinates});

  factory Pin.fromJson(Map<String, dynamic> json) {
    return Pin(
      name: json['EntryName'],
      coordinates: LatLng(json['Latitude'].toDouble() * 1.0, json['Longitude'] * 1.0),
    );
  }

  LatLng getLatLongFromFloat(double lat, double long) {
    return LatLng(lat, long);
  }
}
