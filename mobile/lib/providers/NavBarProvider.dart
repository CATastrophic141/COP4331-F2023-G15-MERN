import 'package:flutter/material.dart';


class BottomNavState extends ChangeNotifier {
  int _navIndex = 0;

  int get navIndex => _navIndex;

  set navIndex(int value) {
    _navIndex = value;
    notifyListeners();
  }
}

class BottomNavScope extends InheritedNotifier<BottomNavState> {
  const BottomNavScope({
    required BottomNavState notifier,
    required Widget child,
    Key? key,
  }) : super(key: key, notifier: notifier, child: child);

  static BottomNavState? of(BuildContext context) {
    return context
        .dependOnInheritedWidgetOfExactType<BottomNavScope>()
        ?.notifier;
  }
}
