import 'package:flutter/material.dart';
import 'package:geosnap/providers/AuthProvider.dart';
import 'package:geosnap/providers/NavBarProvider.dart';
import 'package:geosnap/providers/PhotoProvider.dart';
import 'package:geosnap/providers/PinProvider.dart';
import 'package:geosnap/providers/UserProvier.dart';
import 'package:geosnap/screens/ForgotPassword.dart';
import 'package:geosnap/screens/HomePage.dart';
import 'package:geosnap/screens/Login.dart';
import 'package:geosnap/screens/Register.dart';
import 'package:geosnap/screens/ResetPassword.dart';
import 'package:geosnap/utils/color_schemes.g.dart';
import 'package:provider/provider.dart';
import 'package:image_picker_android/image_picker_android.dart';
import 'package:image_picker_platform_interface/image_picker_platform_interface.dart';

void main() {

  final ImagePickerPlatform imagePickerImplementation =
      ImagePickerPlatform.instance;
  if (imagePickerImplementation is ImagePickerAndroid) {
    imagePickerImplementation.useAndroidPhotoPicker = true;
  }

  runApp(Application());
}

class Application extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return MultiProvider(
      providers: [
      ChangeNotifierProvider(create: (_) => AuthProvider()),
      ChangeNotifierProvider(create: (_) => UserProvider()),
      ChangeNotifierProvider(create: (_) => PinProvider()),
      ChangeNotifierProvider(create: (_) => PhotoProvider()),
      ChangeNotifierProvider(create: (_) => BottomNavState()),
      ],
      child: MaterialApp(
        debugShowCheckedModeBanner: false,
        theme: ThemeData(useMaterial3: true, colorScheme: lightColorScheme),
        darkTheme: ThemeData(useMaterial3: true, colorScheme: darkColorScheme),
        home: Login(),
        routes: {
          '/homepage': (context) => HomePage(),
          '/login' : (context) => Login(),
          '/register' : (context) => RegisterPage(),
          '/forgot' : (context) => ForgotPassword(),
          '/reset' : (context) => ResetPassword(),
        },
      ),
    );
  }
}
