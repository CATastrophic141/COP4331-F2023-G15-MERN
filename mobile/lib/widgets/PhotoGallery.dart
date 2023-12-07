import 'package:flutter/material.dart';
import 'package:geosnap/providers/PhotoProvider.dart';
import 'package:geosnap/screens/EditPhoto.dart';
import 'package:photo_view/photo_view.dart';
import 'package:geosnap/models/DataModels.dart';
import 'package:photo_view/photo_view_gallery.dart';
import 'package:provider/provider.dart';

import '../providers/PinProvider.dart';
import '../providers/UserProvier.dart';

class PhotoViewer extends StatefulWidget {

  final int startIndex;
  final List<Photo> galleryPhotos;
  final PageController pageController;
  final Axis scrollDirection;

  PhotoViewer({
    super.key,
    this.startIndex = 0,
    required this.galleryPhotos,
    this.scrollDirection = Axis.horizontal,
  }) : pageController = PageController(initialPage: startIndex);

  @override
  State<PhotoViewer> createState() => _PhotoViewerState();
}

class _PhotoViewerState extends State<PhotoViewer> {
  late int _photoIndex;
  late String _tag;

  void _onEditAction() {
    Navigator.of(context).push(
        MaterialPageRoute(
            builder: (context) =>
                EditPhotoDialog(
                    photo: widget.galleryPhotos[_photoIndex],
                ),
        ));
  }

  void _nextPhoto() {
    setState(() {
      if (_photoIndex + 1 != widget.galleryPhotos.length) {
        widget.pageController.nextPage(
          duration: const Duration(milliseconds: 400),
          curve: Curves.easeInOut,
        );
      } else {
        widget.pageController.jumpToPage(0);
      }
      //TODO End of list goes back to the beginning
      //_photoIndex = (_photoIndex + 1) % widget.galleryPhotos.length;
    });
  }

  void _prevPhoto() {
    setState(() {
      if (_photoIndex != 0) {
        widget.pageController.previousPage(
          duration: const Duration(milliseconds: 400),
          curve: Curves.easeInOut,
        );
      } else {
        widget.pageController.jumpToPage(widget.galleryPhotos.length - 1);
      }
      //TODO beginning of list can move to the end
      //_photoIndex = (_photoIndex - 1) % widget.galleryPhotos.length;
    });
  }

  void _onPageChange(int index) {
    setState(() {
      _photoIndex = index;
      _tag = (widget.galleryPhotos[index].description ?? '');
    });
  }

  @override
  void initState() {
    super.initState();
    _photoIndex = widget.startIndex;
    _tag = (widget.galleryPhotos[_photoIndex].description ?? '');
  }

  @override
  Widget build(BuildContext context) {
    PinProvider pinProvider = Provider.of<PinProvider>(context);

    void handleDelete() {
      User user = Provider.of<UserProvider>(context, listen: false).getUser();

      final Future<Map<String, dynamic>> successfulMessage =
      pinProvider.deletePin(widget.galleryPhotos[_photoIndex].pinID, user.token);

      successfulMessage.then((response) {
        if (response['status']) {
          user.setToken(response['newToken']);
          Navigator.pop(context);
          Provider.of<PhotoProvider>(context, listen: false).removePhotoAt(_photoIndex);
        }
      });

    }

    return Scaffold(
      backgroundColor: Colors.black,
      appBar: AppBar(
        backgroundColor: Colors.transparent,
        leading: IconButton(
          icon: const Icon(Icons.close, color: Color(0xFFFFFFFF),),
          onPressed: (){
            Navigator.pop(context);
          },
        ),
        actions: <Widget>[
          IconButton(
              onPressed: _onEditAction,
              icon: const Icon(Icons.edit, color: Color(0xFFFFFFFF),)
          ),
          IconButton(
              onPressed: () {
                _showDeleteDialog().then((value) {
                  if (value == 'OK') {
                    handleDelete();
                  }
                });
              },
              icon: const Icon(Icons.delete, color: Color(0xFFBA1A1A),),
          ),
        ],
      ),
      body: Stack(
        alignment: Alignment.center,
        children: <Widget>[
          Container(
            child: PhotoViewGallery.builder(
              scrollPhysics: const BouncingScrollPhysics(),
              builder: (BuildContext context, int index) {
                return PhotoViewGalleryPageOptions(
                imageProvider: MemoryImage(widget.galleryPhotos[index].bytesImage),
                  initialScale: PhotoViewComputedScale.contained * 0.9,
                  heroAttributes: PhotoViewHeroAttributes(
                      tag: _tag
                  ),
                );
              },
              itemCount: widget.galleryPhotos.length,
              pageController: widget.pageController,
              onPageChanged: _onPageChange,
            )
          ),
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: <Widget>[
              ElevatedButton(
                onPressed: _prevPhoto,
                style: ElevatedButton.styleFrom(
                  shape: CircleBorder(),
                  padding: EdgeInsets.all(6),
                  backgroundColor: Colors.transparent,
                  foregroundColor: Colors.white,
                ),
                child: const Icon(Icons.chevron_left, size: 20,),
              ),
              ElevatedButton(
                onPressed: _nextPhoto,
                style: ElevatedButton.styleFrom(
                  shape: CircleBorder(),
                  padding: EdgeInsets.all(6),
                  backgroundColor: Colors.transparent,
                  foregroundColor: Colors.white,
                ),
                child: const Icon(Icons.chevron_right, size: 20,),
              ),
            ],
          ),
        ],
      ),
    );
  }

  Future<dynamic> _showDeleteDialog() async {
    return showDialog(
      context: context,
      barrierDismissible: false, // user must tap button!
      builder: (BuildContext context) {
        return AlertDialog(
          title: const Text('Delete Photo'),
          content: const SingleChildScrollView(
            child: ListBody(
              children: <Widget>[
                Text('Are you sure you want to delete this photo permanently?'),
              ],
            ),
          ),
          actions: <Widget>[
            TextButton(
              onPressed: () => Navigator.pop(context, 'Cancel'),
              child: const Text('Cancel'),
            ),
            TextButton(
              onPressed: () {
                Navigator.pop(context, 'OK');
              },
              child: const Text('OK'),
            ),
          ],
        );
      },
    );
  }
}