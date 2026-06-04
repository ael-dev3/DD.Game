import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const artifactsDir = path.join(root, "artifacts", "contracts");
const contracts = [
  ["DegenDogUndergroundClub.sol", "DegenDogUndergroundClub"],
  ["MockSpenderToken.sol", "MockSpenderToken"],
  ["MockRewardToken.sol", "MockRewardToken"]
] as const;

function loadArtifact(contractFile: string, contractName: string) {
  const artifactPath = path.join(artifactsDir, contractFile, `${contractName}.json`);
  if (!fs.existsSync(artifactPath)) {
    throw new Error(`Missing artifact: ${artifactPath}. Run npm run compile first.`);
  }
  return JSON.parse(fs.readFileSync(artifactPath, "utf8"));
}

function writeJson(outDir: string, contractName: string, abi: unknown) {
  fs.mkdirSync(outDir, { recursive: true });
  fs.writeFileSync(path.join(outDir, `${contractName}.json`), JSON.stringify(abi, null, 2));
}

const rootAbiDir = path.join(root, "src", "chain", "abi");
const webAbiDir = path.join(root, "web", "src", "chain", "abi");
const outputLines: string[] = [`import type { Abi } from "viem";`];

for (const [contractFile, contractName] of contracts) {
  const artifact = loadArtifact(contractFile, contractName);
  writeJson(rootAbiDir, contractName, artifact.abi);
  writeJson(webAbiDir, contractName, artifact.abi);
  outputLines.push(`import ${contractName} from "./${contractName}.json";`, `export const ${contractName}Abi = ${contractName} as Abi;`);
}

fs.writeFileSync(path.join(rootAbiDir, "index.ts"), `${outputLines.join("\n")}\n`);
fs.writeFileSync(path.join(webAbiDir, "index.ts"), `${outputLines.join("\n")}\n`);
console.log("exported ABI JSON to src/chain/abi and web/src/chain/abi");
