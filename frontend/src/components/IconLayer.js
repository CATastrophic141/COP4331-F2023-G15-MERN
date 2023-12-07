// src/IconLayer.js
import React, { useEffect } from 'react';
import { Vector as VectorLayer } from 'ol/layer';
import { Icon, Style } from 'ol/style';
import Feature from 'ol/Feature';
import Point from 'ol/geom/Point';
import VectorSource from 'ol/source/Vector';

function IconLayer() {
  useEffect(() => {
    // Create a vector source for the icon
    const iconSource = new VectorSource();

    // Define the icon feature
    const iconFeature = new Feature({
      geometry: new Point([0, 0]), // Set the coordinates where you want the icon to appear
    });

    // Create a style for the icon
    const iconStyle = new Style({
      image: new Icon({
        anchor: [0.5, 46],
        anchorXUnits: 'fraction',
        anchorYUnits: 'pixels',
        src: '/ImgIco.png', // Path to your image file in the public directory
      }),
    });

    iconFeature.setStyle(iconStyle);
    iconSource.addFeature(iconFeature);

    // Create the vector layer
    const iconLayer = new VectorLayer({
      source: iconSource,
    });

    // Add the icon layer to the map
    const map = window.map; // Assuming you've stored your map instance in a global variable
    map.addLayer(iconLayer);

    return () => {
      // Clean up resources when the component unmounts
      map.removeLayer(iconLayer);
      iconSource.clear();
    };
  }, []);

  return null; // This component doesn't render anything, it's responsible for adding the icon layer to the map
}

export default IconLayer;
