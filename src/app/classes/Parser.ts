import Token from './Token';
import TokenType, {tokenTypesList} from './TokenType';
import ExpressionNode from './AST/ExpressionNode';
import NumberNode from './AST/NumberNode';
import VariableNode from './AST/VariableNode';
import UnarOperationNode from './AST/UnarOperationNode';
import BinOperationNode from './AST/BinOperationNode';
import StatementsNode from './AST/StatementsNode';
import {ConditionNode} from './AST/ConditionNode';
import {ConditionBlock} from './AST/condition-block';
import {LoopBlock} from './AST/loop-block';

export default class Parser {
    tokens: Token[];
    pos = 0;
    scope: any = {};
    result = '';
    flag;
    flagLoop;
    constructor(tokens: Token[]) {
        this.tokens = tokens;
    }

    match(...expected: TokenType[]): Token | null {
        if (this.pos < this.tokens.length) {
            const currentToken = this.tokens[this.pos];
            if (expected.find(type => type.name === currentToken.type.name)) {
                this.pos += 1;
                return currentToken;
            }
        }
        return null;
    }

    require(...expected: TokenType[]): Token {
        const token = this.match(...expected);
        if (!token) {
            throw new Error(`на позиции ${this.pos} ожидается ${expected[0].name}`);
        }
        return token;
    }

    parseVariableOrNumber(): ExpressionNode {
        const number1 = this.match(tokenTypesList.NUMBER);
        if (number1 != null) {
            return new NumberNode(number1);
        }
        const variable = this.match(tokenTypesList.VARIABLE);
        if (variable != null) {
            return new VariableNode(variable);
        }
        throw new Error(`Ожидается переменная или число на ${this.pos} позиции`);
    }
    parseVariable(): ExpressionNode{
      const variable = this.match(tokenTypesList.VARIABLE);
      if (variable != null) {
        return new VariableNode(variable);
      }
      throw new Error(`Ожидается переменная  на ${this.pos} позиции`);
    }
    parseCondition(): ConditionNode {
       const leftNode = this.parseVariableOrNumber();
       const operator = this.match(tokenTypesList.EQUALS, tokenTypesList.LESS, tokenTypesList.MORE,
         tokenTypesList.LESS_EQ, tokenTypesList.MORE_EQ);
       const rightNode = this.parseVariableOrNumber();
       if (leftNode != null && rightNode != null && operator != null){
         const node = new ConditionNode(operator, leftNode, rightNode);
         return node;
       }
       throw new Error('Ошибка в блоке условия на позиции' + this.pos);
    }
    parsePrint(): ExpressionNode {
        const operatorLog = this.match(tokenTypesList.LOG);
        if (operatorLog != null) {
            const node = new UnarOperationNode(operatorLog, this.parseFormula());
            return node;
        }
        throw new Error(`Ожидается унарный оператор на ${this.pos} позиции`);
    }
    parseInput(): ExpressionNode {
      const operatorLog = this.match(tokenTypesList.INPUT);
      if (operatorLog != null){
        const node = new UnarOperationNode(operatorLog, this.parseVariable());
        return node;
      }
      throw new Error(`Ожидается унарный оператор на ${this.pos} позиции`);
    }

    parseParentheses(): ExpressionNode {
        if (this.match(tokenTypesList.LPAR) != null) {
            const node = this.parseFormula();
            this.require(tokenTypesList.RPAR);
            return node;
        } else {
            return this.parseVariableOrNumber();
        }
    }

    parseFormula(): ExpressionNode {
        let leftNode = this.parseParentheses();
        let operator = this.match(tokenTypesList.MINUS, tokenTypesList.PLUS, tokenTypesList.MULTIPLY, tokenTypesList.DIVIDE);
        while (operator != null) {
            const rightNode = this.parseParentheses();
            leftNode = new BinOperationNode(operator, leftNode, rightNode);
            operator = this.match(tokenTypesList.MINUS, tokenTypesList.PLUS, tokenTypesList.MULTIPLY, tokenTypesList.DIVIDE);
        }
        return leftNode;
    }
    parseConditionBlock(): ConditionBlock {
      this.pos += 1;
      const conditionNode = this.parseCondition();
      const conditionBlock = new ConditionBlock(conditionNode);
      this.require(tokenTypesList.FLPAR);
      while (this.match(tokenTypesList.FRPAR) === null){
        conditionBlock.add(this.parseExpression());
        this.require(tokenTypesList.SEMICOLON);
      }
      if (this.match(tokenTypesList.ELSE) != null){
        this.require(tokenTypesList.FLPAR);
        while (this.match(tokenTypesList.FRPAR) === null){
          conditionBlock.addElse(this.parseExpression());
          this.require(tokenTypesList.SEMICOLON);
        }
      }
      return conditionBlock;
    }
    parseExpression(): ExpressionNode {
      if (this.match(tokenTypesList.LOG) != null){
        console.log('0' + this.pos);
        this.pos -= 1;
        const printNode = this.parsePrint();
        return printNode;
      }

      if (this.match(tokenTypesList.INPUT) != null) {
        console.log('1');
        this.pos -= 1;
        const inputNode = this.parseInput();
        return inputNode;
      }
      if (this.match(tokenTypesList.IF) != null){
        console.log('if');
        this.pos -= 1;
        const conditionBlock = this.parseConditionBlock();
        return conditionBlock;
      }
      if (this.match(tokenTypesList.WHILE) != null){
        console.log('while');
        const conditionNode = this.parseCondition();
        const loopBlock = new LoopBlock(conditionNode);
        this.require(tokenTypesList.FLPAR);
        while (this.match(tokenTypesList.FRPAR) === null){
          loopBlock.add(this.parseExpression());
          this.require(tokenTypesList.SEMICOLON);
        }
        return loopBlock;
      }
      console.log('3');
      const variableNode = this.parseVariableOrNumber();
      const assignOperator = this.match(tokenTypesList.ASSIGN);
      if (assignOperator != null) {
            const rightFormulaNode = this.parseFormula();
            const binaryNode = new BinOperationNode(assignOperator, variableNode, rightFormulaNode);
            return binaryNode;
        }
      throw new Error('После переменной ожидается оператор присвоения на позиции ${this.pos}');
    }

    parseCode(): ExpressionNode {
        const root = new StatementsNode();
        while (this.pos < this.tokens.length) {
            const codeStringNode = this.parseExpression();
            this.require(tokenTypesList.SEMICOLON);
            root.addNode(codeStringNode);
        }
        return root;
    }

    run(node: ExpressionNode): any {
        if (node instanceof NumberNode) {
            return parseFloat(node.number.text);
        }
        if (node instanceof UnarOperationNode) {
            switch (node.operator.type.name) {
              case tokenTypesList.LOG.name:
                    this.result = this.result + '\n' + this.run(node.operand);
                    return;
              case tokenTypesList.INPUT.name:
                const i = prompt('Input number');
                const variableNode = node.operand as VariableNode;
                this.scope[variableNode.variable.text] = parseFloat(i);
                console.log('INPUT' + i);
                return ;
            }
        }
        if (node instanceof BinOperationNode) {
            switch (node.operator.type.name) {
                case tokenTypesList.PLUS.name:
                    return this.run(node.leftNode) + this.run(node.rightNode);
                case tokenTypesList.MINUS.name:
                    return this.run(node.leftNode) - this.run(node.rightNode);
                case tokenTypesList.MULTIPLY.name:
                    return this.run(node.leftNode) * this.run(node.rightNode);
              case tokenTypesList.DIVIDE.name:
                return this.run(node.leftNode) / this.run(node.rightNode);
                case tokenTypesList.ASSIGN.name:
                    const result = this.run(node.rightNode);
                    const variableNode = node.leftNode as VariableNode;
                    this.scope[variableNode.variable.text] = result;
                    return result;
            }
        }
        if (node instanceof VariableNode) {
            if (this.scope[node.variable.text]) {
                return this.scope[node.variable.text];
            } else {
                throw new Error(`Переменная с названием ${node.variable.text} не обнаружена`);
            }
        }
        if (node instanceof ConditionBlock) {
         const leftNode = node.conditionNode.leftNode;
         const rightNode = node.conditionNode.rightNode;
         const operator = node.conditionNode.operator;
         switch (operator.type.name){
           case tokenTypesList.MORE.name:
             this.flag = this.run(leftNode) > this.run(rightNode);
             break;
           case tokenTypesList.LESS.name:
             this.flag = this.run(leftNode) < this.run(rightNode);
             break;
           case tokenTypesList.EQUALS.name:
             this.flag = this.run(leftNode) === this.run(rightNode);
             break;
           case tokenTypesList.MORE_EQ.name:
             this.flag = this.run(leftNode) >= this.run(rightNode);
             break;
           case tokenTypesList.LESS_EQ.name:
             this.flag = this.run(leftNode) <= this.run(rightNode);
             break;
         }
         if (this.flag){
           console.log(node.expressions.length);
           for (const expression of node.expressions){
              this.run(expression);
           }
           return;
         } else {
           for (const expression of node.expressionsELSE){
             this.run(expression);
           }
           return;
         }
      }
        if (node instanceof LoopBlock){
          const leftNode = node.conditionNode.leftNode;
          const rightNode = node.conditionNode.rightNode;
          const operator = node.conditionNode.operator;
          switch (operator.type.name){
            case tokenTypesList.MORE.name:
              this.flagLoop = this.run(leftNode) > this.run(rightNode);
              while (this.flagLoop){
                for (const exp of node.expressions){
                  this.run(exp);
                }
                this.flagLoop = this.run(leftNode) > this.run(rightNode);
              }
              return;
              break;
            case tokenTypesList.LESS.name:
              this.flagLoop = this.run(leftNode) < this.run(rightNode);
              while (this.flagLoop){
                for (const exp of node.expressions){
                  this.run(exp);
                }
                this.flagLoop = this.run(leftNode) < this.run(rightNode);
              }
              return;
              break;
            case tokenTypesList.EQUALS.name:
              this.flagLoop = this.run(leftNode) === this.run(rightNode);
              while (this.flagLoop){
                for (const exp of node.expressions){
                  this.run(exp);
                }
                this.flagLoop = this.run(leftNode) === this.run(rightNode);
              }
              return;
              break;
            case tokenTypesList.MORE_EQ.name:
              this.flagLoop = this.run(leftNode) >= this.run(rightNode);
              while (this.flagLoop){
                for (const exp of node.expressions){
                  this.run(exp);
                }
                this.flagLoop = this.run(leftNode) >= this.run(rightNode);
              }
              break;
            case tokenTypesList.LESS_EQ.name:
              this.flagLoop = this.run(leftNode) <= this.run(rightNode);
              while (this.flagLoop){
                for (const exp of node.expressions){
                  this.run(exp);
                }
                this.flagLoop = this.run(leftNode) <= this.run(rightNode);
              }
              return;
              break;
          }
        }
        if (node instanceof StatementsNode) {
            node.codeStrings.forEach(codeString => {
                this.run(codeString);
            });
            return;
        }
        throw new Error('Ошибка!');
    }
}
