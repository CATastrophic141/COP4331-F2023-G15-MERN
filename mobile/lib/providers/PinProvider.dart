import 'dart:convert';
import 'dart:core';
import 'dart:io' show Platform;
import 'package:flutter/widgets.dart';
import 'package:http/http.dart';
import '../models/DataModels.dart';

enum PinStatus {
  notLoadingPins,
  notUploadingPin,
  notEditingPin,
  loadingPins,
  uploadingPin,
  uploadSuccessful,
  uploadFailure,
  editingPhoto,
  editSuccessful,
  editFailure,
}

class PinProvider with ChangeNotifier {

  final String basePath = 'https://poos-group16-largeproject-a2c1e4b41bdb.herokuapp.com/api';

  /*final String basePath = Platform.isAndroid
      ? 'http://10.0.2.2:5000/api'
      : 'http://localhost:5000/api';*/

  PinStatus _uploadingPinStatus = PinStatus.notUploadingPin;
  PinStatus _loadingPinsStatus = PinStatus.notLoadingPins;
  PinStatus _editingPinStatus = PinStatus.notEditingPin;

  PinStatus get uploadingPinStatus => _uploadingPinStatus;
  PinStatus get loadingPinsStatus => _loadingPinsStatus;
  PinStatus get editingPinStatus => _editingPinStatus;

  final Map<String, Pin> _currentPins = {};
  late Pin _pin;

  void setPin(Pin pin) {
    _pin = pin;
    notifyListeners();
  }

  Map<String, Pin> get currentPins => _currentPins;

  Pin getPin() {
    return _pin;
  }

  Pin? getPinFromKey(String key) {
    return _currentPins[key];
  }

  void putPin(String id, Pin pin) {
    _currentPins['id'] = pin;
    notifyListeners();
  }

  void addAllPins(final Map<String, Pin> pins) {
    _currentPins.addAll(pins);
    notifyListeners();
  }

  void removePin(String key) {
    _currentPins.remove(key);
    notifyListeners();
  }

  Future<Map<String, dynamic>> createPin(Map<String, dynamic> pinData) async {
    var result;
    _uploadingPinStatus = PinStatus.uploadingPin;
    notifyListeners();

    Uri path = Uri.parse('$basePath/pins/create');

    Response response = await post(
      path,
      headers: <String, String>{
        'Content-Type': 'application/json; charset=UTF-8',
      },
      body: jsonEncode(pinData),
    );

    print(json.decode(response.body));
    await Future.delayed(Duration(seconds: 2));

    if (response.statusCode == 200) {

      Pin newPin = Pin.fromJson({
        'EntryName' : pinData['entryName'],
        'Latitude' : pinData['latitude'],
        'Longitude' : pinData['longitude'],
      });

      putPin(jsonDecode(response.body)['ret']['pin']['insertedId'] as String, newPin);

      _uploadingPinStatus = PinStatus.uploadSuccessful;
      notifyListeners();
      result = {
        'status': true,
        'message': 'Successfully uploaded Pin',
        'pin' : newPin,
        'newToken': json.decode(response.body)['jwtToken']['accessToken'],
      };
    } else {
      _uploadingPinStatus = PinStatus.uploadFailure;
      notifyListeners();
      result = {
        'status': false,
        'message': 'failed to upload pin'
      };
    }

    return result;
  }

  // load pins from database
  Future<Map<String, dynamic>> retrievePins(String userID) async {
    var result;
    _loadingPinsStatus = PinStatus.loadingPins;
    notifyListeners();

    Response response = await post(
      Uri.parse('$basePath/pins/load/'),
      headers: <String, String>{
        'Content-Type': 'application/json; charset=UTF-8',
      },
      body: jsonEncode({'id' : userID})
      );

    if (response.statusCode == 200) {
      Iterable jsonBody = json.decode(response.body)['ret'];
      // convert to map
      Map<String, Pin> pins = { for (var item in jsonBody) item['_id'] : Pin.fromJson(item) };
      addAllPins(pins);
      result = {
        'status': true,
        'message': 'Successfully loaded pins.',
        'pins' : pins,
      };
    } else {
      result = {
        'status': false,
        'message': 'Failed to load pins.'
      };
    }
    _loadingPinsStatus = PinStatus.notLoadingPins;
    notifyListeners();

    return result;
  }

  Future<Map<String, dynamic>> editPin(Map<String, dynamic> pinData) async {
    var result;
    _editingPinStatus = PinStatus.editingPhoto;
    notifyListeners();

    Response response = await post(
      Uri.parse('$basePath/pins/edit'),
      headers: <String, String>{
        'Content-Type': 'application/json; charset=UTF-8',
      },
      body: jsonEncode(pinData)
    );
    print(json.decode(response.body));
    await Future.delayed(Duration(seconds: 2));

    if (response.statusCode == 200) {

      Pin newPin = Pin.fromJson({
        'EntryName' : pinData['entryName'],
        'Latitude' : pinData['latitude'],
        'Longitude' : pinData['longitude'],
      });

      putPin(pinData['_id'], newPin);

      _editingPinStatus = PinStatus.editSuccessful;
      notifyListeners();
      result = {
        'status': true,
        'message': 'Successfully uploaded edits.',
        'newToken': json.decode(response.body)['jwtToken']['accessToken'],
      };
    } else {
      _editingPinStatus = PinStatus.editFailure;
      notifyListeners();
      result = {
        'status': false,
        'message': 'Failed to upload edits.',
      };
    }

    return result;
  }

  Future<Map<String, dynamic>> deletePin(String pinID, String token) async {
    var result;
    Response response = await post(
      Uri.parse('$basePath/pins/delete'),
      headers: <String, String> {
        'Content-Type': 'application/json; charset=UTF-8',
      },
      body: jsonEncode(<String, String> {
        'id': pinID,
        'jwtToken' : token,
      }),
    );

    print(jsonDecode(response.body));

    if (response.statusCode == 200) {
      removePin(pinID);
      result = {
        'status': true,
        'message': 'Successfully Deleted',
        'newToken': json.decode(response.body)['jwtToken']['accessToken'],
      };
    } else {
      result = {
        'status': false,
        'message': 'Failed to delete',
        'newToken': json.decode(response.body)['jwtToken']['accessToken'],
      };
    }

    return result;
  }

}
