#!/usr/bin/env node

import { find, PathTree } from "./find";
import { readFileSync, writeFileSync } from "node:fs";
import { linkDocs } from "./linkDocs";
import { relative, resolve } from "node:path";
import { cwd } from "node:process";

function generateDocs() {
  const rootPath = process.argv[2];
  const tree = find(rootPath, { pattern: ["*.doc.md"] });
  writeFileSync("out.json", JSON.stringify(tree));
  const index = {};
  if (!tree) return;
  linkDocs(tree, index);
  generateIndexFile(tree, index);
}

function generateIndexFile(tree: PathTree, index: Record<string, string[]>) {
  const indexOutput: string[] = [];

  generateTree(tree, indexOutput);
  indexOutput.push("\n");
  generateCategories(index, indexOutput);
  writeFileSync("./docs.doc.md", indexOutput.join("\n"));
}

function generateCategories(
  index: Record<string, string[]>,
  indexOutput: string[],
) {
  indexOutput.push("## Categories\n");
  Object.entries(index).forEach(([category, files]) => {
    indexOutput.push(
      `\n### ${category.replace(/\w/, (match) => match.toUpperCase())}\n`,
    );
    files.forEach((file) => indexOutput.push(`${fileLink(file)}  `));
  });
}

function generateTree(tree: PathTree, indexOutput: string[]) {
  indexOutput.push("# Index \n");
  tree.children.forEach((child) => generateBranch(child, indexOutput, 1));
}

function generateBranch(tree: PathTree, indexOutput: string[], depth: number) {
  indexOutput.push(
    `${Array.from({ length: Math.max(0, depth - 1) })
      .fill("\t")
      .join("")}* ***${tree.path}***`,
  );
  tree.files.forEach((file) => {
    const filePath = `${tree.path}/${file}`;
    addNaviagation(filePath);
    indexOutput.push(
      `${Array.from({ length: depth }).fill("\t").join("")}* ${fileLink(filePath)}`,
    );
  });
  tree.children.forEach((child) =>
    generateBranch(child, indexOutput, depth + 1),
  );
}

function addNaviagation(filePath: string) {
  const file = readFileSync(filePath).toString().split("\n");
  const navigation = `[<-Home](${relative(filePath.slice(0, filePath.lastIndexOf("/")), `./docs.doc.md`)})</br>`;
  if (file[0].startsWith("[<-Home]")) {
    file.shift();
  }
  file.unshift(navigation);
  writeFileSync(filePath, file.join("\n"));
}

function fileLink(filePath: string) {
  return `[${filePath.slice(filePath.lastIndexOf("/") + 1)}](${filePath})`;
}

generateDocs();
