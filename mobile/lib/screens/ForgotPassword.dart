import 'package:flutter/material.dart';
import 'package:geosnap/widgets/FormLoadingIndicator.dart';
import 'package:geosnap/widgets/Verify.dart';
import 'package:provider/provider.dart';

import '../providers/AuthProvider.dart';
import '../providers/UserProvier.dart';
import '../utils/validators.dart';

class ForgotPassword extends StatefulWidget {
  const ForgotPassword({Key? key}) : super(key: key);

  @override
  State<ForgotPassword> createState() => _ForgotPasswordState();
}

class _ForgotPasswordState extends State<ForgotPassword> {

  final formKey = GlobalKey<FormState>();

  final _emailController = TextEditingController();

  @override
  void initState() {
    super.initState();
  }

  @override
  void dispose() {
    _emailController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    AuthProvider auth = Provider.of<AuthProvider>(context);

    checkEmail() {
      final form = formKey.currentState;
      if (form!.validate()) {

        final Future<Map<String, dynamic>> successfulMessage =
        auth.sendPasswordResetEmail(_emailController.text);

        successfulMessage.then((response) {
          print(response);
          if (response['status']) {
            print(response['code']);
            // store reset code and UserID
            String code = response['code'];
            Provider.of<UserProvider>(context, listen: false).setResetID(response['userID']);
            VerifyBottomScreen.buildVerifyBottomScreen(context, code, '/reset');
          } else {
            ScaffoldMessenger.of(context).showSnackBar(SnackBar(
                content: Text(response['message']),
                backgroundColor: Theme.of(context).colorScheme.error,
            ));
          }
        });
      } else {
        print("form is invalid");
      }
    }

    return Scaffold(
      appBar: AppBar(),
      body: SingleChildScrollView(
        child: Center(
          child: Column(
            children: <Widget>[
              const Padding(
                padding: EdgeInsets.only(left: 15.0, right: 15.0, top: 0, bottom: 0),
                child: Align(
                  alignment: Alignment.centerLeft,
                  child: Text(
                    'Forgot\nPassword',
                    style: TextStyle(fontSize: 32, fontWeight: FontWeight.bold, height: 1),
                  ),
                ),
              ),
              const Divider(indent: 15, endIndent: 15,),
              Padding(
                padding: const EdgeInsets.only(left: 15.0, right: 15.0, top: 7.5, bottom: 0),
                child: Align(
                  alignment: Alignment.centerLeft,
                  child: RichText(
                    text: TextSpan(
                      text: 'Please enter the email address associated with your ',
                      style: TextStyle(
                          fontSize: 15,
                          color: Theme.of(context).colorScheme.onBackground,
                      ),
                      children: const <TextSpan>[
                        TextSpan(
                            text: 'PlaceFolio ',
                            style: TextStyle(
                                fontSize: 15, fontWeight: FontWeight.bold)
                        ),
                        TextSpan(
                            text: 'account, and we’ll send you an email with a code to reset your password.',
                            style: TextStyle(
                                fontSize: 15)
                        ),
                      ],
                    ),
                  ),
                ),
              ),
              Padding(
                padding: const EdgeInsets.only(left: 15.0, right: 15.0, top: 15, bottom: 15.0),
                child: Form(
                  key: formKey,
                  child:TextFormField(
                    validator: validateEmail,
                    controller: _emailController,
                    decoration: const InputDecoration(
                        prefixIcon: Icon(Icons.mail),
                        border: OutlineInputBorder(),
                        labelText: 'Email',
                        hintText: 'Enter a valid email address'),
                  ),
                ),
              ),
              Padding(
                  padding: const EdgeInsets.only(
                      left: 15.0, right: 15.0, top: 15.0, bottom: 7.5),
                  child: auth.resettingPasswordStatus == AuthStatus.verifyingEmail
                      ? const FormLoadingIndicator(message: " Verifying Email ... Please wait")
                      : SizedBox(
                    height: 50,
                    width: 250,
                    child: FilledButton(
                      onPressed: checkEmail,
                      style: ElevatedButton.styleFrom(fixedSize: const Size(200, 50)),
                      child: const Text(
                        'Send Code', style: TextStyle(fontSize: 18),
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
}