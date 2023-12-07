import React, { useState, useEffect, forwardRef, useImperativeHandle } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import "../../components/MainPage.css";

const jwt = require("jsonwebtoken");
const storage = require("../../tokenStorage.js");
const bp = require("../../components/Path.js");

// function EditModal({
  // userId, 
  // isOpen, 
  // handleCloseEdit, 
  // name, 
  // lat, 
  // lon, 
  // descr, 
  // file, 
  // addIconToMap, 
  // iconLayer, 
  // setTableData, 
  // tableData, 
  // b64String, 
  // children 
// }) {
//   const [editedName, setEditedName] = useState(name);
//   const [editedLat, setEditedLat] = useState(lat);
//   const [editedLon, setEditedLon] = useState(lon);
//   const [editedFile, setEditedFile] = useState(null);
//   const [editedDescr, setEditedDescr] = useState(descr);

//   useEffect(() => {
//     // Initialize state variables with prop values when component mounts
//     setEditedName(name);
//     setEditedLat(lat);
//     setEditedLon(lon);
//     setEditedFile(file);
//     setEditedDescr(descr);

//     console.log("Modal:", name, lat, lon, file, descr);
//   }, []);

//   const handleSubmitEdits = () => {
//     console.log("Submitted edits");
//     console.log("Modal:", name, lat, lon, file, descr);
//     // You can use the edited values like editedName, editedLat, editedLon, editedDescr, and b64String here.
//   };

//   const handleFileChange = (e) => {
//     // Update the selected file
//     setEditedFile(e.target.files[0]);
//   };

//   return (
//     <div className={`modal ${isOpen ? 'open' : ''}`}>
//       <div className="modal-content">
//         {children}
//         <div className="modal-header">
//           <h4 className="modal-name">Edit Photo</h4>
//         </div>
//         <div className="modal-body">
//           <div className='image-region'>
//           {b64String && (1
//             /*<img
//               src={`${b64String}`} // Assuming it's a PNG image, update the MIME type if necessary
//               alt="Selected Image"
//               className="selected-image"
//             />*/
//           )}
//           </div>
//           <div className='input-region'>
//           <input type="file" className="image-input" onChange={handleFileChange} />
//           <br />
//           <input
//             type="text"
//             className="input-text"
//             placeholder="Name"
//             value={editedName}
//             onChange={(e) => setEditedName(e.target.value)}
//           />
//           <br />
//           <input
//             type="number"
//             className="input-number"
//             placeholder="10.0000"
//             value={editedLat}
//             onChange={(e) => setEditedLat(e.target.value)}
//           />
//           <br />
//           <input
//             type="number"
//             className="input-number"
//             placeholder="10.0000"
//             value={editedLon}
//             onChange={(e) => setEditedLon(e.target.value)}
//           />
//           <br />
//           <input
//             type="text"
//             className="input-text"
//             placeholder="Description"
//             value={editedDescr}
//             onChange={(e) => setEditedDescr(e.target.value)}
//           />
//           </div>
//           <br />
//           <button className="modal-button" onClick={handleSubmitEdits}>
//             Submit
//           </button>
//         </div>
//         <div className="modal-footer">
//           <button className="modal-button" onClick={handleCloseEdit}>
//             Close
//           </button>
//         </div>
//       </div>
//     </div>
//   );
// }

//--------------------------------------------------------------------------//

// Below is the attempt at making the Edit Modal using the "Framer Motion" package.
// It did not work.

const EditModal = forwardRef(({
  userId, 
  isOpen,
  _id, 
  handleOpenEdit, 
  handleCloseEdit, 
  handleDeleteEntry, 
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
  addIconToMap, 
  iconLayer, 
  tableData, 
  setTableData,
  currentJwt, 
  children 
}, ref) => {
  const [open, setOpen] = useState(false);
  const [entNmErr, setEntNmErr] = useState(false);
  const [laErr, setLaErr] = useState(false);
  const [loErr, setLoErr] = useState(false);
  const [fErr, sFErr] = useState(false);
  const [dErr, sDErr] = useState(false);

  const handleSubmitEdits = async () => {
    //console.log("Submitted edits");
    // Handle validation errors or display a message to the user
    if ((lat + 0.0001 > 90 && lat - 0.0001 > 90)
    || (lat + 0.0001 < -90 && lat - 0.0001 < -90)) {  // Lat out of range
      setLaErr(true);
    }
    else {
      setLaErr(false);
    }
    if ((lon > 180 && lon - 0.0001 > 180)
    || (lon + 0.0001 < -180 && lon - 0.0001 < -180)) {  // Lon out of range
      setLoErr(true);
    }
    else {
      setLoErr(false);
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
    if (entNmErr || laErr || loErr || dErr) {
      console.error('Validation error: Please fill out all required fields.');
      return;
    }
    // You can use the edited values like editedName, editedLat, editedLon, editedDescr, and b64String here.
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
      //console.log("Sent:", editedEntry);  //Debug - check if the API call is actually sending

      var responseDetails = JSON.parse(await response.text());  // Wait for the response JSON text, and then parse it into a JSON object
      //console.log("Response:", responseDetails);

      if (
        responseDetails.hasOwnProperty("Status") &&
        responseDetails.Status == 500
      ) {
        //Handle errors - The entry failed to be edited for the user
        console.log("Error from 'Pin Edit' API"); //Debug
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

        //console.log("Pin ID found by the server:", responseDetails._id);  //Debug
        //console.log("Full entry now:\n", editedEntry);  //Debug
        
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

        //console.log("Added Pin:", editedEntry);

        handleCloseEdit();
      }
    } catch (error) {
      console.error("Error from edit function:\n%s\n", error.message);
    }
  };

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    //console.log("Loading file:\n", e.target.files[0]);
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
          //console.log(
          //  "First 20 characters of base64 string:",
          //  compressedBase64.slice(0, 40)
          //);
        };
      };

      reader.readAsDataURL(selectedFile);
    }
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
      >
      <div className="modal-container">
        <div className="modal-content">
          {children}
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
              <input
                type="text"
                placeholder="Entry Name"
                className="input-text_name"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
              <input
                type="number"
                placeholder="0.0000"
                className="input-number"
                value={lat}
                onChange={(e) => setLat(e.target.value)}
              />
              <input
                type="number"
                placeholder="0.0000"
                className="input-number"
                value={lon}
                onChange={(e) => setLon(e.target.value)}
              />
              <textarea
                placeholder="Entry Description"
                className="input-text_descr"
                value={descr}
                onChange={(e) => setDescr(e.target.value)}
              />
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
      </motion.div>
    </AnimatePresence>
  );
});


export default EditModal;