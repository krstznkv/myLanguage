import ExpressionNode from './ExpressionNode';
import Token from '../Token';

export class ConditionNode extends ExpressionNode{
    operator: Token;
    leftNode: ExpressionNode;
    rightNode: ExpressionNode;
    constructor( operator: Token, leftNode: ExpressionNode, righNode: ExpressionNode) {
      super();
      this.rightNode = righNode;
      this.leftNode = leftNode;
      this.operator = operator;
    }
}
