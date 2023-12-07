import 'dart:io';

import 'package:flutter/material.dart';
import 'package:flutter_map/flutter_map.dart';
import 'package:geosnap/models/DataModels.dart';
import 'package:geosnap/providers/PinProvider.dart';
import 'package:geosnap/screens/UploadPhoto.dart';
import 'package:geosnap/widgets/ExpandablePhotoMenu.dart';
import 'package:image_picker/image_picker.dart';
import 'package:latlong2/latlong.dart';
import 'package:provider/provider.dart';
import '../providers/NavBarProvider.dart';
import '../providers/PhotoProvider.dart';
import '../providers/UserProvier.dart';

class PhotoMap extends StatefulWidget {
  const PhotoMap({Key? key, required this.pins}) : super(key: key);

  final Map<String, Pin> pins;

  @override
  State<PhotoMap> createState() => _PhotoMapState();
}

class _PhotoMapState extends State<PhotoMap> {
  final ImagePicker imagePicker = ImagePicker();
  File? image;

  late List<Marker> _markers;

  late String tapCoordinates;

  @override
  void initState() {
    super.initState();
    _markers = [];
    widget.pins.forEach((key, value) {
      _addMarker(key, value.coordinates);
    });
  }

  goToPhotoGallery() {
    Provider.of<BottomNavState>(context, listen: false).navIndex = 1;
  }

  void _addMarker(String key, LatLng point) {
    _markers.add(
        Marker(
            height: 40.0,
            width: 40.0,
            point: point,
            alignment: Alignment.center,
            rotate: true,
            child: PhotoMarkerWidget(pinKey: key),
        ));
  }



  pickImage(ImageSource source, BuildContext context) async {
    final navigator = Navigator.of(context);
    XFile? xFileImage = await imagePicker.pickImage(source: source);
    if (xFileImage != null) {
      File img = File(xFileImage.path);
      await navigator.push(MaterialPageRoute(
          builder: (context) {
            return UploadPhotoDialog(imageFile: img, coordinates: tapCoordinates,);
          }
      ));
    }
  }

  @override
  Widget build(BuildContext context) {
    return Stack(
      alignment: Alignment.bottomRight,
      children: <Widget>[
        FlutterMap(
          options: MapOptions(
            initialCenter: const LatLng(28.6, -81.2),
            initialZoom: 7.0,
            onLongPress: (tapPosition, point) => {
              setState(() {
                String lat = point.latitude.toString();
                String long = point.longitude.toString();
                tapCoordinates = '$lat, $long';
              }),
              pickImage(ImageSource.gallery, context),
            },
          ),
          children: [
            TileLayer(
              urlTemplate: 'https://tile.openstreetmap.org/{z}/{x}/{y}.png',
              userAgentPackageName: 'cop4331.geosnap.geosnap',
            ),
            MarkerLayer(
                markers: _markers
            ),
          ],
        ),
        Padding(
          padding: const EdgeInsets.all(10.0),
          child: ExpandablePhotoMenu(
            distance: 112,
            children: [
              // Add Photo by taking a picture with camera
              ActionButton(
                  onPressed: () => pickImage(ImageSource.camera, context),
                  icon: const Icon(Icons.camera_alt)
              ),
              // Add a photo from system's local storage
              ActionButton(
                  onPressed: () => pickImage(ImageSource.gallery, context),
                  icon: const Icon(Icons.photo_library)
              ),
            ],
          ),
        ),
      ],
    );
  }
}

class PhotoMarkerWidget extends StatefulWidget {
  const PhotoMarkerWidget({Key? key, required this.pinKey}) : super(key: key);

  final String pinKey;

  @override
  State<PhotoMarkerWidget> createState() => _PhotoMarkerWidgetState();
}

class _PhotoMarkerWidgetState extends State<PhotoMarkerWidget> {

  @override
  Widget build(BuildContext context) {
    debugPrint("Called: PhotoMarkerWidget");
    handleLoadPhoto() {
      User user = Provider.of<UserProvider>(context, listen: false).getUser();
      Provider.of<PhotoProvider>(context, listen: false).fetchPhoto(
          widget.pinKey, user.token)
          .then((response) {
        if (response['status']) {
          user.setToken(response['token']);
          Provider.of<BottomNavState>(context, listen: false)
              .navIndex = 1;
        }
      });
    }

    return IconButton.filled(
      onPressed: handleLoadPhoto,
      icon: const Icon(Icons.location_on)
    );
  }
}
