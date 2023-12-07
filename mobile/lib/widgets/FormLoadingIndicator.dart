import 'package:flutter/material.dart';

class FormLoadingIndicator extends StatelessWidget {
  const FormLoadingIndicator({
    required this.message,
    Key? key
  }) : super(key: key);

  final String message;

  @override
  Widget build(BuildContext context) {
    return Row(
      mainAxisAlignment: MainAxisAlignment.center,
      children: <Widget>[
        CircularProgressIndicator(),
        Text(message),
      ],
    );
  }
}
