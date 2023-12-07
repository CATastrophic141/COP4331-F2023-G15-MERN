/*********************************************/

//THIS FILE HAS BEEN DEPRECIATED

/*********************************************/
// src/Map.js
import React, { useEffect, useState } from 'react';
import 'ol/ol.css'; // Import OpenLayers CSS
import Map from 'ol/Map';
import View from 'ol/View';
import TileLayer from 'ol/layer/Tile';
import OSM from 'ol/source/OSM';
import Feature from 'ol/Feature';
import Point from 'ol/geom/Point';
import { Icon, Style } from 'ol/style';
import VectorLayer from 'ol/layer/Vector';
import VectorSource from 'ol/source/Vector';
import { fromLonLat, toLonLat } from 'ol/proj';

function MapComponent({getLocationMode, setGetLocationMode, isMapModOpen, setOpenMapMod, lat, setLat, lon, setLon, children}) {
  // const [getLocationMode, setGetLocationMode] = useState(false);

  useEffect(() => {
    let map = new Map({
      target: 'map',
      layers: [
        new TileLayer({
          source: new OSM(),
        }),
      ],
      view: new View({
        center: fromLonLat([0, 0]),
        zoom: 2,
      }),
    });

    // Create a vector source and layer for the icon
    const vectorSource = new VectorSource();
    const vectorLayer = new VectorLayer({
      source: vectorSource,
    });
    map.addLayer(vectorLayer);

    // Attach a click event listener to the map
    // This can be modified to get the icon's modal
    map.on('click', function (event) {
      if (getLocationMode) {
        const coordinate = event.coordinate;
        const lonLat = toLonLat(coordinate);
        alert(`Clicked at latitude: ${lonLat[1]}, longitude: ${lonLat[0]}`);
        setLat(lonLat[1]);
        setLon(lonLat[0]);
        console.log("Lat set to:", lat);
        console.log("Lon set to:", lon);
        setGetLocationMode(false);
        setOpenMapMod(true);
      } else {
        map.forEachFeatureAtPixel(event.pixel, function (feature) {
          console.log("Map clicked");
        });
      }
    });

    const getMap = () => {
      return map;
    };

    return () => {
      // Cleanup: Dispose of the map when the component unmounts
      if (map) {
        map.setTarget(null);
        map = null;
      }
    };
  }, [getLocationMode]);

  // useEffect(() => {
  //   // Create a new map instance
  //   let map = new Map({
  //     target: 'map', // The ID of the HTML element to render the map
  //     layers: [
  //       new TileLayer({
  //         source: new OSM(), // Use OpenStreetMap as the base layer
  //       }),
  //     ],
  //     view: new View({
  //       center: [0, 0], // Center the map at [0, 0] coordinates
  //       zoom: 2, // Set the initial zoom level
  //     }),
  //   });

  //   return () => {
  //     map.setTarget(null); // Unbind the map from the target element
  //     map = null; // Clear the map instance
  //   };
  // }, []);

  return (
    <div id="map" style={{ width: '100%', height: '600px', marginBottom: '20%', marginRight: '20%' }}>
      {/* The map will be rendered inside this div */}
    </div>
  );
}

export default MapComponent;