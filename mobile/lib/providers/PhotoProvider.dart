import 'dart:convert';
import 'dart:core';
import 'dart:io' show Platform;

import 'package:flutter/widgets.dart';
import 'package:http/http.dart';
import '../models/DataModels.dart';

enum PhotoStatus {
  notLoadingPhotos,
  loadingPhotos,
  loadSuccessful,
  loadFailure,
}

class PhotoProvider with ChangeNotifier {
  final String basePath = 'https://poos-group16-largeproject-a2c1e4b41bdb.herokuapp.com/api';

  /*final String basePath = Platform.isAndroid
      ? 'http://10.0.2.2:5000/api'
      : 'http://localhost:5000/api';*/

  final List<Photo> _photos = [];

  PhotoStatus _loadingPhotosStatus = PhotoStatus.notLoadingPhotos;

  PhotoStatus get loadingPhotosStatus => _loadingPhotosStatus;

  List<Photo> get photos => _photos;

  void addPhoto(Photo photo) {
    _photos.add(photo);
    notifyListeners();
  }

  void addAllPhoto(List<Photo> photos) {
    _photos.addAll(photos);
    notifyListeners();
  }

  void clearAndAddPhoto(Photo photo) {
    _photos.clear();
    _photos.add(photo);
    notifyListeners();
  }

  void clearAndSetPhotos(List<Photo> photos) {
    _photos.clear();
    _photos.addAll(photos);
    notifyListeners();
  }

  void removePhotoAt(int index) {
    _photos.removeAt(index);
    notifyListeners();
  }

  Future<Map<String, dynamic>> fetchPhoto(String pinID, String token) async {
    var result;

    _loadingPhotosStatus = PhotoStatus.loadingPhotos;
    notifyListeners();

    print(pinID);
    print(token);

    Response response = await post(
      Uri.parse('$basePath/pins/read'),
      headers: <String, String>{
        'Content-Type': 'application/json; charset=UTF-8',
      },
      body: jsonEncode(<String, String> {
        '_id': pinID,
        'jwtToken' : token,
      }),
    );

    final jsonBody = jsonDecode(response.body);
    print(jsonBody);
    if (response.statusCode == 200) {
      // TODO make iterable in the case of loading multiple photos
      Photo photos = Photo.fromBase64String(
        jsonBody['ret']['temp']['Photo'],
        jsonBody['ret']['temp']['EntryDesc'],
        jsonBody['ret']['temp']['_id'],
      );

      _loadingPhotosStatus = PhotoStatus.loadSuccessful;
      notifyListeners();

      clearAndAddPhoto(photos);

      result = {
        'status': true,
        'message': 'Successfully loaded Photos',
        'token' : jsonBody['jwtToken']['accessToken'],
      };
    } else {
      result = {
        'status': false,
        'message': 'Failed to load Photos',
      };
    }

    return result;
  }
}