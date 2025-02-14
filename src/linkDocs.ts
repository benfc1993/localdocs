import { readFileSync, writeFileSync } from "fs";
import { PathTree } from "./find";

const categoryRegex = /^\<#(.+)\>$/;

export function linkDocs(tree: PathTree, index: Record<string, string[]> = {}) {
  tree.files.forEach((file) => {
    const filePath = `${tree.path}/${file}`;
    const fileStr = readFileSync(filePath).toString().split("\n");
    const out = fileStr.map((line) => {
      const category = line.match(categoryRegex)?.[1].toLowerCase();

      if (!category) return line;

      if (!index[category]) {
        index[category] = [];
      }

      index[category].push(filePath);
      return line;
    });
    writeFileSync(filePath, out.join("\n"));
  });
  tree.children.forEach((child) => {
    linkDocs(child, index);
  });
}
