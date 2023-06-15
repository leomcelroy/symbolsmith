import { dispatch } from "../dispatch.js";
import { flattenSVG } from 'flatten-svg';

let count = 0;

function readFileUploadComp(file) {
  var reader = new FileReader();
  reader.readAsText(file);

  reader.onloadend = event => {
    let text = reader.result;
    dispatch("UPLOAD_COMP", { text, name: `component${count}` });
    count++;
  };
}

function readFileJS(file) {
  var reader = new FileReader();
  reader.readAsText(file);

  reader.onloadend = event => {
    let text = reader.result;
    dispatch("UPLOAD_JS", { text });
  };
}

function upload(files, state) {
  let file = files[0];
  let fileName = file.name.split(".");
  let name = fileName[0];

  const extension = fileName.at(-1);

  // TODO: if js then drop and run
  // TODO: if kicad mod readFile as is
  if (extension === "kicad_mod") {
    readFileUploadComp(file);
  } else if (extension === "js") {
    readFileJS(file);
  } else if (extension === "svg") {
    readFileSVG(file, { name, cm: state.codemirror });
  } else {
    throw Error("Unknown extension:", extension);
  }

};

const round = n => Math.round(n*1000)/1000;

function makePathData(pl) {
  let str = "";

  pl.points.forEach((pt, i) => {
    if (i === 0) str += `M${round(pt[0])},${-round(pt[1])}`;
    else str += `L${round(pt[0])},${-round(pt[1])}`;
  })

  return str;
}

async function readFileSVG(file, { name, cm }) {
  var reader = new FileReader();
  reader.readAsText(file);

  console.log(file);

  reader.onloadend = event => {
    let text = reader.result;

    const parser = new DOMParser();
    const doc = parser.parseFromString(text, "image/svg+xml");
    const svg = doc.querySelector("svg");

    const pls = flattenSVG(svg, { maxError: 0.001 })
      .map(x => x.points
        .map(pt => pt
          .map(n => Math.round(n*1000)/1000)
        )
      );

    const newLine = `const ${name.replaceAll(/\s/g, "_").replaceAll(/\(|\)/g, "")} = ${JSON.stringify(pls)};\n`;

    cm.view.dispatch({
      changes: { from: 0, insert: newLine }
    });
    
  };

}

export function addDropUpload(state, bodyListener) {
  bodyListener("drop", "", function(evt) {    
    let dt = evt.dataTransfer;
    let files = dt.files;

    document.querySelector(".drop-modal").classList.add("hidden");   

    upload(files, state);

    pauseEvent(evt);
  });

  bodyListener("dragover", "", function(evt) {
    document.querySelector(".drop-modal").classList.remove("hidden");   
    pauseEvent(evt);
  });

  bodyListener("mouseleave", "", function(evt) {
    document.querySelector(".drop-modal").classList.add("hidden");   
  });
}