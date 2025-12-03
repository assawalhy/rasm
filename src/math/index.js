import Angles from './Angles.js';
import * as Nodes from "./nodes";
import * as Core from './Core.js';
import * as Lines from './Lines.js';
import Node from './Node.js';
import Parser from './Parser.js';
import Vector from './Vector.js';
import { CustomParsers } from "~/magical-parser";

const magicalMathParser = new CustomParsers.Math();
const parser = new Parser(magicalMathParser);

export { Nodes, Core, Angles, Lines, magicalMathParser, parser, Parser, Vector, Node };
