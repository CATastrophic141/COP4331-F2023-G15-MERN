import 'package:flutter/material.dart';

class UploadDialogMessage extends StatelessWidget {
  const UploadDialogMessage({
    super.key,
    required this.title,
    required this.message,
    required this.indicator,
    required this.closable,
  });

  final String title;
  final String message;
  final Widget indicator;
  final bool closable;

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.center,
      children: <Widget>[
        Padding(
          padding: const EdgeInsets.only(
              left: 15.0, right: 15.0, top: 0, bottom: 0),
          child: Align(
            alignment: Alignment.centerLeft,
            child: Text(
              title,
              style: const TextStyle(
                fontSize: 32,
                fontWeight: FontWeight.bold,
              ),
            ),
          ),
        ),
        const Divider(indent: 15, endIndent: 15,),
        Padding(
          padding: const EdgeInsets.only(
              left: 15.0, right: 15.0, top: 15, bottom: 0),
          child: Align(
            alignment: Alignment.centerLeft,
            child: Text(
              message,
              style: const TextStyle(fontSize: 15),
            ),
          ),
        ),
        indicator,
        if (closable)
          Padding(
            padding: const EdgeInsets.only(top: 15.0, bottom: 15.0),
            child: SizedBox(
              height: 50,
              width: 200,
              child: FilledButton(
                onPressed: () {
                  Navigator.pop(context);
                  Navigator.pushReplacementNamed(context, '/homepage');
                },
                style: ElevatedButton.styleFrom(fixedSize: const Size(200, 50)),
                child: const Text(
                  'Continue',
                  style: TextStyle(fontSize: 18),
                ),
              ),
            ),
          ),
      ],
    );
  }
}