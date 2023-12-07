import 'package:flutter/material.dart';
import 'package:provider/provider.dart';

import '../providers/AuthProvider.dart';
import '../providers/UserProvier.dart';
import '../utils/validators.dart';
import '../widgets/FormLoadingIndicator.dart';
import '../widgets/PasswordProgress.dart';

class ResetPassword extends StatefulWidget {
  const ResetPassword({Key? key}) : super(key: key);

  @override
  State<ResetPassword> createState() => _ResetPasswordState();
}

class _ResetPasswordState extends State<ResetPassword> {
  final formKey = GlobalKey<FormState>();

  final _passwordController = TextEditingController();
  final _confirmPassController = TextEditingController();

  //password strength
  double _pwStrength = 0;
  String _pwDisplay = 'Please enter you password';
  bool _pwFieldIsSelected = false;
  bool _pwIsObscured = true;
  FocusNode _pwFocus = FocusNode();

  void _handlePasswordFocus() {
    if (_pwFieldIsSelected == false) {
      setState(() {
        _pwFieldIsSelected = _pwFocus.hasFocus;
      });
    }
  }

  void checkPasswordStrength(String value) {
    Map<String, dynamic> pwDetails = validatePassword(_passwordController.text);
    setState(() {
      _pwStrength = pwDetails['strength'];
      _pwDisplay = pwDetails['message'];
    });
  }

  String? validateEquality(String? value) {
     return (_passwordController.text.isEmpty || _confirmPassController.text.isEmpty)
      ? 'Password can not be left empty'
      : _passwordController.text != _confirmPassController.text
      ? 'Passwords do not match'
      : null;
  }

  @override
  void initState() {
    super.initState();
    _pwFocus.addListener(_handlePasswordFocus);
    _pwIsObscured = true;
  }

  @override
  Widget build(BuildContext context) {
    AuthProvider auth = Provider.of<AuthProvider>(context);

    handlePasswordReset() {
      final form = formKey.currentState;

      if (form!.validate()) {
        form.save();

        final String userID = Provider.of<UserProvider>(context, listen: false).getResetID();

        final Future<Map<String, dynamic>> successfulMessage =
        auth.resetPassword(_passwordController.text, userID);

        successfulMessage.then((response) {
          print('password reset response:\n');
          print(response);
          if (response['status']) {
            buildResetSuccessBottomScreen(context);
          } else {
            ScaffoldMessenger.of(context).showSnackBar(SnackBar(
              content: const Text('Something went wrong.'),
              backgroundColor: Theme.of(context).colorScheme.error
            ));
          }
        });
      } else {
        print("form is invalid");
      }
    }

    return Scaffold(
      backgroundColor: Colors.white,
      appBar: AppBar(),
      body: SingleChildScrollView(
        child: Center(
          child: Column(
            children: [
              const Padding(
                padding: EdgeInsets.only(left: 15.0, right: 15.0, top: 15, bottom: 0),
                child: Align(
                  alignment: Alignment.centerLeft,
                  child: Text(
                    'Reset\nPassword',
                    style: TextStyle(fontSize: 32, fontWeight: FontWeight.bold, height: 1),
                  ),
                ),
              ),
              const Divider(indent: 15, endIndent: 15,),
              const Padding(
                padding: EdgeInsets.only(left: 15.0, right: 15.0, top: 15, bottom: 0),
                child: Align(
                  alignment: Alignment.centerLeft,
                  child: Text(
                    'Please enter your new password.',
                    style: TextStyle(fontSize: 15),
                  ),
                ),
              ),
              Padding(
                padding: const EdgeInsets.symmetric(horizontal: 7.5),
                child: Card(
                  child: Form(
                    key: formKey,
                    child: Column(
                    children: <Widget>[
                      Padding(
                        padding: const EdgeInsets.only(left: 7.5, right: 7.5, top: 7.5, bottom: 0),
                        child:TextFormField(
                          controller: _passwordController,
                          focusNode: _pwFocus,
                          onChanged: (value) => checkPasswordStrength(value),
                          obscureText: _pwIsObscured,
                          validator: (value) =>
                            (value == null || value.isEmpty)
                              ? 'Password Can not be left empty'
                              : _pwStrength != 1
                              ? 'Please provide a valid password'
                              : null,
                          decoration: InputDecoration(
                              prefixIcon: const Icon(Icons.lock),
                              suffixIcon: IconButton(
                                padding: const EdgeInsetsDirectional.only(end: 12.0),
                                icon: _pwIsObscured ? const Icon(Icons.visibility) : const Icon(Icons.visibility_off),
                                onPressed: () {setState(() {_pwIsObscured = !_pwIsObscured;});},
                              ),
                              border: const OutlineInputBorder(),
                              labelText: 'Password',
                              hintText: 'Enter your password'
                          ),
                        ),
                      ),
                      Padding(
                        padding: const EdgeInsets.only(left: 7.5, right: 7.5, top: 15, bottom: 7.5),
                        child: TextFormField(
                          controller: _confirmPassController,
                          obscureText: _pwIsObscured,
                          validator: validateEquality,
                          decoration: InputDecoration(
                            prefixIcon: const Icon(Icons.lock),
                            suffixIcon: IconButton(
                              padding: const EdgeInsetsDirectional.only(end: 12.0),
                              icon: _pwIsObscured ? const Icon(Icons.visibility) : const Icon(Icons.visibility_off),
                              onPressed: () {setState(() {_pwIsObscured = !_pwIsObscured;});},
                            ),
                            border: const OutlineInputBorder(),
                            labelText: 'Confirm Password',
                            hintText: 'Confirm your password'
                          ),
                        ),
                      ),
                      if (_pwFieldIsSelected)
                        PasswordProgressIndicator(
                            pwStrength: _pwStrength,
                            pwDisplay: _pwDisplay
                        ),

                    ],
                  ),
                  ),
                ),
              ),
              Padding(
                padding: const EdgeInsets.only(
                    left: 15.0, right: 15.0, top: 15.0, bottom: 7.5),
                child: auth.resettingPasswordStatus == AuthStatus.resettingPassword
                      ? const FormLoadingIndicator(message: " Resetting Password ... Please wait")
                      : SizedBox(
                    height: 50,
                    width: 250,
                    child: FilledButton(
                      onPressed: handlePasswordReset,
                      style: ElevatedButton.styleFrom(fixedSize: const Size(200, 50)),
                      child: const Text(
                        'Reset Password', style: TextStyle(fontSize: 18),
                      ),
                    ),
                  ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  static Future<dynamic> buildResetSuccessBottomScreen(BuildContext context) {
    return showModalBottomSheet(
        context: context,
        isScrollControlled: true,
        isDismissible: false,
        shape: const RoundedRectangleBorder(borderRadius: BorderRadius.vertical(top: Radius.circular(20.0))),
        builder: (context) => FractionallySizedBox(
          heightFactor: 0.9,
          child: Container(
            padding: const EdgeInsets.all(15.0),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.center,
              children: <Widget>[
                Padding(
                  padding: const EdgeInsets.only(top: 60.0, bottom: 15.0, left: 15.0),
                  child: Center(
                    child: Icon(Icons.verified_user, size: 150, color: Theme.of(context).colorScheme.primary,),
                  ),
                ),
                const Padding(
                  padding: EdgeInsets.only(left: 15.0, right: 15.0, top: 15, bottom: 0),
                  child: Align(
                    alignment: Alignment.center,
                    child: Text(
                      'Your Password Has Been Reset',
                      style: TextStyle(fontSize: 32, fontWeight: FontWeight.bold, height: 1),
                    ),
                  ),
                ),
                const Divider(indent: 15, endIndent: 15,),
                const Padding(
                  padding: EdgeInsets.only(left: 15.0, right: 15.0, top: 15, bottom: 15.0),
                  child: Align(
                    alignment: Alignment.center,
                    child: Text(
                      'You can now log in with your new password. Click Continue to be taken back to the login page.',
                      style: TextStyle(fontSize: 15),
                    ),
                  ),
                ),
                SizedBox(
                  height: 50,
                  width: 250,
                  child: FilledButton(
                    onPressed: () {
                      Navigator.pop(context);
                      Navigator.pushReplacementNamed(context, '/login');
                    },
                    style: ElevatedButton.styleFrom(fixedSize: const Size(200, 50)),
                    child: const Text(
                      'Continue',
                      style: TextStyle(fontSize: 18),
                    ),
                  ),
                ),
              ],
            ),
          ),
        ),
      );
  }
}

