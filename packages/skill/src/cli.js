#!/usr/bin/env node
import { cp, mkdir, rm, access } from 'node:fs/promises';
import { constants } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { homedir } from 'node:os';
import { fileURLToPath } from 'node:url';
const root=resolve(dirname(fileURLToPath(import.meta.url)),'..'); const source=join(root,'skill','karwan'); const home=process.env.HOME||process.env.USERPROFILE||homedir(); const targets=[join(home,'.codex','skills','karwan'),join(home,'.claude','skills','karwan')];
const exists=async p=>{try{await access(p,constants.F_OK);return true}catch{return false}};
async function install(){for(const t of targets){await mkdir(dirname(t),{recursive:true});await cp(source,t,{recursive:true,force:true});console.log(`installed ${t}`)}}
async function uninstall(){for(const t of targets){if(await exists(t)){await rm(t,{recursive:true,force:true});console.log(`removed ${t}`)}else console.log(`not installed ${t}`)}}
async function doctor(){let ok=true;for(const t of targets){const p=join(t,'SKILL.md');const yes=await exists(p);console.log(`${yes?'ok':'missing'} ${p}`);ok&&=yes}if(!ok)process.exitCode=1}
const c=process.argv[2]||'doctor'; if(c==='install'||c==='update')install().catch(e=>{console.error(e.message);process.exitCode=1}); else if(c==='uninstall')uninstall().catch(e=>{console.error(e.message);process.exitCode=1}); else if(c==='doctor')doctor(); else {console.error('Usage: karwan-skill <install|update|doctor|uninstall>');process.exitCode=1}