import React, { forwardRef, useImperativeHandle, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

import "../../components/MainPage.css";

const storage = require("../../tokenStorage");
const bp = require("../../components/Path.js");

const ManAddModal = forwardRef(({
  userId,
  isOpen,
  handleOpenMan,
  handleCloseMan,
  lat,
  lon,
  file,
  name,
  descr,
  setLat,
  setLon,
  setFile,
  setName,
  setDescr,
  b64String,
  setB64String,
  locationMode,
  setLocationMode,
  addIconToMap,
  iconLayer,
  tableData,
  setTableData,
  children,
}, ref) => {
  const [open, setOpen] = useState(false);
  const [entNmErr, setEntNmErr] = useState(false);
  const [laErr, setLaErr] = useState(false);
  const [loErr, setLoErr] = useState(false);
  const [fErr, sFErr] = useState(false);
  const [dErr, sDErr] = useState(false);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      sFErr(false);
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

            if (height > maxHeight) {
              height = maxHeight;
              width = height * aspectRatio;
            }
          }

          canvas.width = width;
          canvas.height = height;

          const ctx = canvas.getContext("2d");
          ctx.drawImage(img, 0, 0, width, height);

          const compressedBase64 = canvas.toDataURL("image/jpeg", 0.8); // Adjust quality as needed

          // Set the compressed base64 string to the state
          setB64String(compressedBase64);
          //console.log(
          //  "First 20 characters of base64 string:",
          //  compressedBase64.slice(0, 40)
          //);
        };
      };

      reader.readAsDataURL(selectedFile);
    }
  };

  const submitMapAddition = async () => {
    // Validate the input data (lat, lon, file, name, and descr)
    if (lat && (lat >= -90 && lat <= 90) 
    && lon && (lon >= -180 && lon < 180) 
    && b64String && name && descr) {
      // Create an entry object with the submitted data
      const entry = {
        userId: userId,
        entryName: name,
        entryDesc: descr,
        latitude: parseFloat(lat), // Parse lat and lon as floats
        longitude: parseFloat(lon), 
        photo: b64String,
        jwtToken: storage.retrieveToken(),
      };

      //console.log(entry);

      //console.log("JSON test:", entry);
      var eJP = JSON.stringify(entry);  //eJP = "entry JSON pakcet"

      console.log("Sending request to API"); //Debug

      // Try to do the "Create Pin" API call
      try {
        const response = await fetch(bp.buildPath("api/pins/create"), {
          method: "POST",
          body: eJP,
          headers: { "Content-Type": "application/json" },
        });
        //console.log("Sent:", eJP);  //Debug - check if the API call is actually sending

        var responseDetails = JSON.parse(await response.text());
        //console.log("Response:", responseDetails);

        if (
          responseDetails.hasOwnProperty("Status") &&
          responseDetails.Status == 500
        ) {
          //Handle errors - The entry failed to be added to the user
          console.log("Error from 'Create Pin' API"); //Debug
          //console.log("Current response details JSON object: ", responseDetails); // Dbug
          storage.storeToken(responseDetails.jwtToken); // Refresh the JWT
        } else if (
          responseDetails.hasOwnProperty("Status") 
          && responseDetails.Status == 401
          ) { // Expired JWT JSON Web Token; log the user out
            console.error("Your JWT was Expired!\n");
            //console.error("The JWT expiration error message is:\n%s\n",responseDetails.error);
            //console.error("Resetting the JWT JSON Web Token to be empty...\n");
            storage.storeToken(responseDetails.jwtToken);
            //console.error("JWT JSON Web Token reset to be the empty string, ''.\n");
            console.error("Taking you back to the Login page...\n");
            window.location.href = "/"; // Go back to the login page now that the empty JWT has been set
        } else {
          console.log("Pin addition request good");  //Debug
          storage.storeToken(responseDetails.jwtToken); // Store the refreshed JWT JSON Web Token
          //console.log("Token refreshed; token is now %s\n", responseDetails.jwtToken);

          // Update the entry's pin ID based on the returned inserted ID
          entry._id = responseDetails.ret.pin.insertedId;
          // Add the entry to the table data
          // Make sure it has the appropriate JSON names!
          // E.g., we need uppercase Keys instead of lowercase ones,
          // and we can't have a JWT Token in the table entry
          const entryConvertedForTable = {
            _id: entry._id,
            Latitude: entry.latitude,
            Longitude: entry.longitude,
            EntryName: entry.entryName,
            EntryDescr: entry.entryDesc,
            Photo: entry.photo // Use the base64 string loaded from the image
          };
          setTableData([...tableData, entryConvertedForTable]);
      
          // Add the entry FROM THE TABLE (the full entry contains unnecessary information,
          // like the User's ID and the current JWT JSON Web Token for the current session) 
          // to the map as an icon, using the "addIconToMap()" function.
          addIconToMap(iconLayer, entryConvertedForTable);

          //console.log("Added Pin:", entry);
        }
      } catch (e) {
        alert(e.toString());
        return;
      }

      // Uncheck errors
      setLaErr(false);
      setLoErr(false);
      setEntNmErr(false);
      sFErr(false);
      sDErr(false);
  
      // Clear the input fields
      setLat(0.0);
      setLon(0.0);
      setFile(null);
      setName('');
      setDescr('');
      setLocationMode(false);
      setB64String("");
      handleCloseMan(); // Close the "Add by Manually Inputting The Latitude and Longitude" modal
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
      if (file == null) {
        sFErr(true);
      }
      else {
        sFErr(false);
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

  const handleSubmit = () => {
    // Handle the submission of file and text data.
    // You can send the data to an API, perform validation, etc.
    //console.log("File:", file);
    //console.log("Ent Name:", name);
    //console.log("Lat:", lat);
    //console.log("Lon:", lon);
    //console.log("Des:", descr);

    submitMapAddition();
    handleCloseMan(); // Close the "Add via Manual Lat/Long Entry" modal
  };

  useImperativeHandle(ref, () => {
    return {
      open: () => setOpen(true),
      close: () => setOpen(false)
    };
  });

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div 
      initial = {{
        opacity: 0,
        scale: 0
      }}
      animate = {{
        opacity: 1,
        scale: 1,
        transition: {
          duration: 1
        }
      }}
      exit = {{
        opacity: 0,
        scale: 0
      }}
      className="modal-container">
        <div className="modal-content">
          {children}
          <div className="modal-header">
            <h4 className="modal-name">Add Photo</h4>
          </div>
          <div className="modal-body">
            <div className="modal-entry-section">
              <label htmlFor="entNm">Entry Name</label>
              <input
                type="text"
                id="entNm"
                placeholder="Entry Name"
                className='input-text_name'
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                }}
              />
              {entNmErr && <p className="error-text">Please give your entry a name.</p>}
              <label htmlFor="entLa">Latitude</label>
              <input
                type="number"
                id="entLa"
                placeholder="0.0000"
                className="input-number"
                value={lat}
                onChange={(e) => {
                  setLat(e.target.value);
                }}
              />
              {laErr && <p className="error-text">Please give your entry a valid latitude.</p>}
              <label htmlFor="entLo">Longitude</label>
              <input
                type="number"
                id="entLo"
                placeholder="0.0000"
                className="input-number"
                value={lon}
                onChange={(e) => {
                  setLon(e.target.value);
                }}
              />
              {loErr && <p className="error-text">Please give your entry a valid longitude.</p>}
              <label htmlFor="eD">Description</label>
              <textarea
                id="eD"
                placeholder="Entry Description"
                className='input-text_descr'
                value={descr}
                onChange={(e) => {
                  setDescr(e.target.value);
                }}
              />
              {dErr && <p className="error-text">Please give your entry a description.</p>}
              <br/>
              <button className="modal-button" onClick={handleSubmit}>
                Submit
              </button>
            </div>
            <div className="modal-image-section">
              <label htmlFor="eI">Image</label>
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
            <button className="modal-button-close" onClick={handleCloseMan}>
              Close
            </button>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
});

export default ManAddModal;
