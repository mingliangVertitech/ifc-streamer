import express from "express";
import * as OBC from "openbim-components";
import path from "path";

const router = express.Router();

// define the home page route
router.get("/stream/", (req, res) => {
  const components = new OBC.Components();
  const streamer = new OBC.FragmentIfcStreamConverter(components);
  streamer.settings.wasm = {
    path: "/",
    // path: "https://unpkg.com/web-ifc@0.0.53/",
    absolute: false,
  };

  const fileName = "large_model.ifc";
  const dist = fileName;

  let geometryFiles = [];
  let geometriesData = {};
  let geometryFilesCount = 1;

  streamer.onGeometryStreamed.add((geometry) => {
    const { buffer, data } = geometry;
    const bufferFileName = `${fileName}-processed-geometries-${geometryFilesCount}`;
    for (const expressID in data) {
      // index assignment would be faster than spread operator
      const value = data[expressID];
      value.geometryFile = bufferFileName;
      geometriesData[expressID] = value;
    }
    geometryFiles.push({ name: bufferFileName, bits: [buffer] });
    geometryFilesCount++;
  });

  let assetsData = [];

  streamer.onAssetStreamed.add((assets) => {
    assetsData = [...assetsData, ...assets];
  });
  streamer.settings.minAssetsSize = 1000;

  streamer.onIfcLoaded.add((groupBuffer) => {
    geometryFiles.push({
      name: `${fileName}-processed-global`,
      bits: [groupBuffer],
    });
  });

  streamer.onProgress.add((progress) => {
    console.log(progress);
    if (progress !== 1) return;

    setTimeout(async () => {
      const processedData = {
        geometries: geometriesData,
        assets: assetsData,
        globalDataFileId: `${fileName}-processed-global`,
      };
      geometryFiles.push({
        name: `${fileName}-processed.json`,
        bits: [JSON.stringify(processedData)],
      });
      await downloadFilesSequentially(geometryFiles);
      assetsData = [];
      geometriesData = {};
      geometryFiles = [];
      geometryFilesCount = 1;
    });
  });

  const jsonFile = {
    types: {},
    ids: {},
    indexesFile: `${fileName}-processed-properties-indexes`,
  };

  const propsStreamer = new OBC.FragmentPropsStreamConverter(components);

  propsStreamer.settings.wasm = {
    path: "/",
    absolute: false,
  };

  let counter = 0;

  const propsFiles = [];

  propsStreamer.onPropertiesStreamed.add(async (props) => {
    if (!jsonFile.types[props.type]) {
      jsonFile.types[props.type] = [];
    }
    jsonFile.types[props.type].push(counter);

    for (const id in props.data) {
      jsonFile.ids[id] = counter;
    }

    const name = `${fileName}-processed-properties-${counter}`;
    const bits = new Blob([JSON.stringify(props.data)]);
    propsFiles.push({ bits, name });

    counter++;
  });

  propsStreamer.onProgress.add(async (progress) => {
    // console.log(progress);
  });

  propsStreamer.onIndicesStreamed.add(async (props) => {
    propsFiles.push({
      name: `${fileName}-processed-properties.json`,
      bits: new Blob([JSON.stringify(jsonFile)]),
    });

    // OBC.IfcPropertiesiN

    // const relations = components.tools.get(OBC.IfcPropertiesUtils);
    // const serializedRels = relations.serializeRelations(props);

    // propsFiles.push({
    //   name: `${fileName}-processed-properties-indexes`,
    //   bits: new Blob([serializedRels]),
    // });

    // await downloadFilesSequentially(propsFiles);
  });

  const fetchedIfc = Bun.file(path.join(__dirname, `../ifc/${fileName}`));

  fetchedIfc.arrayBuffer().then((ifcBuffer) => {
    streamer.streamFromBuffer(new Uint8Array(ifcBuffer));
    // propsStreamer.streamFromBuffer(new Uint8Array(ifcBuffer));
  });

  res.send("Hello");
});

function downloadFile(name, ...bits) {
  const path = Bun.file(`./data/${name}`);
  Bun.write(path, ...bits);
}

async function downloadFilesSequentially(fileList) {
  fileList.map((props) => downloadFile(props.name, ...props.bits));
}
//exporting the router to other modules
export default router;
