import ExpressionNode from './ExpressionNode';
import {ConditionNode} from './ConditionNode';

export class LoopBlock extends ExpressionNode{
  conditionNode: ConditionNode;
  expressions: ExpressionNode[] = [];
  constructor(condNode: ConditionNode) {
    super();
    this.conditionNode = condNode;
  }
  add(node: ExpressionNode){
    this.expressions.push(node);
  }
}
