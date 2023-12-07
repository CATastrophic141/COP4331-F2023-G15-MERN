import 'package:flutter/material.dart';

class VerifyBottomScreen {

  //final String code;
  //final String route;

  //VerifyBottomScreen({required this.code, required this.route});

  static Future<dynamic> buildVerifyBottomScreen(BuildContext context, String code, String route) {

    final verfCode = code;
    final pageRoute = route;

    return showModalBottomSheet(
        context: context,
        isScrollControlled: true,
        showDragHandle: true,
        shape: const RoundedRectangleBorder(borderRadius: BorderRadius.vertical(top: Radius.circular(20.0))),
        builder: (context) => FractionallySizedBox(
          heightFactor: 0.9,
          child: Center(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.center,
              children: <Widget>[
                Padding(
                  padding: const EdgeInsets.only(top: 15.0, bottom: 0, left: 15.0),
                  child: Center(
                    child: Icon(Icons.drafts, size: 150, color: Theme.of(context).colorScheme.primary,),
                  ),
                ),
                const Padding(
                  padding: EdgeInsets.only(left: 15.0, right: 15.0, top: 0, bottom: 0),
                  child: Align(
                    alignment: Alignment.centerLeft,
                    child: Text(
                      'Enter Code',
                      style: TextStyle(fontSize: 32, fontWeight: FontWeight.bold),
                    ),
                  ),
                ),
                const Divider(indent: 15, endIndent: 15,),
                const Padding(
                  padding: EdgeInsets.only(left: 15.0, right: 15.0, top: 15, bottom: 0),
                  child: Align(
                    alignment: Alignment.center,
                    child: Text(
                      'We have just sent a verification code to the email provided. Please enter it below to verify your account.',
                      style: TextStyle(fontSize: 15),
                    ),
                  ),
                ),
                VerificationCodeInput(
                    code: verfCode,
                    route: pageRoute
                ),
              ],
            ),
          ),
        )
    );
  }
}

class VerificationCodeInput extends StatefulWidget {
  const VerificationCodeInput({
    super.key,
    required this.code,
    required this.route,
  });

  final String code;
  final String route;

  @override
  State<VerificationCodeInput> createState() => _VerificationCodeInputState();
}

class _VerificationCodeInputState extends State<VerificationCodeInput> {
  final formKey = GlobalKey<FormState>();
  final _codeInputController = TextEditingController();

  checkCode() {
    final form = formKey.currentState;
    if (form!.validate()) {
      Navigator.popAndPushNamed(context, widget.route);
    }
  }

  @override
  void dispose() {
    super.dispose();
    _codeInputController.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Form(
      key: formKey,
        child: Column(
          children: <Widget>[
            Padding(
              padding: const EdgeInsets.only(left: 15.0, right: 15.0, top: 15, bottom: 25.0),
              child: TextFormField(
                controller: _codeInputController,
                validator: (value) =>
                (value == null || value.isEmpty)
                    ? "Please enter the provided code from you email"
                    : _codeInputController.text != widget.code
                    ? "Code does not match one provided to email"
                    : null,
                decoration: const InputDecoration(
                  prefixIcon: Icon(Icons.mail),
                  border: OutlineInputBorder(),
                  labelText: 'Code',
                  hintText: 'Enter code from email'
                ),
              ),
            ),
            SizedBox(
              height: 50,
              width: 250,
              child: FilledButton(
                onPressed: checkCode,
                style: ElevatedButton.styleFrom(fixedSize: const Size(200, 50)),
                child: const Text(
                  'Verify Code', style: TextStyle(fontSize: 18),
                ),
              ),
            ),
          ],
        ),
      );
  }
}
