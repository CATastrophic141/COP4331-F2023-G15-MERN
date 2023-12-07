import 'package:flutter/material.dart';

class PasswordProgressIndicator extends StatelessWidget {
  const PasswordProgressIndicator({
    super.key,
    required double pwStrength,
    required String pwDisplay,
  }) : _pwStrength = pwStrength, _pwDisplay = pwDisplay;

  final double _pwStrength;
  final String _pwDisplay;

  @override
  Widget build(BuildContext context) {

    Color getProgressColor(double value) {
      int strength = (value * 10.0).round();
      return strength <= 2
          ? const Color(0xFFBA1A1A)
          : strength == 4
          ? const Color(0xFFBA182D)
          : strength == 6
          ? const Color(0xFF904D00)
          : const Color(0xFF9C4332);
    }

    return Column(
      children: <Widget>[
        Padding(
          padding: const EdgeInsets.only(left: 7.5, right: 7.5, top: 7.5, bottom: 0),
          child: LinearProgressIndicator(
            value: _pwStrength,
            backgroundColor: Color(0xFF534340),
            borderRadius: BorderRadius.circular(7.5),
            color: getProgressColor(_pwStrength),
            minHeight: 7.5,
          ),
        ),
        Align(
          alignment: Alignment.centerLeft,
          child: Padding(
            padding: const EdgeInsets.only(left: 15.0, right: 15.0, top: 7.5, bottom: 7.5),
            child: Text(
                _pwDisplay,
                style: const TextStyle(fontSize: 15),
              ),
            ),
        ),
      ],
    );
  }
}