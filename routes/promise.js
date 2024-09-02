// import express from "express";
// import * as THREE from "three";
// import * as OBC from "openbim-components";
// import fs from "fs";
// import path from "path";

// const router = express.Router();

// // define the home page route
// router.get("/main", (req, res) => {
//   const components = new OBC.Components();
//   const streamer = new OBC.FragmentIfcStreamConverter(components);
//   streamer.settings.wasm = {
//     path: "/",
//     // path: "https://unpkg.com/web-ifc@0.0.53/",
//     absolute: false,
//   };

//   let files = [];

//   const streamingComplete = new Promise((resolve) =>
//     streamer.onProgress.add(async (progress) => {
//       if (progress !== 1) return;
//       console.log("donee");
//       resolve();
//     })
//   );

//   const getGeometries = new Promise(async (resolve) => {
//     let geometriesData = {};
//     let geometryFilesCount = 1;
//     let eventExecution = [];
//     streamer.onGeometryStreamed.add((geometry) => {
//       const { buffer, data } = geometry;
//       const bufferFileName = `house.ifc-processed-geometries-${geometryFilesCount}`;
//       eventExecution.push(
//         new Promise((resolve) => {
//           for (const expressID in data) {
//             // index assignment would be faster than spread operator
//             const value = data[expressID];
//             value.geometryFile = bufferFileName;
//             geometriesData[expressID] = value;
//           }
//           files.push({ name: bufferFileName, bits: [buffer] });
//           resolve();
//         })
//       );
//       geometryFilesCount++;
//       streamingComplete.then((x) => console.log(x));
//     });
//     await streamingComplete;
//     await Promise.all(eventExecution);
//     console.log("ex ex ex");
//     resolve(geometriesData);
//   });

//   const getAssets = new Promise(async (resolve) => {
//     let assetsData = [];
//     let eventExecution = [];
//     streamer.onAssetStreamed.add((assets) => {
//       console.log("adding new");
//       eventExecution.push(
//         new Promise((resolve) => {
//           assetsData = [...assetsData, ...assets];
//           resolve();
//         })
//       );
//     });
//     await streamingComplete;
//     console.log("done");
//     console.log(Promise.all(eventExecution));
//     await Promise.all(eventExecution);
//     console.log("executed");
//     resolve(assetsData);
//   });

//   const getFragmentGroup = new Promise((resolve) => {
//     streamer.onIfcLoaded.add((groupBuffer) => {
//       files.push({
//         name: "house.ifc-processed-global",
//         bits: [groupBuffer],
//       });
//       resolve();
//     });
//   });

//   streamer.settings.minAssetsSize = 100;

//   Promise.all([getGeometries, getAssets, getFragmentGroup]).then(
//     async ([geometriesData, assetsData]) => {
//       const processedData = {
//         geometries: geometriesData,
//         assets: assetsData,
//         globalDataFileId: "house.ifc-processed-global",
//       };
//       files.push({
//         name: "house.ifc-processed.json",
//         bits: [JSON.stringify(processedData)],
//       });
//       await downloadFilesSequentially(files);
//       files = [];
//     }
//   );

//   const fetchedIfc = Bun.file(path.join(__dirname, "../ifc/house.ifc"));

//   fetchedIfc
//     .arrayBuffer()
//     .then((ifcBuffer) => streamer.streamFromBuffer(new Uint8Array(ifcBuffer)));

//   res.send("Hello");
// });

// function downloadFile(name, ...bits) {
//   const path = Bun.file(`./${name}`);
//   Bun.write(path, ...bits);
// }

// async function downloadFilesSequentially(fileList) {
//   fileList.map((props) => downloadFile(props.name, ...props.bits));
// }
// //exporting the router to other modules
// export default router;
