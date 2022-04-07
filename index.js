if (!("showSaveFilePicker" in self)) {
  alert("Unsupported browser");
  throw new Error("unsupported browser");
}

const openTargetFileWriter = async () => {
  const handle = await window.showSaveFilePicker({
    suggestedName: "test-output.csv",
  });
  const filestream = await handle.createWritable();
  const writer = await filestream.getWriter();
  return writer;
};

const wrapUp = async (writer) => {
  writer.close();
};

let writeButtonEl = document.getElementById("writeButton");
let linesCountOutputEl = document.getElementById("linesCountOutput");

const writeHeader = async (writer) => {
  let line = ["Id", "Name", "Age"].join(",") + "\n";
  await writer.write(line);
};

const writeNRandomRowS = async (writer, blockIndex, linesPerBlock) => {
  let lines = [];
  for (let i = 0; i < linesPerBlock; i++) {
    let line = [
      String(blockIndex * linesPerBlock + i),
      "John Doe",
      String(3),
    ].join(",");
    lines.push(line);
  }
  let block = lines.join("\n");
  await writer.write(block);
};

const sleep = (duration) => {
  return new Promise((accept) => {
    setTimeout(() => {
      accept();
    }, duration);
  });
};

const formatter = new Intl.NumberFormat("en-US");
const gentrify = (number) => {
  return formatter.format(number);
};

const logCount = (blockIndex, linesPerBlock, totalBlockCount) => {
  linesCountOutputEl.innerHTML = `${gentrify(
    (blockIndex + 1) * linesPerBlock
  )} out of ${gentrify(totalBlockCount * linesPerBlock)}`;
};

writeButtonEl.addEventListener("click", async () => {
  let writer = await openTargetFileWriter();

  await writeHeader(writer);

  const totalBlockCount = 200_000;
  const linesPerBlock = 1_000;

  let blockIndex = 0;
  for (blockIndex = 0; blockIndex < totalBlockCount; blockIndex++) {
    await writeNRandomRowS(writer, blockIndex, linesPerBlock);

    if (blockIndex % 10 == 0) {
      logCount(blockIndex, linesPerBlock, totalBlockCount);
    }

    if (blockIndex % 100 == 0) {
      await sleep(1);
    }
  }
  logCount(blockIndex - 1, linesPerBlock, totalBlockCount);

  await wrapUp(writer);
  console.log("Ended");
});
