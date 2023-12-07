
String? validateEmail(String? value) {
  String msg = '';
  RegExp regex = RegExp(
      r'^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$'
  );
  if (value == null || !regex.hasMatch(value)) {
    msg = "Please provide a valid email address";
  }
  return msg == '' ? null : msg;
}

Map<String, dynamic> validatePassword(String value) {
  double strength = 1.0;
  String msg = 'Very strong password!';
  RegExp numReg = RegExp(r".*[0-9].*");
  RegExp lowCaseReg = RegExp(r".*[a-z].*");
  RegExp upCaseReg = RegExp(r".*[A-Z].*");
  RegExp specialReg = RegExp(r'.*[!@#$%^&*(),.?":{}|<>].*');

  if (value.isEmpty) {
    strength = 0;
    msg = 'Please enter you password';
  } else {
    if (!specialReg.hasMatch(value)) {
      strength -= 0.2;
      msg = "Password must contain a special character";
    }
    if (!numReg.hasMatch(value)) {
      strength -= 0.2;
      msg = "Password must contain a number";
    }
    if (!upCaseReg.hasMatch(value)) {
      strength -= 0.2;
      msg = "Password must contain an uppercase letter";
    }
    if (!lowCaseReg.hasMatch(value)) {
      strength -= 0.2;
      msg = "Password must contain a lowercase letter";
    }
    if (value.length < 6) {
      strength -= 0.2;
      msg = "Password must have at least 6 character";
    }
  }

  Map<String, dynamic> pwDetails = {
    'strength' : strength,
    'message' : msg,
  };

  return pwDetails;
}

String? validateCoordinates(String? value) {
  RegExp regex = RegExp(r'^(-?(\d{1,3})(\.\d+)?,?\s*){2}$');

  if (value == null || !regex.hasMatch(value)) {
    return "Invalid Lat/Long input";
  } else {
    return null;
  }
}