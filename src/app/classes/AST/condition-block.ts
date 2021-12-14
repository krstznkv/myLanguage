import ExpressionNode from './ExpressionNode';
import {ConditionNode} from './ConditionNode';

export class ConditionBlock extends ExpressionNode{
   conditionNode: ConditionNode;
   expressions: ExpressionNode[] = [];
   expressionsELSE: ExpressionNode[] = [];
   constructor(condNode: ConditionNode) {
     super();
     this.conditionNode = condNode;
   }
   add(node: ExpressionNode){
     this.expressions.push(node);
   }
   addElse(node: ExpressionNode){
     this.expressionsELSE.push(node);
   }
}
