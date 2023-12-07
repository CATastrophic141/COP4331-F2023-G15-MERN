import 'package:flutter/material.dart';
import 'package:geosnap/providers/AuthProvider.dart';
import 'package:geosnap/screens/Login.dart';
import 'package:geosnap/utils/validators.dart';
import 'package:geosnap/widgets/FormLoadingIndicator.dart';
import 'package:provider/provider.dart';
// TODO uncomment import for phone number validation on mobile
// import 'package:phone_number/phone_number.dart';
import '../providers/UserProvier.dart';
import '../models/DataModels.dart';
import '../widgets/PasswordProgress.dart';

class RegisterPage extends StatefulWidget {
  const RegisterPage({super.key});

  @override
  _RegisterPageState createState() => _RegisterPageState();
}

class _RegisterPageState extends State<RegisterPage> {

  final formKey = GlobalKey<FormState>();

  final _loginController = TextEditingController();
  final _emailController = TextEditingController();
  final _passwordController = TextEditingController();
  final _lastNameController = TextEditingController();
  final _firstNameController = TextEditingController();
  final _phoneController = TextEditingController();
  /*final _phoneController = PhoneNumberEditingController(
    PhoneNumberUtil(),
    behavior: PhoneInputBehavior.strict,
    regionCode: 'US',
  );*/

  // For displaying errors
  String _displayErrorText = '';

  //password strength
  double _pwStrength = 0;
  String _pwDisplay = 'Please enter you password';
  bool _pwFieldIsSelected = false;
  bool _pwIsObscured = true;
  FocusNode _pwFocus = FocusNode();

  void _handlePasswordFocus() {
    setState(() {
      _pwFieldIsSelected = _pwFocus.hasFocus;
    });
  }

  void checkPasswordStrength(String value) {
    Map<String, dynamic> pwDetails = validatePassword(_passwordController.text);
    setState(() {
      _pwStrength = pwDetails['strength'];
      _pwDisplay = pwDetails['message'];
    });
  }

  @override
  void initState() {
    super.initState();
    _pwFocus.addListener(_handlePasswordFocus);
    _pwIsObscured = true;
  }

  @override
  void dispose() {
    _loginController.dispose();
    _emailController.dispose();
    _passwordController.dispose();
    _lastNameController.dispose();
    _firstNameController.dispose();
    _phoneController.dispose();
    _pwFocus.dispose();
    super.dispose();
  }

  @override build(BuildContext) {
    AuthProvider auth = Provider.of<AuthProvider>(context);

    doRegister() {
      final form = formKey.currentState;
      if (form!.validate()) {
        form.save();

        Map<String, dynamic> userData = {
          'firstName': _firstNameController.text,
          'lastName': _lastNameController.text,
          'email': _emailController.text,
          'phone': _phoneController.text,
          'login': _loginController.text,
          'password': _passwordController.text
        };

        // check if username or email is being used
        auth.checkExists(userData['email'], userData['login']).then((response) {
          if (response['status'] && response['message'].isNotEmpty) {
            setState(() {
              _displayErrorText = response['message'];
            });
          } else {
            // register new user
            auth.register(userData).then((response) {
              if (response['status']) {

                // on register success, login with registered credentials
                final Future<Map<String, dynamic>> successfulMessage =
                auth.login(userData['login'], userData['password']);

                successfulMessage.then((response) {
                  print(response);
                  if (response['status']) {

                    User user = response['user'];
                    Provider.of<UserProvider>(context, listen: false).setUser(user);

                    // TODO change to pushReplacementNamed for production
                    Navigator.pushNamed(context, '/homepage');
                  } else {
                    // show new user login error
                    ScaffoldMessenger.of(context).showSnackBar(SnackBar(
                      content: const Text('New User Login Error: Try logging in manually.'),
                      backgroundColor: Theme.of(context).colorScheme.error,
                    ));
                  }
                });
              } else {
                // show registration error
                ScaffoldMessenger.of(context).showSnackBar(SnackBar(
                  content: const Text('Failed to Register New User'),
                  backgroundColor: Theme.of(context).colorScheme.error,
                ));
              }
            });
          }
        });

      } else {
        print("form is invalid");
      }
    }

    return Scaffold(
      appBar: AppBar(),
      body: SingleChildScrollView(
        child: Column(
          children: [
            const Padding(
              padding: EdgeInsets.only(left: 15.0, right: 15.0, top: 0, bottom: 0),
              child: Align(
                alignment: Alignment.centerLeft,
                child: Text(
                  'Create\nAccount',
                  style: TextStyle(fontSize: 32, fontWeight: FontWeight.bold, height: 1),
                ),
              ),
            ),
            const Divider(indent: 15, endIndent: 15,),
            Padding(
              padding: const EdgeInsets.symmetric(horizontal: 7.5),
              child: Card(
                child: Form(
                  key: formKey,
                  child: Column(
                    children: <Widget>[
                      if (_displayErrorText.isNotEmpty)
                        Padding(
                          padding: const EdgeInsets.only(left: 7.5, right: 7.5, top: 7.5, bottom: 0),
                          child: Align(
                            alignment: Alignment.centerLeft,
                            child: Text(
                              _displayErrorText,
                              style: const TextStyle(fontSize: 15, color: Colors.redAccent),
                            ),
                          ),
                        ),
                      Padding(
                        padding: const EdgeInsets.only(left: 7.5, right: 7.5, top: 7.5, bottom: 0),
                        child: TextFormField(
                          controller: _firstNameController,
                          validator: (value) =>
                          (value == null || value.isEmpty)
                              ? "First name can not be left empty"
                              : null,
                          decoration: const InputDecoration(
                              border: OutlineInputBorder(),
                              labelText: 'First Name',
                              hintText: 'Enter your first name'),
                        ),
                      ),
                      Padding(
                        padding: EdgeInsets.only(left: 7.5, right: 7.5, top: 15, bottom: 0),
                        child: TextFormField(
                          controller: _lastNameController,
                          validator: (value) =>
                          (value == null || value.isEmpty)
                              ? "Last name can not be left empty"
                              : null,
                          decoration: const InputDecoration(
                              border: OutlineInputBorder(),
                              labelText: 'Last Name',
                              hintText: 'Enter your last name'),
                        ),
                      ),
                      Padding(
                        padding: const EdgeInsets.only(left: 7.5, right: 7.5, top: 15, bottom: 0),
                        child: TextFormField(
                          validator: validateEmail,
                          controller: _emailController,
                          decoration: const InputDecoration(
                              prefixIcon: Icon(Icons.mail),
                              border: OutlineInputBorder(),
                              labelText: 'Email',
                              hintText: 'Enter a valid email address'),
                        ),
                      ),
                      Padding(
                        padding: const EdgeInsets.only(left: 7.5, right: 7.5, top: 15, bottom: 0),
                        child: TextFormField(
                          controller: _phoneController,
                          validator: (value) =>
                          (value == null || value.isEmpty)
                              ? "Please provide a valid phone number"
                              : null,
                          decoration: const InputDecoration(
                              prefixIcon: Icon(Icons.call),
                              border: OutlineInputBorder(),
                              labelText: 'Phone',
                              hintText: 'Enter your phone number'),
                        ),
                      ),
                      Padding(
                        padding: const EdgeInsets.only(left: 7.5, right: 7.5, top: 15, bottom: 0),
                        child: TextFormField(
                          controller: _loginController,
                          validator: (value) =>
                          (value == null || value.isEmpty)
                              ? "Please provide a valid username"
                              : null,
                          decoration: const InputDecoration(
                              prefixIcon: Icon(Icons.person),
                              border: OutlineInputBorder(),
                              labelText: 'Username',
                              hintText: 'Enter your Username'),
                        ),
                      ),
                      Padding(
                        padding: const EdgeInsets.only(left: 7.5, right: 7.5, top: 15, bottom: 7.5),
                        child: TextFormField(
                          scrollPadding: const EdgeInsets.all(90.0),
                          controller: _passwordController,
                          focusNode: _pwFocus,
                          onChanged: (value) => checkPasswordStrength(value),
                          obscureText: _pwIsObscured,
                          validator: (value) => _pwStrength != 1 ? 'Please provide a valid password' : null,
                          decoration: InputDecoration(
                            prefixIcon: const Icon(Icons.lock),
                            suffixIcon: IconButton(
                              padding: const EdgeInsetsDirectional.only(end: 12.0),
                                icon: _pwIsObscured ? const Icon(Icons.visibility) : const Icon(Icons.visibility_off),
                                onPressed: () {setState(() {_pwIsObscured = !_pwIsObscured;});},
                                ),
                            border: const OutlineInputBorder(),
                            labelText: 'Password',
                            hintText: 'Enter your password'),
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
              child: auth.loggedInStatus == AuthStatus.authenticating
                    ? const FormLoadingIndicator(message: " Registering ... Please wait")
                    : SizedBox(
                  height: 50,
                  width: 250,
                  child: FilledButton(
                    onPressed: doRegister,
                    style: ElevatedButton.styleFrom(fixedSize: const Size(200, 50)),
                    child: const Text(
                      'Register', style: TextStyle(fontSize: 18),
                    ),
                  ),
                ),
            ),
            const Divider(indent: 15, endIndent: 15,),
            Padding(
              padding: const EdgeInsets.only(
                  left: 15.0, right: 15.0, top: 0, bottom: 15.0),
              child: TextButton(
                onPressed: () {
                  Navigator.pushReplacement(
                    context,
                    MaterialPageRoute(builder: (context) => Login()),
                  );
                },
                child: RichText(
                    text: TextSpan(
                        text: 'Already have an account? ',
                        style: TextStyle(
                            fontSize: 18,
                            color: Theme.of(context).colorScheme.primary),
                        children: const <TextSpan>[
                          TextSpan(
                              text: 'Login',
                              style: TextStyle(
                                  fontSize: 18, fontWeight: FontWeight.bold))
                        ])),
              ),
            ),
          ],
        ),
      ),
    );
  }
}