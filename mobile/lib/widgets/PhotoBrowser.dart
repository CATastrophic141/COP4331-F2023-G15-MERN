import 'package:flutter/material.dart';
import 'package:geosnap/models/DataModels.dart';
import 'package:flutter_staggered_grid_view/flutter_staggered_grid_view.dart';
import 'package:geosnap/providers/PhotoProvider.dart';
import 'package:geosnap/widgets/PhotoGallery.dart';
import 'package:provider/provider.dart';

class PhotoBrowser extends StatefulWidget {
  const PhotoBrowser({Key? key, required this.photos}) : super(key: key);

  final List<Photo> photos;

  @override
  State<PhotoBrowser> createState() => _PhotoBrowserState();
}

class _PhotoBrowserState extends State<PhotoBrowser> {
  
  @override
  void initState() {
    super.initState();
  }

  @override
  Widget build(BuildContext context) {
    PhotoProvider photoProvider = Provider.of<PhotoProvider>(context);

    return photoProvider.loadingPhotosStatus == PhotoStatus.loadingPhotos
      ? const Center(child: CircularProgressIndicator(),)
      : MasonryGridView.count(
        crossAxisCount: 2,
        mainAxisSpacing: 4,
        crossAxisSpacing: 4,
        itemCount: widget.photos.length,
        itemBuilder: (context, index) {
          return Stack(
            children: <Widget>[
              Container(
                width: MediaQuery.of(context).size.width,
                alignment: Alignment.center,
                child: ClipRect(
                  child: Align(
                  alignment: const Alignment(0.0, 0.0),
                  widthFactor: 1,
                  heightFactor: 1,
                  child: Image.memory(widget.photos[index].bytesImage),
                  ),
                ),
              ),
              Positioned.fill(
                child:Hero(
                  tag: widget.photos[index].pinID,
                  child: Material(
                    color: Colors.transparent,
                    child: InkWell(
                      hoverColor: Colors.black.withOpacity(0.3),
                      onTap: () {
                        Navigator.push(
                          context,
                          MaterialPageRoute(
                            builder: (context) => PhotoViewer(
                              startIndex: index,
                              galleryPhotos: widget.photos,
                            ),
                          ),
                        );
                      },
                    ),
                  ),
                ),
              ),
            ]
          );
        }
    );
  }
}


