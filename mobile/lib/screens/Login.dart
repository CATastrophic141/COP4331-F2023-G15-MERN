import 'package:flutter/material.dart';
import 'package:geosnap/models/DataModels.dart';
import 'package:geosnap/providers/AuthProvider.dart';
import 'package:geosnap/providers/UserProvier.dart';
import 'package:geosnap/widgets/FormLoadingIndicator.dart';
import '../providers/PinProvider.dart';
import './Register.dart';
import 'package:provider/provider.dart';

class Login extends StatefulWidget {
  @override
  _LoginState createState() => _LoginState();
}

class _LoginState extends State<Login> {
  final formKey = GlobalKey<FormState>();

  late String _username, _password;

  @override
  Widget build(BuildContext context) {
    AuthProvider auth = Provider.of<AuthProvider>(context);

    final emailField = TextFormField(
      autofocus: false,
      validator: (value) =>
          (value == null || value.isEmpty) ? "Your username is required" : null,
      onSaved: (value) => _username = value!,
      decoration: const InputDecoration(
          prefixIcon: Icon(Icons.person),
          border: OutlineInputBorder(),
          labelText: 'Username',
          hintText: 'Enter your username'),
    );

    final passwordField = TextFormField(
      autofocus: false,
      obscureText: true,
      validator: (value) =>
          (value == null || value.isEmpty) ? "Please enter password" : null,
      onSaved: (value) => _password = value!,
      decoration: const InputDecoration(
          prefixIcon: Icon(Icons.lock),
          border: OutlineInputBorder(),
          labelText: 'Password',
          hintText: 'Enter your password'),
    );

    doLogin() {
      final form = formKey.currentState;

      if (form!.validate()) {
        form.save();

        final Future<Map<String, dynamic>> successfulMessage =
            auth.login(_username, _password);

        successfulMessage.then((response) {
          if (response['status']) {
            User user = response['user'];
            Provider.of<UserProvider>(context, listen: false).setUser(user);
            // Load User Data
            Provider.of<PinProvider>(context, listen: false).retrievePins(user.userID)
                .then((response) {
              print('loading pins response:');
              print(response['message']);
            });

            // TODO change to pushReplacementNamed for production
            Navigator.pushNamed(context, '/homepage');
          } else {
            ScaffoldMessenger.of(context).showSnackBar(SnackBar(
              content: const Text('Failed to Log in'),
              backgroundColor: Theme.of(context).colorScheme.error,
            ));
          }
        });
      } else {
        print("form is invalid");
      }
    }

    return Scaffold(
      body: Center(
        child: SingleChildScrollView(
          child: Form(
            key: formKey,
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.center,
              children: <Widget>[
                const Padding(
                  padding: EdgeInsets.only(
                      left: 15.0, right: 15.0, top: 0, bottom: 0),
                  child: Align(
                    alignment: Alignment.centerLeft,
                    child: Text(
                      'Welcome.',
                      style: TextStyle(
                          fontSize: 32,
                          fontWeight: FontWeight.bold,
                        ),
                    ),
                  ),
                ),
                const Divider(indent: 15, endIndent: 15,),
                Padding(
                  padding: const EdgeInsets.symmetric(horizontal: 7.5),
                  child: Card(
                      child: Column(
                    children: <Widget>[
                      Padding(
                        padding: const EdgeInsets.only(
                            top: 0.0, bottom: 15.0, left: 25.0),
                        child: Center(
                          child: Container(
                              width: 200,
                              height: 200,
                              child: Image.asset('assets/PinnedImg.png')),
                        ),
                      ),
                      RichText(
                        text: TextSpan(
                          text: 'Place',
                          style: TextStyle(
                              fontSize: 32,
                              color: Theme.of(context).colorScheme.onPrimaryContainer),
                          children: const <TextSpan>[
                            TextSpan(
                                text: 'Folio',
                                style: TextStyle(
                                    fontSize: 32, fontWeight: FontWeight.bold))
                          ],
                        ),
                      ),
                      Padding(
                        padding: const EdgeInsets.only(
                            left: 7.5, right: 7.5, top: 25, bottom: 0),
                        child: emailField,
                      ),
                      Padding(
                        padding: const EdgeInsets.only(
                            left: 7.5, right: 7.5, top: 15, bottom: 0),
                        child: passwordField,
                      ),
                      Padding(
                        padding: const EdgeInsets.only(
                            left: 15.0, right: 15.0, top: 7.5, bottom: 7.5),
                        child: Align(
                          alignment: Alignment.centerRight,
                          child: ActionChip(
                            onPressed: () {
                              Navigator.pushNamed(context, '/forgot');
                            },
                            avatar: const Icon(Icons.help),
                            label: const Text('Forgot Password'),
                          ),
                        ),
                      ),
                    ],
                  )),
                ),
                Padding(
                  padding: const EdgeInsets.only(
                      left: 15.0, right: 15.0, top: 15.0, bottom: 15.0),
                  child: auth.loggedInStatus == AuthStatus.authenticating
                      ? const FormLoadingIndicator(
                          message: " Authenticating ... Please wait")
                      : FilledButton(
                          onPressed: doLogin,
                          style: ElevatedButton.styleFrom(
                              fixedSize: const Size(200, 50)),
                          child: const Text(
                            'Login',
                            style: TextStyle(fontSize: 18),
                          ),
                        ),
                ),
                Padding(
                  padding: const EdgeInsets.only(
                      left: 15.0, right: 15.0, top: 0, bottom: 0),
                  child: TextButton(
                    onPressed: () {
                      Navigator.push(
                        context,
                        MaterialPageRoute(builder: (context) => RegisterPage()),
                      );
                    },
                    child: RichText(
                        text: TextSpan(
                            text: 'Not Registered? ',
                            style: TextStyle(
                                fontSize: 18,
                                color: Theme.of(context).colorScheme.primary),
                            children: const <TextSpan>[
                          TextSpan(
                              text: 'Sign up',
                              style: TextStyle(
                                  fontSize: 18, fontWeight: FontWeight.bold))
                        ])),
                  ),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}
