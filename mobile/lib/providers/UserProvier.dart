import 'package:flutter/foundation.dart';
import '../models/DataModels.dart';

class UserProvider with ChangeNotifier {
  late User _user;
  late String _resetID; // for resetting password

  User get user => _user;
  String get resetID => _resetID;

  void setUser(User user) {
    _user = user;
    notifyListeners();
  }

  void setResetID(String resetID) {
    _resetID = resetID;
    notifyListeners();
  }

  User getUser() {
    return _user;
  }

  String getResetID() {
    return _resetID;
  }
}