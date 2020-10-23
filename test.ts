import Lexer from "./src/lexer/lexer.ts";
import Parser from "./src/parser/parser.ts";
import { PrettyReporter } from "./src/parser/reporter.ts";

const source = `1 + 2 - 3 * 5`;

const lexer = new Lexer(source);

// printTokens(lexer)

const parser = new Parser(lexer, new PrettyReporter());
const [hadError, module] = parser.parseModule();
console.log(hadError ? "Some errors occured while parsing." : module);
