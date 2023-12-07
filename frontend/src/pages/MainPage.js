import React, { forwardRef, useImperativeHandle, useState, useEffect, useRef } from "react";
import { motion, AnimatePresence, easeInOut } from "framer-motion";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faQuestionCircle } from '@fortawesome/free-solid-svg-icons';
import "../App.css";
import ManAddModal from "./Modals/ManAddModal";
import MapAddModal from "./Modals/MapAddModal";
// import EditModal from "./Modals/EditModal";

import "ol/ol.css"; // Import OpenLayers CSS
import Map from "ol/Map";
import View from "ol/View";
import TileLayer from "ol/layer/Tile";
import OSM from "ol/source/OSM";
import Feature from "ol/Feature";
import Point from "ol/geom/Point";
import { Icon, Style } from "ol/style";
import VectorLayer from "ol/layer/Vector";
import VectorSource from "ol/source/Vector";
import { fromLonLat, toLonLat } from "ol/proj";

import "../components/MainPage.css";

const $ = window.$;
const jwt = require("jsonwebtoken");
const storage = require("../tokenStorage.js");
const bp = require("../components/Path.js");
var current_id = "";

// TODO: Get table data from database

function MainPage() {
  const [tableData, setTableData] = useState([]);
  const [isManAddModOpen, setOpenManAddMod] = useState(false); //** NOTE: Used for alternate implmntatn without 'data-bs-toggle' fields in buttons for modals */ /
  const [isMapAddModOpen, setOpenMapAddMod] = useState(false); //** NOTE: Used for alternate implmntatn without 'data-bs-toggle' fields in buttons for modals */ /
  const [isEditModOpen, setOpenEditMod] = useState(false); //** NOTE: Used for alternate implmntatn without 'data-bs-toggle' fields in buttons for modals */ /
  const [editEnt, setEditEnt] = useState(-1);
  const [entRow, setEntRow] = useState(-1);
  const [locationMode, setLocationMode] = useState(false);
  const [isMapClkd, setIsMapClkd] = useState(false);
  const [lat, setLat] = useState(0.0); // Initialize the latitude clicked
  const [lon, setLon] = useState(0.0); // Initialize the longitude clicked
  const [file, setFile] = useState(null);
  const [name, setName] = useState("");
  const [descr, setDescr] = useState("");
  const [_id, set_id] = useState("");
  const [b64String, setB64String] = useState("");
  const [iconsNotLoaded, setIconsNotLoaded] = useState(true);
  const [featureAdded, setFeatureAdded] = useState(false);

  const [showModal, setShowModal] = useState(false);
  const [iconSource, setIconSource] = useState([]);
  const [iconLayer, setIconLayer] = useState([]);
  const [iconFeatures, setIconFeatures] = useState([]); // Initialize iconFeatures as an empty array
  const [map, setMap] = useState(null); // Define map using useState

  const [firstName, setFirstName] = useState(""); // Initialize the first name state
  const [userId, setUserId] = useState("");

  const [tutIsVis, setTutIsVis] = useState(false);

  const [overlayClosed, setOverlayClosed] = useState(true);

  const mapAddModalRef = useRef();
  const manAddModalRef = useRef();
  // const editModalRef = useRef();

  var userData2 = JSON.parse(localStorage.getItem("user_data"));
  var userId2 = userData2.id;

  // Function name: async function loadIcons()
  // Function description: function to load pins onto the map
  async function loadIcons() { //** experiment see if can make not async */
    if (iconsNotLoaded) {
      try {
        // Make the Pin Load API call //
        const decodedJWT = jwt.decode(storage.retrieveToken(), {complete: true});
        const lJP = {id: userId2}; //lJP="load JSON Packet"
        console.log("Attempting to load with User ID:\n%s\n", userId);
        const response = await fetch(bp.buildPath("api/pins/load"), {
          method: "POST",
          body: JSON.stringify(lJP),
          headers: { "Content-Type": "application/json" }
        });
        const data = JSON.parse(await response.text());
        console.log("Pin Load API response:\n", data);
        const iconArray = data.ret;
        console.log("Icon Array from Pin Load API response:\n", iconArray);

        // Check if the response is an array and not empty
        if (iconArray) {
          // Clear existing icons from the map
          handleClearTable();

          // Iterate through the data and add icons to the map
          iconArray.forEach((entry) => {
            addIconToMap(iconLayer, entry);
            console.log("Adding entry to Icon Layer: ", entry);
          });

          // Update the tableData state with the loaded data
          setTableData(iconArray);
        }

        // Set the user's pins' icons as loaded
        setIconsNotLoaded(false);
      } catch (error) {
        console.error("Error Loading the Pin data from the 'Pin Load' API. Here are the details in the whole ERROR message:\n%s\n", error);
      }
    }
  }

  // Retrieves and sets user data from localStorage
  useEffect(() => {
    // Retrieve user data from localStorage
    const userData = localStorage.getItem("user_data");

    if (userData) {
      const user = JSON.parse(userData);
      setFirstName(user.firstName);
      setUserId(user.id);
      console.log("User ID set to:", userId);
    }
  }, []); // The empty dependency array ensures that this effect runs only once, when the component mounts.

  //----- MAP COMPONENT CODE ------------------------------------------//
  //Moved from separate component as information trading was a problem

  useEffect(() => {
    //This handles what happens when an icon is clicked.
    const handleFeatureClick = async (clickedFeature) => {
      //console.log(clickedFeature);
      if (clickedFeature) {
        const _id = clickedFeature.get("_id");
        const latitude = clickedFeature.get("Latitude");
        const longitude = clickedFeature.get("Longitude");
        const entryName = clickedFeature.get("EntryName");
        const entryDescr = clickedFeature.get("EntryDescr");
        const b64String = clickedFeature.get("Photo");

        //console.log(latitude, longitude, entryName);

        // Use async/await to wait for state updates
        await Promise.all([
          set_id(_id),
          setLat(latitude),
          setLon(longitude),
          setName(entryName),
          setDescr(entryDescr),
          setB64String(b64String),
        ]);

        console.log("Pin ID after clicking pin to edit:\n%s", _id);
        current_id = _id;

        //console.log(lat, lon, name);

        // Now you can open the modal
        handleOpenEdit(_id);
      }
    };

    // Create a map
    let mainMap = new Map({
      target: "map",
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

    setMap(mainMap); // Update the map state

    // Add the icon feature to the map as a Vector Layer after the map's creation
    let iconLayer = new VectorLayer({
      source: new VectorSource({
        features: iconFeatures, // Starting out, the "iconFeatures" array should be empty. But, it should get populated over time with the important and useful info.
      }),
    });
    mainMap.addLayer(iconLayer);

    setIconLayer(iconLayer);

    // Attach a click event listener to the map
    mainMap.on("click", function (event) {
      //console.log("Map clicked. Mode: ", locationMode);
      if (locationMode === true) {
        const coordinate = event.coordinate;
        const lonLat = toLonLat(coordinate);
        //console.log(`Clicked at latitude: ${lonLat[1]}, longitude: ${lonLat[0]}`);
        setLocationMode(false);
        // Set the selected latitude and longitude in state
        setLat(lonLat[1]);
        setLon(lonLat[0]);
        //Other data should be empty
        setFile(null);
        setName("");
        setDescr("");
        setB64String("");

        handleOpenMap();
      } else {
        const clickedFeature = mainMap.forEachFeatureAtPixel(
          event.pixel,
          function (feature) {
            return feature; // Return the clicked feature
          }
        );

        if (clickedFeature) {
          console.log("Attempting load");
          handleFeatureClick(clickedFeature);
        }
      }
    });

    if (iconsNotLoaded) {
      loadIcons();
    }

    // Cleanup function to destroy the map when the component unmounts
    return () => {
      mainMap.setTarget(null); // Unbind the map from the target element
      mainMap = null; // Clear the map instance
    };
  }, [locationMode, iconFeatures, iconsNotLoaded]);

  ////////////////////////////////////////////////////////////////////

  //------- MODAL OPENERS/CLOSERS ----------------------------------------//
  const handleOpenMan = () => {
    //Begin entry with new data
    setLat(0.0);
    setLon(0.0);
    setFile(null);
    setName("");
    setDescr("");
    setB64String("");

    setOpenMapAddMod(false);
    setOpenEditMod(false);
    setOverlayClosed(false);
    setOpenManAddMod(true);
    manAddModalRef.current.open();
  };

  const handleCloseMan = () => {
    manAddModalRef.current.close();
    setOpenManAddMod(false);
    setOverlayClosed(true);
    setLat(0.0);
    setLon(0.0);
    setFile(null);
    setName("");
    setDescr("");
    setB64String("");
    //setB64String(""); //relocadiv fnctnlty to modal
  };

  const handleSetLocMode = () => {
    setLocationMode(!locationMode);
  };

  const handleOpenMap = () => {
    setOpenManAddMod(false);
    setOpenEditMod(false);
    setOverlayClosed(false);
    setOpenMapAddMod(true);
    mapAddModalRef.current.open();
  };

  const handleCloseMap = () => {
    mapAddModalRef.current.close();
    setOpenMapAddMod(false);
    setLocationMode(false);
    setOverlayClosed(true);
    //setB64String(""); //relocated fnctnlty to modal
  };

  const handleOpenEdit = (_id) => {
    // Load the data needed for the edit modal
    const pinToRead = {userId: userId, _id: _id, jwtToken: storage.retrieveToken()};

    async function readPin(rJP) {
      try {
        const response = await fetch(bp.buildPath("api/pins/read"), {
          method: "POST",
          body: JSON.stringify(rJP),  //rJP = "read JSON packet"
          headers: { "Content-Type": "application/json" },
        });

        console.log("Attempted to read Pin:\n", pinToRead);

        var responseDetails = JSON.parse(await response.text());
        console.log("Response:", responseDetails);

        if (
          responseDetails.hasOwnProperty("ret") &&
          responseDetails.ret.hasOwnProperty("Status")
          && responseDetails.ret.Status != 200
        ) {
          //Handle errors from Pin Read API (e.g. token not refreshed)
          console.error("Error from Pin Read API");
          console.log(responseDetails.error);
          if (responseDetails.ret.Status == 401) {  // JWT issue, logging the user out
            console.error("Oh no! The JWT JSON Web Token is expired. Logging you out...\n");
            goBackToLogin();
          }
        } else {
          storage.storeToken(responseDetails.jwtToken); // Refresh the JWT JSON Web Token
          setName(responseDetails.ret.temp.EntryName);
          setEntNmErr(false);
          setDescr(responseDetails.ret.temp.EntryDesc);
          sDErr(false);
          setLat(responseDetails.ret.temp.Latitude);
          setLaErr(false);
          setLon(responseDetails.ret.temp.Longitude);
          setLoErr(false);
          set_id(responseDetails.ret.temp._id);
          setB64String(responseDetails.ret.temp.Photo);
        }
      } catch (error) {
        console.error("Error: pin data for the selected pin to EDIT could not be retrieved.\nError response:", error);
        storage.storeToken(responseDetails.jwtToken); // Refresh the JWT JSON Web Token
      }
    }

    // Call the read pin function
    readPin(pinToRead);

    console.log("Opening edit with:", name, lat, lon, descr);

    setOpenManAddMod(false);
    setOpenMapAddMod(false);
    setOpenEditMod(true);
    setOverlayClosed(false);
    // editModalRef.current.open();
  };

  const handleCloseEdit = () => {
    // editModalRef.current.close();
    setOpenEditMod(false);
    setOverlayClosed(true);
    setB64String("");
    set_id("");
    current_id = "";
    setLat(0.0);
    setLon(0.0);
    setDescr("");
    setName("");
    setFile(null);
  };
  ////////////////////////////////////////////////////////////////////

  const handleDeleteEntry = async () => {
    if (window.confirm("Are you sure you want to delete this entry?")) {
      // User clicked "OK" (yes), so perform the desired action
      //alert("You clicked Yes! Deleting entry...");
      var dJP = {_id: current_id, jwtToken: storage.retrieveToken()};  //dJP = "delete JSON packet"
      try {
        const response = await fetch(bp.buildPath("api/pins/delete"), {
          method: "POST",
          body: JSON.stringify(dJP),
          headers: { "Content-Type": "application/json" },
        });

        var responseDetails = JSON.parse(await response.text());
        console.log("Response:", responseDetails);

        if (
          responseDetails.hasOwnProperty("Status") &&
          responseDetails.Status == 401
        ) { // JWT JSON Web Token for the current session is expired! So, log the user out and go back to the Login page.
          console.error("Oh no! Your JWT JSON Web Token for your current session on the site is expired.\nLogging you out...");
          console.error("Details of the error:\n%s\n", responseDetails.error);
          storage.storeToken(responseDetails.jwtToken); // Reset the JWT JSON Web Token to the empty string, ''.
          console.error("JSON Web Token reset to the empty string, ''.\nIts current value is:\n%s\n", responseDetails.jwtToken);  //Debug - make sure the JWT JSON Web Token is actually being reset to the empty string, ''.
          console.error("Now, we are ACTUALLY going to log you out...\n");  //Debug
          goBackToLogin();
        } else if (
          responseDetails.hasOwnProperty("Status")
          && responseDetails.Status != 200  
        ) {
          console.error("Oh no! Some non-JWT 'JSON Web Token Expired' error occurred in the response.\nHere are the details:\n");
          console.error(responseDetails);
          console.error("Specifically, the ERROR MESSAGE from the 'Pin Delete' API response is:\n%s\n", responseDetails.error);
          // storage.storeToken(responseDetails.jwtToken); // Even though there was an error, it was NOT a 'JWT JSON Web Token Expired,' error. So, refresh the JWT JSON Web Token. 
          goBackToLogin();
        }
         else {
          console.log("Pin delete request good"); //Debug 
          storage.storeToken(responseDetails.jwtToken); // Refresh the JWT JSON Web Token.
          console.log("Deleted Pin:", dJP); //Debug

          console.log("Deleting icon for pin...\n");  //Debug
          const foundFeature = iconFeatures.find((feature) => {
            const featureID = feature.get('_id');
          
            return (
              featureID == dJP._id  // If this is true, then the find() function will return the feature for which this is true. Otherwise, if nonf of the features make it true, it will return undefined.
            );
          });

          if (foundFeature != undefined) {
            iconLayer.getSource().removeFeature(foundFeature);
            console.log("Icon for Pin ID %s deleted!!! :D", dJP._id); //Debug  
            handleCloseEdit();  //Close the Edit modal, now that the entry it is for editing no longer exists

            // Refresh the table
            refreshLoad();
          }
          else {
            console.error("Error: Pin Icon for entry with Pin ID #%s not found!!!", dJP._id);  //Debug
          }
          //---------------------------------------------------------------------------------//
        }

        // Clear all feature states
        setB64String("");
        setLat(0.0);
        setLon(0.0);
        setName("");
        setDescr("");
        set_id("");
        current_id = "";
        setFile(null);
      } catch (e) {
        //alert(e.toString());
        console.log(e.toString());
        return;
      }
    } else {
      // User clicked "Cancel" (no), so handle the cancellation or perform an alternative action
      //alert("You clicked No or Cancel!");
      return;
    }
  };

  //------- MAP & ENTRY MANIPULATION FUNCTIONS ----------------------//

  function goToImage(_id, latitude, longitude) {
    if (map) {
      const pinCoords = fromLonLat([longitude, latitude]);
      console.log("Entry:", _id, pinCoords);
      map.getView().setCenter(pinCoords);
      map.getView().setZoom(6.7);
    }
  }

  function addIconToMap(iconLayer, entry) {
    console.log("Adding to map: ", entry);

    const iconFeature = new Feature({
      geometry: new Point(fromLonLat([entry.Longitude, entry.Latitude])),
    });

    var newStyle = new Style({
      image: new Icon({
        src: "ImgIco.png",  // Use the imported image
        scale: 0.03
      }),
    });

    iconFeature.setStyle(newStyle);

    iconFeature.set("_id", entry._id);
    iconFeature.set("Latitude", entry.Latitude);
    iconFeature.set("Longitude", entry.Longitude);
    iconFeature.set("EntryName", entry.EntryName);

    console.log("Icon Feature _id: %s\nIcon Feature Latitude: %f\nIcon Feature Longitude: %f\nIcon Feature EntryName: %s\n",
    entry._id, entry.Latitude, entry.Longitude, entry.EntryName);

    iconLayer.getSource().addFeature(iconFeature);

    setIconFeatures((prevFeatures) => [...prevFeatures, iconFeature]);
  }

  function refreshLoad() {
    setIconsNotLoaded(true);
    userData2 = JSON.parse(localStorage.getItem("user_data"));
    userId2 = userData2.id;
    console.log("'Refresh Load' called with User ID %s\n", userId2);
    loadIcons();
  }
  //---- ENTRY DATA MANIPULATION FUNCTIONS ----------------------------//

  const handleClearTable = () => {
    // Remove the icon features from the map
    iconFeatures.forEach((feature) => {
      iconLayer.getSource().removeFeature(feature);
    });

    // Clear the table data and icon features
    setTableData([]);
    setIconFeatures([]);
  };

  function goBackToLogin() {
    window.location.href = "/";
    storage.storeToken(""); // Since logging out, set the JWT JSON Web Token to the empty string, '', making it so that the user has to Log In again, thus generating a new JWT JSON Web Token, if they want to continue using the app 
    
    // Also unset all current states, including user data
    setLat(0.0);
    setLon(0.0);
    setFile(null);
    setName("");
    setDescr("");
    setB64String("");
    setUserId("");
    setFirstName("");
    setIconsNotLoaded(true);
  }

  //---- MODAL COMPS --------------------------------------------------//

  //Placing the edit modal here for now due to async issues
  //--NOTE: EditModal() function NO LONGER USED due to React re-rendering 
  // and consequent un-focusing issues. Edit Modal has been placed 
  // directly in the return value for the MainPage component-----------//
  function EditModal() {
    const [entNmErr, setEntNmErr] = useState(false);
    const [laErr, setLaErr] = useState(false);
    const [loErr, setLoErr] = useState(false);
    const [dErr, sDErr] = useState(false);

    const handleSubmitEdits = async () => {
      console.log("Submitted edits");
      // You can use the edited values like editedName, editedLat, editedLon, editedDescr, and b64String here.
      if (lat && (lat >= -90 && lat <= 90) 
      && lon && (lon >= -180 && lon < 180) 
      && b64String && name && descr) {
        try {
          var editedEntry = { // "eJP" = "edit JSON Packet"
            userId: userId,
            _id: _id,  // This should be the Object ID generated by MongoDB for the current Pin
            entryName: name, 
            entryDesc: descr, 
            latitude: lat, 
            longitude: lon, 
            photo: b64String, 
            jwtToken: storage.retrieveToken()
          };

          const response = await fetch(bp.buildPath("api/pins/edit"), {
            method: "POST",
            body: editedEntry,
            headers: { "Content-Type": "application/json" },
          });
          console.log("Sent:", editedEntry);  //Debug - check if the API call is actually sending

          //TODO: figure out why the below line is causing errors
          var responseDetails = JSON.parse(await response.text());  // Wait for the response JSON text, and then parse it into a JSON object
          console.log("Response:", responseDetails);

          if (
            responseDetails.hasOwnProperty("Status") &&
            responseDetails.Status == 500
          ) {
            //Handle errors - The entry failed to be edited for the user
            console.log("Error from 'Pin Edit' API"); //Debug
            console.log("Current response details JSON object: ", responseDetails); // Dbug
            storage.storeToken(responseDetails.jwtToken); // Refresh the JWT
          } else if (
            responseDetails.hasOwnProperty("Status") 
            && responseDetails.Status == 401
            ) { // Expired JWT JSON Web Token; log the user out
              console.error("Your JWT was Expired!\n");
              console.error("The JWT expiration error message is:\n%s\n",responseDetails.error);
              console.error("Resetting the JWT JSON Web Token to be empty...\n");
              storage.storeToken(responseDetails.jwtToken);
              console.error("JWT JSON Web Token reset to be the empty string, ''.\n");
              console.error("Taking you back to the Login page...\n");
              window.location.href = "/"; // Go back to the login page now that the empty JWT has been set
          } else {
            console.log("Pin add-to-database request good");  //Debug
            storage.storeToken(responseDetails.jwtToken); // Store the refreshed JWT JSON Web Token
            console.log("Token refreshed; token is now %s\n", responseDetails.jwtToken);

            console.log("Pin ID found by the server:", responseDetails.ret._id);  //Debug
            console.log("Full entry now:\n", editedEntry);  //Debug
            
            // Add the entry to the table data
            // Make sure it has the appropriate JSON names!
            // E.g., we need uppercase Keys instead of lowercase ones,
            // and we can't have a JWT Token in the table entry
            const entryConvertedForTable = {
              _id: editedEntry._id,
              Latitude: editedEntry.latitude,
              Longitude: editedEntry.longitude,
              EntryName: editedEntry.entryName,
              EntryDescr: editedEntry.entryDesc,
              Photo: editedEntry.photo // Use the base64 string loaded from the image
            };
            setTableData([...tableData, entryConvertedForTable]);
        
            // Add the entry FROM THE TABLE (the full entry contains unnecessary information,
            // like the User's ID and the current JWT JSON Web Token for the current session) 
            // to the map as an icon, using the "addIconToMap()" function.
            addIconToMap(iconLayer, entryConvertedForTable);

            console.log("Added Pin:", editedEntry);
          }
        } catch (error) {
          console.error("Oh no! The edits failed to submit. Here are the details from the ERROR message:\n%s\n", error.message);
        }
      } else {
        // Handle validation errors or display a message to the user
        if ((lat <= 90) && (lat >= -90)) {  // Lat out of range
          setLaErr(false);
        }
        else {
          setLaErr(true);
        }
        if ((lon < 180) && (lon >= -180)) {  // Lon out of range
          setLoErr(false);
        }
        else {
          setLoErr(true);
        }
        if (descr == "") {
          sDErr(true);
        }
        else {
          sDErr(false);
        }
        if (name == "") {
          setEntNmErr(true);
        }
        else {
          setEntNmErr(false);
        }
        console.error("Validation error: Please fill out all required fields.");
      }
    };

    const handleFileChange = (e) => {
      const selectedFile = e.target.files[0];
      console.log("Loading file:\n", e.target.files[0]);
      if (selectedFile) {
        const reader = new FileReader();

        reader.onload = (event) => {
          const img = new Image();
          img.src = event.target.result;

          img.onload = () => {
            const canvas = document.createElement("canvas");
            const maxWidth = 300; // Adjust the max width as needed
            const maxHeight = 225; // Adjust the max height as needed
            let width = img.width;
            let height = img.height;

            console.log("Image loaded");

            if (width > maxWidth || height > maxHeight) {
              const aspectRatio = width / height;

              if (width > maxWidth) {
                width = maxWidth;
                height = width / aspectRatio;
              }
              console.log("Image width:\n%f\n", width);

              if (height > maxHeight) {
                height = maxHeight;
                width = height * aspectRatio;
              }
              console.log("Image height:\n%f\n", height);
            }

            canvas.width = width;
            canvas.height = height;

            const ctx = canvas.getContext("2d");
            ctx.drawImage(img, 0, 0, width, height);

            const compressedBase64 = canvas.toDataURL("image/jpeg", 0.8); // Adjust quality as needed

            // Set the compressed base64 string to the state
            setB64String(compressedBase64);
            console.log(
              "First 20 characters of base64 string:",
              compressedBase64.slice(0, 40)
            );
          };
        };

        reader.readAsDataURL(selectedFile);
      }
    };

    return (
        <div className="modal-container">
          <div className="modal-content">
            <div className="modal-header">
              <h4 className="modal-name">View and Edit Photo</h4>
              <button
                className="del-modal-button"
                onClick={handleDeleteEntry}
                >
                Delete
              </button>
            </div>
            <div className="modal-body">
              <div className="modal-entry-section">
                <label htmlFor="entNm">Entry Name</label>
                <input
                  type="text"
                  placeholder="Entry Name"
                  className="input-text_name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
                {entNmErr && <p className="error-text">Please give your entry a name.</p>}
                <label htmlFor="entLa">Latitude</label>
                <input
                  type="number"
                  placeholder="0.0000"
                  className="input-number"
                  value={lat}
                  onChange={(e) => setLat(e.target.value)}
                />
                {laErr && <p className="error-text">Please give your entry a valid latitude.</p>}
                <label htmlFor="entLo">Longitude</label>
                <input
                  type="number"
                  placeholder="0.0000"
                  className="input-number"
                  value={lon}
                  onChange={(e) => setLon(e.target.value)}
                />
                {loErr && <p className="error-text">Please give your entry a valid longitude.</p>}
                <label htmlFor="eD">Description</label>
                <textarea
                  placeholder="Entry Description"
                  className="input-text_descr"
                  value={descr}
                  onChange={(e) => setDescr(e.target.value)}
                />
                {dErr && <p className="error-text">Please give your entry a description.</p>}
                <br/>
                <button className="modal-button" onClick={handleSubmitEdits}>
                  Submit
                </button>
              </div>
              <div className="modal-image-section">
                <input
                  type="file"
                  accept="image/jpeg, image/png, image/gif"
                  className="image-input"
                  onChange={handleFileChange}
                />
                {b64String == "" && <p className="error-text">Please give your entry a file.</p>}
                {b64String && (
                  <img
                    src={b64String}
                    alt="Selected Image"
                    className="selected-image"
                  />
                )}
              </div>
            </div>
            <div className="modal-footer">
              <button className="modal-button-close" onClick={handleCloseEdit}>
                Close
              </button>
            </div>
          </div>
        </div>
    );
  };

  // Function name: handleFileChange
  // Description: Function to handle the file change and display the new image for the Edit Modal
  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    console.log("Loading file:\n", e.target.files[0]);
    if (selectedFile) {
      const reader = new FileReader();

      reader.onload = (event) => {
        const img = new Image();
        img.src = event.target.result;

        img.onload = () => {
          const canvas = document.createElement("canvas");
          const maxWidth = 300; // Adjust the max width as needed
          const maxHeight = 225; // Adjust the max height as needed
          let width = img.width;
          let height = img.height;

          console.log("Image loaded");
          console.log("Width: ", width);
          console.log("Height: ", height);

          if (width > maxWidth || height > maxHeight) {
            const aspectRatio = width / height;

            if (width > maxWidth) {
              width = maxWidth;
              height = width / aspectRatio;
            }
            console.log("Image width:\n%f\n", width);

            if (height > maxHeight) {
              height = maxHeight;
              width = height * aspectRatio;
            }
            console.log("Image height:\n%f\n", height);
          }

          canvas.width = width;
          canvas.height = height;

          const ctx = canvas.getContext("2d");
          ctx.drawImage(img, 0, 0, width, height);

          const compressedBase64 = canvas.toDataURL("image/jpeg", 0.8); // Adjust quality as needed

          // Set the compressed base64 string to the state
          setB64String(compressedBase64);
          console.log(
            "First 20 characters of base64 string:",
            compressedBase64.slice(0, 40)
          );
        };
      };

      reader.readAsDataURL(selectedFile);
    }
  };

  // Function name: handleSubmitEdits
  // Description: Function to submit the changes made to the appropriate entry in the current Edit Modal
  const handleSubmitEdits = async () => {
    console.log("Submitted edits");
    // You can use the edited values like editedName, editedLat, editedLon, editedDescr, and b64String here.
    if (lat && (lat >= -90 && lat <= 90) 
    && lon && (lon >= -180 && lon < 180) 
    && b64String && name && descr) {
      try {
        const editedEntry = { // "eJP" = "edit JSON Packet"
          userId: userId,
          _id: _id,  // This should be the Object ID generated by MongoDB for the current Pin
          entryName: name, 
          entryDesc: descr, 
          latitude: parseFloat(lat), 
          longitude: parseFloat(lon), 
          photo: b64String, 
          jwtToken: storage.retrieveToken()
        };

        const response = await fetch(bp.buildPath("api/pins/edit"), {
          method: "POST",
          body: JSON.stringify(editedEntry),
          headers: { "Content-Type": "application/json" },
        });
        console.log("Sent:", editedEntry);  //Debug - check if the API call is actually sending

        var responseDetails = JSON.parse(await response.text());  // Wait for the response JSON text, and then parse it into a JSON object
        console.log("Response:", responseDetails);

        if (
          responseDetails.hasOwnProperty("Status") &&
          responseDetails.Status == 500
        ) {
          //Handle errors - The entry failed to be edited for the user
          console.log("Error from 'Pin Edit' API"); //Debug
          console.log("Current response details JSON object: ", responseDetails); // Dbug
          goBackToLogin();
        } else if (
          responseDetails.hasOwnProperty("Status") 
          && responseDetails.Status == 401
          ) { // Expired JWT JSON Web Token; log the user out
            console.error("Your JWT was Expired!\n");
            console.error("The JWT expiration error message is:\n%s\n",responseDetails.error);
            console.error("Resetting the JWT JSON Web Token to be empty...\n");
            storage.storeToken(responseDetails.jwtToken);
            console.error("JWT JSON Web Token reset to be the empty string, ''.\n");
            console.error("Taking you back to the Login page...\n");
            goBackToLogin(); // Go back to the login page now that the empty JWT has been set
        } else {
          console.log("Pin add-to-database request good");  //Debug
          storage.storeToken(responseDetails.jwtToken); // Store the refreshed JWT JSON Web Token
          console.log("Token refreshed; token is now %s\n", responseDetails.jwtToken);

          console.log("Pin ID found by the server:", responseDetails.ret._id);  //Debug
          console.log("Full entry now:\n", editedEntry);  //Debug
          
          // Add the entry to the table data
          // Make sure it has the appropriate JSON names!
          // E.g., we need uppercase Keys instead of lowercase ones,
          // and we can't have a JWT Token in the table entry
          // const entryConvertedForTable = {
          //   _id: editedEntry._id,
          //   Latitude: editedEntry.latitude,
          //   Longitude: editedEntry.longitude,
          //   EntryName: editedEntry.entryName,
          //   EntryDescr: editedEntry.entryDesc,
          //   Photo: editedEntry.photo // Use the base64 string loaded from the image
          // };
          // setTableData([...tableData, entryConvertedForTable]);
      
          // // Add the entry FROM THE TABLE (the full entry contains unnecessary information,
          // // like the User's ID and the current JWT JSON Web Token for the current session) 
          // // to the map as an icon, using the "addIconToMap()" function.
          // addIconToMap(iconLayer, entryConvertedForTable);

          console.log("Added Pin:", editedEntry);
          handleCloseEdit();

          // Refresh the table
          refreshLoad();
        }
      } catch (error) {
        console.error("Oh no! The edits failed to submit. Here are the details from the ERROR message:\n%s\n", error.message);
      }
    } else {
      // Handle validation errors or display a message to the user
      if ((lat <= 90) && (lat >= -90)) {  // Lat out of range
        setLaErr(false);
      }
      else {
        setLaErr(true);
      }
      if ((lon < 180) && (lon >= -180)) {  // Lon out of range
        setLoErr(false);
      }
      else {
        setLoErr(true);
      }
      if (descr == "") {
        sDErr(true);
      }
      else {
        sDErr(false);
      }
      if (name == "") {
        setEntNmErr(true);
      }
      else {
        setEntNmErr(false);
      }
      console.error("Validation error: Please fill out all required fields.");
    }
  };

  // States: Edit Modal Error States
  // Description: States used to set error messages within the Edit Modal
  const [entNmErr, setEntNmErr] = useState(false);
  const [laErr, setLaErr] = useState(false);
  const [loErr, setLoErr] = useState(false);
  const [dErr, sDErr] = useState(false);

  //---- TUTORIAL BUTTON -----------------------------------------------//
  function showTutText() {
    if (tutIsVis) {
      setTutIsVis(false);
      setOverlayClosed(true);
    }
    else {
      setTutIsVis(true);
      setOverlayClosed(false);
    }
  }

  //---- CLOSE THE POPUP OVERLAY ----------------------------------------//
  function closeOverlay() {
    if (!overlayClosed) {
      setOverlayClosed(true);
    }
    setTutIsVis(false);
    if (isEditModOpen)
      handleCloseEdit();
    if (isManAddModOpen)
      handleCloseMan();
    if (isMapAddModOpen)
      handleCloseMap();
  }

  return (
    <div className="main-page">
    <div className="overlay" style=
    {{visibility : (isEditModOpen 
    || isManAddModOpen 
    || isMapAddModOpen
    || tutIsVis
    && (!overlayClosed)) ? "visible" 
    : "hidden"}}
    onClick={closeOverlay}></div>
      <header className="title-bar">
        <div className="welcome-message">Welcome, {firstName}</div>
        <div className="app-title"><b><ins>PlaceFolio</ins></b></div>
        <button className="logout-button" onClick={goBackToLogin}>
          Logout
        </button>
      </header>
      <main className="main-content">
        <div className="left-section">
          <div className="table-container">
            {/* Table goes here */}
            <div className="main-page-table">
              <div className="table-header">
                  <div className="table-header-cell"><b>Name</b></div>
                  <div className="table-header-cell"><b>Lat</b></div>
                  <div className="table-header-cell"><b>Long</b></div>
                  <div className="table-header-cell"><b>Go To</b></div>
              </div>
              <div className="main-page-table-body">
                {tableData.map((tableEntry, index) => {
                  const goToImageCallback = () => {
                    goToImage(
                      tableEntry._id,
                      tableEntry.Latitude,
                      tableEntry.Longitude
                    );
                  };

                  return (
                    <div key={index} className={index % 2 == 0 ? "main-page-table-row-even" : "main-page-table-row-odd"}>
                      <div key={tableEntry._id} style={{ display: "none" }}>
                        {tableEntry._id}
                      </div>
                      <div key={tableEntry.EntryName} className="table-entry-name">{tableEntry.EntryName}</div>
                      <div key={tableEntry.Latitude} className="table-number">
                        {typeof tableEntry.Latitude === "number"
                          ? tableEntry.Latitude.toPrecision(6)
                          : ""}
                      </div>
                      <div key={tableEntry.Longitude} className="table-number">
                        {typeof tableEntry.Longitude === "number"
                          ? tableEntry.Longitude.toPrecision(6)
                          : ""}
                      </div>
                      <div className="go-to-entry-cell">
                        <button
                          className="btn btn-secondary"
                          type="button"
                          id="go-to-entry-button"
                          onClick={goToImageCallback}
                        >
                          Go To
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
          <div className="bottom-container">
            <div className="button-container">
              <button
                className="action-button-main"
                type="button"
                id="man-add-button"
                href="#ManAdd"
                onClick={handleOpenMan}
              >
                {" "}
                <b>Add by Manual</b>{" "}
              </button>
              <button
                className={
                  locationMode ? "active-map-add-button" : "action-button-main"
                }
                type="button"
                id="map-add-button"
                href="#MapAdd"
                onClick={handleSetLocMode}
              >
                {" "}
                <b>Add by Map</b>{" "}
              </button>
              <button className="refr-button" onClick={refreshLoad}>
                Refresh
              </button>
              <button className="tut-button" onClick={showTutText}>
                Help&ensp;<FontAwesomeIcon icon={faQuestionCircle} />
              </button>
            </div>
          </div>
        </div>
        <div className="map-section">
          <div
            id="map"
            style={{
              width: "100%",
              height: "600px",
              marginBottom: "20%",
              marginRight: "20%",
              position: "relative"
            }}
          >
          </div>
        </div>
        <div
          className="modal-wrapper"
          // style={{ display: isManAddModOpen ? "block" : "none" }}
        >
          <ManAddModal
            userId={userId}
            isOpen={isManAddModOpen}
            handleOpenMan={handleOpenMan}
            handleCloseMan={handleCloseMan}
            lat={lat} // Pass the selected latitude
            lon={lon} // Pass the selected longitude
            file={file}
            name={name}
            descr={descr}
            setLat={setLat}
            setLon={setLon}
            setFile={setFile}
            setName={setName}
            setDescr={setDescr}
            b64String={b64String}
            setB64String={setB64String}
            setLocationMode={setLocationMode}
            LocationMode={locationMode}
            addIconToMap={addIconToMap}
            iconLayer={iconLayer}
            setTableData={setTableData}
            tableData={tableData}
            ref={manAddModalRef}
          />
        </div>
        <div
          className="modal-wrapper"
          // style={{ display: isMapAddModOpen ? "block" : "none" }}
        >
          <MapAddModal
            userId={userId}
            isOpen={isMapAddModOpen}
            handleOpenMap={handleOpenMap}
            handleCloseMap={handleCloseMap}
            handleDeleteEntry={handleDeleteEntry}
            _id={_id}
            lat={lat} // Pass the selected latitude
            lon={lon} // Pass the selected longitude
            file={file}
            name={name}
            descr={descr}
            setLat={setLat}
            setLon={setLon}
            setFile={setFile}
            setName={setName}
            setDescr={setDescr}
            b64String={b64String}
            setB64String={setB64String}
            setLocationMode={setLocationMode}
            LocationMode={locationMode}
            addIconToMap={addIconToMap}
            iconLayer={iconLayer}
            setTableData={setTableData}
            tableData={tableData}
            ref={mapAddModalRef}
          />
        </div>
        <div className="modal-wrapper"
        style={{display : isEditModOpen ? "block" : "none"}}>
          {/* <EditModal
            userId={userId}
            isOpen={isEditModOpen}
            handleOpenEdit={handleOpenEdit}
            handleCloseEdit={handleCloseEdit}
            setLat={setLat}
            setLon={setLon}
            setFile={setFile}
            setName={setName}
            setDescr={setDescr}
            _id={_id}
            latitude={lat}
            longitude={lon}
            descr={descr}
            addIconToMap={addIconToMap}
            iconLayer={iconLayer}
            setTableData={setTableData}
            tableData={tableData}
            b64String={b64String}
            // ref={editModalRef}
          /> */}
            <div className="modal-container">
              <div className="modal-content">
                <div className="modal-header">
                  <h4 className="modal-name">View and Edit Photo</h4>
                  <button
                    className="del-modal-button"
                    onClick={handleDeleteEntry}
                    >
                    Delete
                  </button>
                </div>
                <div className="modal-body">
                  <div className="modal-entry-section">
                    <label htmlFor="entNm">Entry Name</label>
                    <input
                      type="text"
                      placeholder="Entry Name"
                      className="input-text_name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                    />
                    {entNmErr && <p className="error-text">Please give your entry a name.</p>}
                    <label htmlFor="entLa">Latitude</label>
                    <input
                      type="number"
                      placeholder="0.0000"
                      className="input-number"
                      value={lat}
                      onChange={(e) => setLat(e.target.value)}
                    />
                    {laErr && <p className="error-text">Please give your entry a valid latitude.</p>}
                    <label htmlFor="entLo">Longitude</label>
                    <input
                      type="number"
                      placeholder="0.0000"
                      className="input-number"
                      value={lon}
                      onChange={(e) => setLon(e.target.value)}
                    />
                    {loErr && <p className="error-text">Please give your entry a valid longitude.</p>}
                    <label htmlFor="eD">Description</label>
                    <textarea
                      placeholder="Entry Description"
                      className="input-text_descr"
                      value={descr}
                      onChange={(e) => setDescr(e.target.value)}
                    />
                    {dErr && <p className="error-text">Please give your entry a description.</p>}
                    <br/>
                    <button className="modal-button" onClick={handleSubmitEdits}>
                      Submit
                    </button>
                  </div>
                  <div className="modal-image-section">
                    <input
                      type="file"
                      accept="image/jpeg, image/png, image/gif"
                      className="image-input"
                      onChange={handleFileChange}
                    />
                    {b64String == "" && <p className="error-text">Please give your entry a file.</p>}
                    {b64String && (
                      <img
                        src={b64String}
                        alt="Selected Image"
                        className="selected-image"
                      />
                    )}
                  </div>
                </div>
                <div className="modal-footer">
                  <button className="modal-button-close" onClick={handleCloseEdit}>
                    Close
                  </button>
                </div>
              </div>
            </div>
          {/*-----ALTERNATIVE FOR EDIT MODAL DUE TO REACT RE-RENDERING THE COMPONENT REPEATEDLY-------*/}
          {/*-----------------------------------------------------------------------------------------*/}
        </div>
        <div className={`tutorial-div ${tutIsVis ? 'visible' : 'hidden'}`} // style={{visibility : tutIsVis ? "visible" : "hidden"}}
        >
          <h3 className="tutorial-div-header">So how does this work?</h3>
          <div className={`tutorial-div-body-text ${tutIsVis ? 'visible' : 'hidden'}`}>
            <p className="tutorial-div-subheader"><i>Well, you place "Photo Entries" on the map!</i></p>
            <div className="tutorial-div-paragraphs">
              <p><ins>You can do it in one of two ways:</ins><br/><br/>
                1) By clicking the "Add by Map" button, which allows you to place a Photo Entry at the next spot you click on the map,<br/>
                2) By clicking the "Add by Manual" button, which allows you to manually input the position (latitude and longitude) 
                where you want to place your Photo Entry. <br/><br/>
                Each placed Photo Entry is represented by an icon on the map. When you click that icon, you can both <b>see</b> and <b>edit</b> the stuff about your picture.
                Each Photo Entry has a "<i>Name,</i>" "<i>Latitude</i>" (or "<i>Lat</i>" for short), "<i>Longitude</i>" (or "<i>Long</i>" for short), "<i>Description,</i>" and "<i>Image</i>." 
                Give the Image by uploading a <i>File</i>.<br/><br/>
                You can view different areas of the map by clicking on it and dragging your mouse around.
                You can also click the "Go To" button next to any of your Photo Entries in the table on the left if you want to center 
                the map directly on that Photo Entry.
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default MainPage;
