import 'dart:async';
import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:http/http.dart';
import 'package:crypto/crypto.dart';
import 'dart:io' show Platform;
import '../models/DataModels.dart';

enum AuthStatus {
  notLoggedIn,
  notRegistered,
  loggedIn,
  registered,
  authenticating,
  registering,
  loggedOut,
  resettingPassword,
  notResettingPassword,
  verifyingEmail
}

class AuthProvider with ChangeNotifier {

  final String basePath = 'https://poos-group16-largeproject-a2c1e4b41bdb.herokuapp.com/api';
  // for testing api locally
  // final String basePath = Platform.isAndroid ? 'http://10.0.2.2:5000/api' : 'http://localhost:5000/api';

  AuthStatus _loggedInStatus = AuthStatus.notLoggedIn;
  AuthStatus _registeredInStatus = AuthStatus.notRegistered;
  AuthStatus _resettingPasswordStatus = AuthStatus.notResettingPassword;

  AuthStatus get loggedInStatus => _loggedInStatus;
  AuthStatus get registeredInStatus => _registeredInStatus;
  AuthStatus get resettingPasswordStatus => _resettingPasswordStatus;

  String encryptPassword(String password) {
    final bytes = utf8.encode(password);
    final hash = sha256.convert(bytes);
    return hash.toString();
  }

  Future<Map<String, dynamic>> login(String email, String password) async {
    var result;

    _loggedInStatus = AuthStatus.authenticating;
    notifyListeners();

    // encrypt password
    String encryptedPass = encryptPassword(password);

    try {
      Response response = await post(
        Uri.parse('$basePath/account/login'),
        headers: <String, String>{
          'Content-Type': 'application/json; charset=UTF-8',
        },
        body: jsonEncode(<String, String>{
          'login': email,
          'password': encryptedPass,
        }),
      );

      print(json.decode(response.body));

      if (response.statusCode == 200) {
        User authUser = User.fromJson(jsonDecode(response.body) as Map<String, dynamic>);
        _loggedInStatus = AuthStatus.loggedIn;
        notifyListeners();

        result = {'status': true, 'message': 'Successful', 'user': authUser};
      } else {
        _loggedInStatus = AuthStatus.notLoggedIn;
        notifyListeners();
        result = {
          'status': false,
          'message': json.decode(response.body)['error']
        };
      }
    } catch (e) {
      _loggedInStatus = AuthStatus.notLoggedIn;
      notifyListeners();
      onError(e);
    }

    return result;
  }

  Future<Map<String, dynamic>> checkExists(String email, String username) async {
    var result;
    _registeredInStatus = AuthStatus.registering;
    notifyListeners();

    Response response = await post(
      Uri.parse('$basePath/account/checkExists'),
      headers: <String, String> {
        'Content-Type': 'application/json; charset=UTF-8',
      },
      body: jsonEncode(<String, String> {
        'login': username,
        'email' : email,
      }),
    );

    var json = jsonDecode(response.body) as Map<String, dynamic>;

    if (response.statusCode == 200) {
      result = {
        'status' : true,
        'message' : json['error'] as String,
      };
    } else {
      result = {
        'status' : false,
        'message' : 'Unsuccessful Request',
      };
    }
    return result;
  }

  Future<Map<String, dynamic>> register(Map<String, dynamic> userData) async {
    _registeredInStatus = AuthStatus.registering;
    notifyListeners();
    // copy userData to payload
    Map payload = Map.from(userData);

    //encrypt password
    payload['password'] = encryptPassword(userData['password']);

    var result = await post(
      Uri.parse('$basePath/account/register'),
      headers: <String, String> {
        'Content-Type' : 'application/json; charset=UTF-8',
      },
      body: jsonEncode(payload),)
    .then(onValue)
    .catchError(onError);

    _registeredInStatus = result['status']
        ? AuthStatus.verifyingEmail
        : AuthStatus.notRegistered;
    notifyListeners();

    return result;
  }

  static Future<Map<String, dynamic>> onValue(Response response) async {
    var result;
    final Map<String, dynamic> responseData = json.decode(response.body);
    print(responseData);
    if (response.statusCode == 200 && responseData['acknowledged']) {
      result = {
        'status': true,
        'message': 'Successfully registered',
      };
    } else {
      result = {
        'status': false,
        'message': 'Registration failed',
      };
    }
    print(result);
    return result;
  }

  static onError(error) {
    print("the error is $error.detail");
    return {'status': false, 'message': 'Unsuccessful Request', 'data': error};
  }

  Future<Map<String, dynamic>> sendPasswordResetEmail(String email) async {
    var result;
    _resettingPasswordStatus = AuthStatus.verifyingEmail;
    notifyListeners();

    Response response = await post(
      Uri.parse('$basePath/account/passwordReset'),
      headers: <String, String> {
        'Content-Type': 'application/json; charset=UTF-8',
      },
      body: jsonEncode(<String, String> {
        'email': email,
      }),
    );

    if (response.statusCode == 200) {
      result = {
        'status': true,
        'message': 'Successful',
        'code': json.decode(response.body)['verfCode'],
        'userID' : json.decode(response.body)['UserId']
      };
    } else {
      result = {
        'status': false,
        'message': 'No account associated with this email'
      };
    }
    _resettingPasswordStatus = AuthStatus.notResettingPassword;
    notifyListeners();
    return result;
  }

  Future<Map<String, dynamic>> resetPassword(String newPassword, String userID) async {
    var result;
    _resettingPasswordStatus = AuthStatus.resettingPassword;
    notifyListeners();

    // encrypt password
    String encryptedPass = encryptPassword(newPassword);

    Response response = await put(
      Uri.parse('$basePath/account/passwordReset/$userID'),
      headers: <String, String> {
        'Content-Type': 'application/json; charset=UTF-8',
      },
      body: jsonEncode(<String, String> {
        'password': encryptedPass,
      }),
    );

    if (response.statusCode == 200) {
      result = { 'status' : true, 'message' : json.decode(response.body)['message'] };
    } else {
      result = { 'status' : true, 'message' : json.decode(response.body)['error'] };
    }

    _resettingPasswordStatus = AuthStatus.notResettingPassword;
    notifyListeners();
    return result;
  }

}