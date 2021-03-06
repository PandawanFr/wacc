import {
  assert,
  assertEquals,
} from "https://deno.land/std@0.74.0/testing/asserts.ts";

import Lexer from "../src/lexer/lexer.ts";
import Parser from "../src/parser/parser.ts";
import {
  BoolExpression,
  ExpressionStatement,
  InfixExpression,
  Module,
  NumberExpression,
  PrefixExpression,
  PrintStatement,
  StringExpression,
} from "../src/parser/ast.ts";
import { TokenType } from "../src/lexer/token.ts";
import { JsonReporter } from "../src/parser/reporter.ts";

Deno.test("Parser empty", () => {
  const lexer = new Lexer("");
  const parser = new Parser(lexer);
  const [hadErrors, module] = parser.parseModule();
  assertEquals(hadErrors, false);
  assert(module instanceof Module);
  assertEquals(module.statements, []);
});

Deno.test("Parser expression number", () => {
  const lexer = new Lexer("5;");
  const parser = new Parser(lexer);
  const [hadErrors, module] = parser.parseModule();
  assertEquals(hadErrors, false);
  assert(module instanceof Module);
  assertEquals(module.statements, [
    // TODO: Need some way to type-check these at dev-time. Maybe constructor functions that create interface types?
    {
      type: "expression",
      expression: {
        type: "number",
        value: 5,
      },
    },
  ]);
});

Deno.test("Parser expression keyword", () => {
  const lexer = new Lexer("true;");
  const parser = new Parser(lexer);
  const [hadErrors, module] = parser.parseModule();
  assertEquals(hadErrors, false);
  assert(module instanceof Module);
  assertEquals(module.statements, [
    {
      type: "expression",
      expression: {
        type: "bool",
        value: true,
      },
    },
  ]);
});

Deno.test("Parser expression string", () => {
  const lexer = new Lexer('"Hello World";');
  const parser = new Parser(lexer);
  const [hadErrors, module] = parser.parseModule();
  assertEquals(hadErrors, false);
  assert(module instanceof Module);
  assertEquals(module.statements, [
    {
      type: "expression",
      expression: {
        type: "string",
        value: '"Hello World"',
      },
    },
  ]);
});

Deno.test("Parser expression simple infix", () => {
  const lexer = new Lexer("5 + 3;");
  const parser = new Parser(lexer);
  const [hadErrors, module] = parser.parseModule();
  assertEquals(hadErrors, false);
  assert(module instanceof Module);
  assertEquals(module.statements, [
    {
      type: "expression",
      expression: {
        type: "infix",
        left: {
          type: "number",
          value: 5,
        },
        operator: TokenType.plus,
        right: {
          type: "number",
          value: 3,
        },
      },
    },
  ]);
});

Deno.test("Parser expression nested infix", () => {
  const lexer = new Lexer("5 + -3 * 1 - 2;");
  const parser = new Parser(lexer);
  const [hadErrors, module] = parser.parseModule();
  assertEquals(hadErrors, false);
  assert(module instanceof Module);
  assertEquals(module.statements, [
    {
      type: "expression",
      expression: {
        type: "infix",
        left: {
          type: "infix",
          left: {
            type: "number",
            value: 5,
          },
          operator: TokenType.plus,
          right: {
            type: "infix",
            left: {
              type: "prefix",
              operator: TokenType.minus,
              right: {
                type: "number",
                value: 3,
              },
            },
            operator: TokenType.star,
            right: {
              type: "number",
              value: 1,
            },
          },
        },
        operator: TokenType.minus,
        right: {
          type: "number",
          value: 2,
        },
      },
    },
  ]);
});

Deno.test("Parser print statement", () => {
  const lexer = new Lexer("print 1;");
  const parser = new Parser(lexer);
  const [hadErrors, module] = parser.parseModule();
  assertEquals(hadErrors, false);
  assert(module instanceof Module);
  assertEquals(module.statements, [
    {
      type: "print",
      expression: {
        type: "number",
        value: 1,
      },
    },
  ]);
});

Deno.test("Parser invalid", () => {
  const lexer = new Lexer("#;");
  const parser = new Parser(lexer);
  const result = parser.parseModule();
  assert(result[0]); // Had Errors
  assert(result[1] instanceof JsonReporter);
  assert(result[1].getIssues()[0].message === "Unexpected character '#'.");
});
