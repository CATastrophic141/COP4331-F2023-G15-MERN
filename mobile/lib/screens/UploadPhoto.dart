import 'dart:convert';
import 'dart:io';
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:geosnap/models/DataModels.dart';
import 'package:geosnap/providers/PinProvider.dart';
import 'package:geosnap/providers/UserProvier.dart';
import 'package:geosnap/utils/validators.dart';
import 'package:latlong2/latlong.dart';
import 'package:provider/provider.dart';

import '../widgets/UploadDialogMessage.dart';

class UploadPhotoDialog extends StatefulWidget {
  const UploadPhotoDialog({Key? key, required this.imageFile, this.coordinates}) : super(key: key);

  // TODO pass along gps coordinates if available
  final File imageFile;
  final String? coordinates;

  @override
  State<UploadPhotoDialog> createState() => _UploadPhotoDialogState();
}

class _UploadPhotoDialogState extends State<UploadPhotoDialog> {

  final formKey = GlobalKey<FormState>();
  final _latLongController = TextEditingController();
  final _entryNameController = TextEditingController();
  final _descriptionController = TextEditingController();

  @override
  void initState() {
    if (widget.coordinates != null) {
      _latLongController.text = widget.coordinates!;
    }
    super.initState();
  }

  @override
  Widget build(BuildContext context) {
    PinProvider pinProvider = Provider.of<PinProvider>(context);

    handlePinUpload() {
      final form = formKey.currentState;
      if (form!.validate()) {
        form.save();
        _uploadDialogBuilder(context);
        
        // parse coordinate input
        final coordinates = _latLongController.text.split(',');
        LatLng latLng = LatLng(
          double.parse(coordinates[0]),
          double.parse(coordinates[1])
        );

        User user = Provider.of<UserProvider>(context, listen: false).getUser();
        final photo = const Base64Encoder().convert(widget.imageFile.readAsBytesSync());
        
        // construct payload
        Map<String, dynamic> payload = {
          'userId': user.userID,
          'entryName': _entryNameController.text,
          'entryDesc': _descriptionController.text,
          'latitude': latLng.latitude,
          'longitude': latLng.longitude,
          'photo': photo,
          'jwtToken': user.token,
        };

        print(payload);

      // get User
      final Future<Map<String, dynamic>> successfulMessage =
        pinProvider.createPin(payload);

      successfulMessage.then((response) {
        if (response['status']) {
          user.setToken(response['newToken']);
        }
      });
      } else {
        print("form is invalid");
      }

    }

    return SafeArea(
      child: Scaffold(
        resizeToAvoidBottomInset: false,
        extendBodyBehindAppBar: true,
        appBar: AppBar(
          elevation: 1,
          backgroundColor: Colors.transparent,
          shadowColor: null,
          leading: IconButton.filled(
            onPressed: () {
              Navigator.pop(context);
            },
            icon: const Icon(Icons.arrow_back)
          ),
        ),
      body: SingleChildScrollView(
        child: Form(
          key: formKey,
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: <Widget>[
              Container(
                color: Colors.black,
                width: MediaQuery.of(context).size.width,
                height: MediaQuery.of(context).size.width,
                child: Image.file(widget.imageFile),
              ),
              Padding(
                padding: const EdgeInsets.only(left: 15.0, right: 15.0, top: 15, bottom: 0),
                child: TextFormField(
                  scrollPadding: EdgeInsets.only(bottom: MediaQuery.of(context).viewInsets.bottom),
                  controller: _latLongController,
                  validator: validateCoordinates,
                  inputFormatters: [
                    FilteringTextInputFormatter.allow(RegExp('[0-9,. -]')),
                  ],
                  decoration: const InputDecoration(
                  prefixIcon: Icon(Icons.location_on),
                  border: OutlineInputBorder(),
                  labelText: 'Coordinates',
                  hintText: '0.000, -0.000',
                  helperText: 'Separate latitude and longitude with comma and/or space.'
                  ),
                ),
              ),
              // TODO check if entry name and description can be optional fields
              Padding(
                padding: const EdgeInsets.only(left: 15.0, right: 15.0, top: 15, bottom: 0),
                child: TextFormField(
                  scrollPadding: EdgeInsets.only(bottom: MediaQuery.of(context).viewInsets.bottom),
                  controller: _entryNameController,
                  validator: (value) =>
                  (value == null || value.isEmpty)
                  ? "Must provide an entry name"
                      : null,
                  decoration: const InputDecoration(
                  prefixIcon: Icon(Icons.info),
                  border: OutlineInputBorder(),
                  labelText: 'Entry Name',
                  hintText: 'Name',
                  ),
                ),
              ),
          Padding(
          padding: const EdgeInsets.only(left: 15.0, right: 15.0, top: 15, bottom: 20),
            child: TextFormField(
              scrollPadding: EdgeInsets.only(bottom: MediaQuery.of(context).viewInsets.bottom),
              controller: _descriptionController,
              validator: (value) =>
              (value == null || value.isEmpty)
              ? "Must provide a description"
              : null,
              decoration: const InputDecoration(
              prefixIcon: Icon(Icons.description),
              border: OutlineInputBorder(),
              labelText: 'Description',
              hintText: 'Enter a description',
              ),
            ),
          ),
          SizedBox(height: MediaQuery.of(context).viewInsets.bottom + 20),
            ],
          ),
         ),
        ),
      bottomNavigationBar: BottomAppBar(
        child: Container(height: 20.0),
      ),
      floatingActionButton: FloatingActionButton.extended(
        onPressed: handlePinUpload,
        label: const Text('Upload'),
        icon: const Icon(Icons.cloud_upload),
        heroTag: 'uploadPhotoButton',
      ),
      floatingActionButtonLocation: FloatingActionButtonLocation.centerDocked,
      )
    ,
    );
  }

  Future<void> _uploadDialogBuilder(BuildContext context) {
    return showDialog<void>(
        context: context,
        builder: (BuildContext context) {
          return Dialog(
            shape: RoundedRectangleBorder(
                borderRadius: BorderRadius.circular(20.0)
            ),
            child: Container(
              constraints: const BoxConstraints(
                minHeight: 250,
                minWidth: 250,
                maxHeight: 325,
                maxWidth: 250,
              ),
              child: Center(
                child: Padding(
                  padding: const EdgeInsets.all(15.0),
                  child: Provider.of<PinProvider>(context).uploadingPinStatus == PinStatus.uploadSuccessful
                      ? const UploadDialogMessage(
                      title: 'Upload Successful',
                      message: 'Your geo-tagged photo has been uploaded.',
                      indicator: Icon(Icons.done, size: 50, fill: 1,),
                      closable: true)
                      : Provider.of<PinProvider>(context).uploadingPinStatus == PinStatus.uploadFailure
                      ? const UploadDialogMessage(
                      title: 'Upload Failure',
                      message: 'Your photo failed to upload to our servers.',
                      indicator: Icon(Icons.error, size: 50, fill: 1,),
                      closable: true)
                      : const UploadDialogMessage(
                      title: 'Uploading Photo...',
                      message: 'Please wait for your photo to upload.',
                      indicator: SizedBox(
                          width: 50,
                          height: 50,
                          child: CircularProgressIndicator()),
                      closable: false),
                ),
              ),
            ),
          );
        }
      );
    }


}

