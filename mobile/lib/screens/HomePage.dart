import 'package:flutter/material.dart';
import 'package:flutter_map/flutter_map.dart';
import 'package:geosnap/providers/NavBarProvider.dart';
import 'package:geosnap/providers/PhotoProvider.dart';
import 'package:latlong2/latlong.dart';
import 'package:geosnap/models/DataModels.dart';
import 'package:provider/provider.dart';
import '../providers/PinProvider.dart';
import '../providers/UserProvier.dart';
import '../widgets/Map.dart';
import '../widgets/PhotoBrowser.dart';

class HomePage extends StatefulWidget {
  const HomePage({Key? key}) : super(key: key);

  @override
  State<HomePage> createState() => _HomePageState();
}

class _HomePageState extends State<HomePage> {
  NavigationDestinationLabelBehavior labelBehavior =
      NavigationDestinationLabelBehavior.alwaysShow;
  late User _user;

  @override
  void initState() {
    super.initState();
    _user = Provider.of<UserProvider>(context, listen: false).getUser();
  }

  void _onNavBarTapped(int index) {
    setState(() {
      Provider.of<BottomNavState>(context, listen: false).navIndex = index;
    });
  }

  @override
  Widget build(BuildContext context) {
    BottomNavState bottomNavState = Provider.of<BottomNavState>(context);
    PinProvider pinProvider = Provider.of<PinProvider>(context);
    PhotoProvider photoProvider = Provider.of<PhotoProvider>(context);

    return SafeArea(
      child: Scaffold(
        resizeToAvoidBottomInset: false,
        extendBodyBehindAppBar: true,
        appBar: AppBar(
          elevation: 1,
          backgroundColor: Colors.transparent,
          shadowColor: null,
        ),
        body: pinProvider.loadingPinsStatus == PinStatus.loadingPins
          ? const Center(child: CircularProgressIndicator(),)
          : Center(
          child: <Widget>[
            // Map
            PhotoMap(pins: pinProvider.currentPins),
            // Photo Album Browser
            PhotoBrowser(photos: photoProvider.photos),
            // Settings menu
            const Icon(Icons.settings, size: 150,)
          ].elementAt(bottomNavState.navIndex),
        ),
        bottomNavigationBar: NavigationBar(
          labelBehavior: labelBehavior,
          selectedIndex: bottomNavState.navIndex,
          onDestinationSelected: _onNavBarTapped,
          destinations: const <Widget>[
            NavigationDestination(
                icon: Icon(Icons.pin_drop),
                label: 'Map'),
            NavigationDestination(
                icon: Icon(Icons.photo_library_rounded),
                label: 'Photos'),
            NavigationDestination(
                icon: Icon(Icons.settings),
                label: 'Settings')
          ],
        ),
      ),
    );
  }
}