#!/usr/bin/env node
"use strict";var h=require("fs");function l(r){if(r instanceof RegExp)return r;let e=`^${r.replace(/\./g,"\\.").replace(/\*\*/g,".*[.*/]*").replace(/(?<![\.\]\*]{1})\*/g,"[^/]+")}$`;return RegExp(e)}function p(r,e){return u(r,e)}function u(r,e={}){let n=(0,h.readdirSync)(r,{withFileTypes:!0}).filter(t=>{let o=!0;return e.pattern&&t.isFile()&&(o=o&&e.pattern.reduce((c,s)=>c||!!t.name.match(l(s))?.length,!1)),e.excludePatterns?.length&&(o=o&&e.excludePatterns.reduce((c,s)=>c&&!`${t.parentPath.replace("./","")}/`.match(l(s))?.length,!0)),o});if(n.length===0)return null;let i={path:r,files:[],children:[]};return n.forEach(t=>{if(t.isFile()&&i.files.push(t.name),t.isDirectory()){let o=u(`${t.parentPath}/${t.name}`,e);if(!o)return;i.children.push(o)}}),!i.children.length&&!i.files.length?null:i}var a=require("node:fs");var f=require("fs"),x=/^\<#(.+)\>$/;function g(r,e={}){r.files.forEach(n=>{let i=`${r.path}/${n}`,o=(0,f.readFileSync)(i).toString().split(`
`).map(c=>{let s=c.match(x)?.[1].toLowerCase();return s&&(e[s]||(e[s]=[]),e[s].push(i)),c});(0,f.writeFileSync)(i,o.join(`
`))}),r.children.forEach(n=>{g(n,e)})}var d=require("node:path");function y(){let r=process.argv[2],e=p(r,{pattern:["*.doc.md"]});(0,a.writeFileSync)("out.json",JSON.stringify(e));let n={};e&&(g(e,n),E(e,n))}function E(r,e){let n=[];P(r,n),n.push(`
`),T(e,n),(0,a.writeFileSync)("./docs.doc.md",n.join(`
`))}function T(r,e){e.push(`## Categories
`),Object.entries(r).forEach(([n,i])=>{e.push(`
### ${n.replace(/\w/,t=>t.toUpperCase())}
`),i.forEach(t=>e.push(`${$(t)}
`))})}function P(r,e){e.push(`# Index 
`),r.children.forEach(n=>m(n,e,1))}function m(r,e,n){e.push(`${Array.from({length:Math.max(0,n-1)}).fill("	").join("")}* ***${r.path}***`),r.files.forEach(i=>{let t=`${r.path}/${i}`;F(t),e.push(`${Array.from({length:n}).fill("	").join("")}* ${$(t)}`)}),r.children.forEach(i=>m(i,e,n+1))}function F(r){let e=(0,a.readFileSync)(r).toString().split(`
`),n=`[<-Home](${(0,d.relative)(r.slice(0,r.lastIndexOf("/")),"./docs.doc.md")})</br>`;console.log(n),e[0].startsWith("[<-Home]")&&e.shift(),e.unshift(n),(0,a.writeFileSync)(r,e.join(`
`))}function $(r){return`[${r.slice(r.lastIndexOf("/")+1)}](${r})`}y();
