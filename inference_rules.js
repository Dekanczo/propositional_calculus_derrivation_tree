
class InferenceRules {
  static rulesMap = Object.freeze({
    '1': InferenceRules.argsToAndRule,
    '2': InferenceRules.andToLeftArgRule,
    '3': InferenceRules.andToRightArgRule,
    '4': InferenceRules.leftArgToOrRule,
    '5': InferenceRules.rightArgToOrRule,
    '6': InferenceRules.argFromDoubleImplByOrRule,
    '7': InferenceRules.deductionRule,
    '8': InferenceRules.reverseDeductionRule,
    '9': InferenceRules.argToFormulasSeqWithNegOp,
    '10': InferenceRules.confuseArgToTwoParadoxArgs,
    '11': InferenceRules.interchangeTwoFormulaInFormulaSeq,
    '12': InferenceRules.removeLastFormulaInFormulaSeq,
    '13': InferenceRules.doubleNegationInsertingRule,
    '14': InferenceRules.doubleNegationRemovingRule,
  });
    
  static rulesNameToNumber = Object.freeze(
    Object.entries(InferenceRules.rulesMap).reduce((o, e) => {
    o[e[1].name] = e[0];
    return o;
    }, {})
  );    
    
  static argsToAndRule(parentVertex, tokenIdx) {
    const expr = parentVertex.formula;
    const rightExpr1 = expr.slice(0, tokenIdx);
    const forProvingIdx = crypto.randomUUID();
    parentVertex.forProving[1][forProvingIdx] = [];

    
    const ruleName1 = InferenceRules.rulesNameToNumber[InferenceRules.argsToAndRule.name];
    let childVertex1 = parentVertex.addVertex('', rightExpr1.strExpr, 'Правило ' + ruleName1);
    childVertex1.mustBeProven = true;
    childVertex1.rule = 1;
    childVertex1.forProvingIdx = forProvingIdx;
    parentVertex.forProving[1][forProvingIdx].push(childVertex1);

    const rightExpr2 = expr.slice(tokenIdx + 1, expr.length);
    const ruleName2 = InferenceRules.rulesNameToNumber[InferenceRules.argsToAndRule.name];
    let childVertex2 = parentVertex.addVertex('', rightExpr2.strExpr, 'Правило ' + ruleName2);
    childVertex2.mustBeProven = true;
    childVertex2.rule = 1;
    childVertex2.forProvingIdx = forProvingIdx;
    parentVertex.forProving[1][forProvingIdx].push(childVertex2);
    
    childVertex1.dependentVertices = [childVertex2];
    childVertex2.dependentVertices = [childVertex1];

    redrawVertex(childVertex1);
  }
  
  static andToLeftArgRule(parentVertex) {
    const forProvingIdx = crypto.randomUUID();
    parentVertex.forProving[2][forProvingIdx] = [];
  

    const expr = parentVertex.formula;
    const rightExpr = expr.slice(0, expr.length);
    const newStrExpr = rightExpr.strExpr + '& ChangeMe';
    const ruleName = InferenceRules.rulesNameToNumber[InferenceRules.andToLeftArgRule.name];
    let childVertex = parentVertex.addVertex('', newStrExpr, 'Правило ' + ruleName);
    childVertex.formula.at(-1).mustBeActivated = true;
    childVertex.mustBeProven = true;
    childVertex.rule = 2;
    childVertex.forProvingIdx = forProvingIdx;
    parentVertex.forProving[2][forProvingIdx].push(childVertex);
    
    childVertex.isProved();

    redrawVertex(childVertex);

    const rulesInfo = InferenceRules.chooseRules(childVertex);
    if (rulesInfo != null)
      activateLowPriorityOpTokens(
        childVertex, 
        rulesInfo.availableOpsIdxs
      );
  }

  static andToRightArgRule(parentVertex) {
    const forProvingIdx = crypto.randomUUID();
    parentVertex.forProving[2][forProvingIdx] = [];
  

    const expr = parentVertex.formula;
    const rightExpr = expr.slice(0, expr.length);
    const newStrExpr = 'ChangeMe & ' + rightExpr.strExpr;
    const ruleName = InferenceRules.rulesNameToNumber[InferenceRules.andToRightArgRule.name];
    let childVertex = parentVertex.addVertex('', newStrExpr, 'Правило ' + ruleName);
    childVertex.formula.at(0).mustBeActivated = true;
    childVertex.mustBeProven = true;
    childVertex.rule = 2;
    childVertex.forProvingIdx = forProvingIdx;
    parentVertex.forProving[2][forProvingIdx].push(childVertex);

    childVertex.isProved();

    redrawVertex(childVertex);
  }

  static leftArgToOrRule(parentVertex, tokenIdx) {
    const expr = parentVertex.formula;
    const leftExpr = expr.slice(0, tokenIdx);
    const forProvingIdx = crypto.randomUUID();
    parentVertex.forProving[3][forProvingIdx] = [];

    const ruleName = InferenceRules.rulesNameToNumber[InferenceRules.leftArgToOrRule.name];
    let childVertex = parentVertex.addVertex('', leftExpr.strExpr, 'Правило ' + ruleName);
    childVertex.mustBeProven = false;
    parentVertex.forProving[3][forProvingIdx].push(childVertex);
    childVertex.rule = 3;
    childVertex.forProvingIdx = forProvingIdx;
    
    redrawVertex(childVertex);
  }

  static rightArgToOrRule(parentVertex, tokenIdx) {
    const expr = parentVertex.formula;
    const rightExpr = expr.slice(tokenIdx + 1, expr.length);
    const forProvingIdx = crypto.randomUUID();
    parentVertex.forProving[3][forProvingIdx] = [];

    const ruleName = InferenceRules.rulesNameToNumber[InferenceRules.rightArgToOrRule.name];
    let childVertex = parentVertex.addVertex('', rightExpr.strExpr, 'Правило ' + ruleName);
    childVertex.mustBeProven = false;
    parentVertex.forProving[3][forProvingIdx].push(childVertex);
    childVertex.rule = 3;
    childVertex.forProvingIdx = forProvingIdx;
    
    redrawVertex(childVertex);
  }

  static argFromDoubleImplByOrRule(parentVertex) {
    const expr = parentVertex.formula;
    const ruleName = InferenceRules.rulesNameToNumber[InferenceRules.argFromDoubleImplByOrRule.name];

    const leftExpr1 = 'ChangeMe1';
    const rightExpr1 = expr.slice(0, expr.length);
    const forProvingIdx = crypto.randomUUID();
    parentVertex.forProving[2][forProvingIdx] = [];

    let childVertex1 = parentVertex.addVertex(leftExpr1, rightExpr1.strExpr, 'Правило ' + ruleName);
    childVertex1.mustBeProven = true;
    parentVertex.forProving[2][forProvingIdx].push(childVertex1);
    childVertex1.rule = 2;
    childVertex1.forProvingIdx = forProvingIdx;
    childVertex1.isProved();

    const leftExpr2 = 'ChangeMe2';
    const rightExpr2 = expr.slice(0, expr.length);
    let childVertex2 = parentVertex.addVertex(leftExpr2, rightExpr2.strExpr, 'Правило ' + ruleName);
    childVertex2.mustBeProven = true;
    parentVertex.forProving[2][forProvingIdx].push(childVertex2); 
    childVertex2.rule = 2;
    childVertex2.forProvingIdx = forProvingIdx;
    childVertex2.isProved();

    const rightStrExpr3 = 'ChangeMe1 | ChangeMe2';
    let childVertex3 = parentVertex.addVertex('', rightStrExpr3, 'Правило ' + ruleName);
    childVertex3.mustBeProven = true;
    parentVertex.forProving[2][forProvingIdx].push(childVertex3);
    childVertex3.rule = 2;
    childVertex3.forProvingIdx = forProvingIdx;
    childVertex3.isProved();

    childVertex3.formula.tokens[0] = childVertex1.formulasSequence.at(-1).tokens[0];
    childVertex3.formula.tokens[0].mustBeActivated = true;
    childVertex3.formula.tokens[childVertex3.formula.length - 1] = childVertex2.formulasSequence.at(-1).tokens[0];
    childVertex3.formula.tokens[childVertex3.formula.length - 1].mustBeActivated = true;

    childVertex1.dependentVertices = [childVertex2, childVertex3];
    childVertex2.dependentVertices = [childVertex1, childVertex3];
    childVertex3.dependentVertices = [childVertex1, childVertex2];

    redrawVertex(childVertex1);
  }

  static deductionRule(parentVertex, tokenIdx) {
    const expr = parentVertex.formula;
    const leftExpr = expr.slice(0, tokenIdx);
    const rightExpr = expr.slice(tokenIdx + 1, expr.length);
    const forProvingIdx = crypto.randomUUID();
    parentVertex.forProving[2][forProvingIdx] = [];
  

    const ruleName = InferenceRules.rulesNameToNumber[InferenceRules.deductionRule.name];
    let childVertex = parentVertex.addVertex(leftExpr.strExpr, rightExpr.strExpr, 'Правило ' + ruleName);
    childVertex.mustBeProven = true;
    parentVertex.forProving[2][forProvingIdx].push(childVertex);  
    childVertex.rule = 2;
    childVertex.forProvingIdx = forProvingIdx;
    
    redrawVertex(childVertex);
  }

  static reverseDeductionRule(parentVertex) {
    const expr = parentVertex.formula;
    const rightExpr = expr.slice(0, expr.length);
    const forProvingIdx = crypto.randomUUID();
    parentVertex.forProving[2][forProvingIdx] = [];
  
    
    const ruleName1 = InferenceRules.rulesNameToNumber[InferenceRules.reverseDeductionRule.name];
    let childVertex1 = parentVertex.addVertex('', 'ChangeMe', 'Правило ' + ruleName1);
    childVertex1.mustBeProven = true;
    parentVertex.forProving[2][forProvingIdx].push(childVertex1);  
    childVertex1.rule = 2;
    childVertex1.forProvingIdx = forProvingIdx;


    const ruleName2 = InferenceRules.rulesNameToNumber[InferenceRules.reverseDeductionRule.name];
    let childVertex2 = parentVertex.addVertex('', `ChangeMe -> (${rightExpr.strExpr})`, 'Правило ' + ruleName2);
    childVertex2.mustBeProven = true;
    parentVertex.forProving[2][forProvingIdx].push(childVertex2);
    childVertex2.rule = 2;
    childVertex2.forProvingIdx = forProvingIdx;

    
    childVertex2.formula.tokens[0] = childVertex1.formula.tokens[0];
    childVertex2.formula.tokens[0].mustBeActivated = true;

    childVertex1.dependentVertices = [childVertex2];
    childVertex2.dependentVertices = [childVertex1];
    
    redrawVertex(childVertex1);
 }

  static argToFormulasSeqWithNegOp(parentVertex) {
    const forProvingIdx = crypto.randomUUID();
    parentVertex.forProving[2][forProvingIdx] = [];
  

    const leftStrExpr = `!(${parentVertex.formula.strExpr})`;
    const ruleName = InferenceRules.rulesNameToNumber[InferenceRules.argToFormulasSeqWithNegOp.name];
    let childVertex = parentVertex.addVertex(leftStrExpr, '', 'Правило ' + ruleName);
    childVertex.mustBeProven = true;
    parentVertex.forProving[2][forProvingIdx].push(childVertex);
    childVertex.rule = 2;
    childVertex.forProvingIdx = forProvingIdx;

    childVertex.isProved();
    
    redrawVertex(childVertex);
  }

  static confuseArgToTwoParadoxArgs(parentVertex) {
    if (parentVertex.formula.length != 0)
      return;
    const forProvingIdx = crypto.randomUUID();
    parentVertex.forProving[4][forProvingIdx] = [];
  
      
    const rightStrExpr1 = 'ChangeMe';
    const ruleName1 = InferenceRules.rulesNameToNumber[InferenceRules.confuseArgToTwoParadoxArgs.name];
    let childVertex1 = parentVertex.addVertex('', rightStrExpr1, 'Правило ' + ruleName1);
    childVertex1.mustBeProven = true;
    parentVertex.forProving[4][forProvingIdx].push(childVertex1);  
    childVertex1.rule = 4;
    childVertex1.forProvingIdx = forProvingIdx;
    
    const rightStrExpr2 = '!ChangeMe';
    const ruleName2 = InferenceRules.rulesNameToNumber[InferenceRules.confuseArgToTwoParadoxArgs.name];
    let childVertex2 = parentVertex.addVertex('', rightStrExpr2, 'Правило ' + ruleName2);
    childVertex2.mustBeProven = true;
    parentVertex.forProving[4][forProvingIdx].push(childVertex2);
    childVertex2.rule = 4;
    childVertex2.forProvingIdx = forProvingIdx;
    

    childVertex2.formula.tokens[1] = childVertex1.formula.tokens[0];
    childVertex2.formula.tokens[1].mustBeActivated = true;
    
    childVertex1.dependentVertices = [childVertex2];
    childVertex2.dependentVertices = [childVertex1];
    
    redrawVertex(childVertex1);
 }
  
  static interchangeTwoFormulaInFormulaSeq(parentVertex) {
    const forProvingIdx = crypto.randomUUID();
    parentVertex.forProving[2][forProvingIdx] = [];
  

    const expr = parentVertex.formula;
    const rightExpr = expr.slice(0, expr.length);
    const ruleName = InferenceRules.rulesNameToNumber[InferenceRules.interchangeTwoFormulaInFormulaSeq.name];
    let childVertex = parentVertex.addVertex('', rightExpr.strExpr, 'Правило ' + ruleName);
    childVertex.mustBeProven = true;
    parentVertex.forProving[2][forProvingIdx].push(childVertex);
    childVertex.rule = 2;
    childVertex.forProvingIdx = forProvingIdx;
    
    childVertex.isProved();

    const formulasSequence = childVertex.formulasSequence;
    const formulasSequenceElements = childVertex.formulasSequenceElements.children;
    let pair = []
    for (let i = 0; i < formulasSequence.length; i++) {
      formulasSequenceElements[i].style.color = 'orange';
      formulasSequenceElements[i].style.cursor = 'pointer';
      formulasSequenceElements[i].onclick = function interchange(e) {
        if (pair.length == 0) {
          for (let j = 0; j < formulasSequence.length; j++) 
            if (j != i - 1 && j != i + 1) {
              formulasSequenceElements[j].style.color = 'black';
              formulasSequenceElements[j].style.cursor = 'revert';
              
              formulasSequenceElements[j].onclick = null;
            }
          pair.push(i);
        }
        else if (pair.length == 1) {
          const idx1 = pair[0];
          for (let j = Math.max(0, idx1 - 1); j <= Math.min(idx1 + 1, formulasSequence.length - 1); j++) {
            formulasSequenceElements[j].style.color = 'black';
            formulasSequenceElements[j].style.cursor = 'revert';
            formulasSequenceElements[j].onclick = null;
          }
          pair.push(i);

          const idx2 = pair[1];
          const temp = formulasSequence[idx1];
          formulasSequence[idx1] = formulasSequence[idx2];
          formulasSequence[idx2] = temp;
          formulasSequenceElements[idx1].innerHTML = formulasSequence[idx1].strExpr;
          formulasSequenceElements[idx2].innerHTML = formulasSequence[idx2].strExpr;
        }
      }
    }

    const rulesInfo = InferenceRules.chooseRules(childVertex);
    if (rulesInfo != null)
      activateLowPriorityOpTokens(
        childVertex, 
        rulesInfo.availableOpsIdxs
      );
  }

  static removeLastFormulaInFormulaSeq(parentVertex, tokenIdx) {
    const forProvingIdx = crypto.randomUUID();
    parentVertex.forProving[2][forProvingIdx] = [];
  

    const expr = parentVertex.formula;
    const ruleName = InferenceRules.rulesNameToNumber[InferenceRules.removeLastFormulaInFormulaSeq.name];
    let childVertex = parentVertex.addVertex('', expr.strExpr, 'Правило ' + ruleName);
    Array.from(childVertex.formulasSequenceElements.children).at(-1).remove();
    childVertex.formulas.splice(-2, 1);
    childVertex.mustBeProven = true;
    parentVertex.forProving[2][forProvingIdx].push(childVertex);
    childVertex.rule = 2;
    childVertex.forProvingIdx = forProvingIdx;

    childVertex.isProved();

    redrawVertex(childVertex);
  }

  static doubleNegationInsertingRule(parentVertex, tokenIdx) {
    const forProvingIdx = crypto.randomUUID();
    parentVertex.forProving[2][forProvingIdx] = [];
  

    const expr = parentVertex.formula;
    const rightStrExpr = '!!' + expr.strExpr;
    const ruleName = InferenceRules.rulesNameToNumber[InferenceRules.doubleNegationInsertingRule.name];
    let childVertex = parentVertex.addVertex('', rightStrExpr, 'Правило ' + ruleName);
    childVertex.mustBe = true;
    parentVertex.forProving[2][forProvingIdx].push(childVertex);
    childVertex.rule = 2;
    childVertex.forProvingIdx = forProvingIdx;

    redrawVertex(childVertex);
  }
  
  static doubleNegationRemovingRule(parentVertex, tokenIdx) {
    const forProvingIdx = crypto.randomUUID();
    parentVertex.forProving[5][forProvingIdx] = [];
  

    const expr = parentVertex.formula;
    const rightExpr = expr.slice(tokenIdx + 1, expr.length);
    const ruleName = InferenceRules.rulesNameToNumber[InferenceRules.doubleNegationRemovingRule.name];
    let childVertex = parentVertex.addVertex('', rightExpr.strExpr, 'Правило ' + ruleName);
    childVertex.mustBe = true;
    parentVertex.forProving[5][forProvingIdx].push(childVertex);
    childVertex.rule = 5;
    childVertex.forProvingIdx = forProvingIdx;
    
    redrawVertex(childVertex);
  }

  
  static chooseRules(vertex) {
    let lowPriorityOpsInfo = vertex.lowPriorityOpsInfo;
    if (lowPriorityOpsInfo == null)
      return null;
    const 
      opType = lowPriorityOpsInfo.op,
      opsIdxs = lowPriorityOpsInfo.opsIdxs;
    let start, end;
    let rules = [];

    if (opType == Token.types.IMPL) {
      start = opsIdxs.length - 1,
      end = opsIdxs.length - 1;
      rules.push('7');
    } 
    else if (opType == Token.types.NEG) {
      if (opsIdxs.length < 2)
        [start, end] = [-1, -1]; 
      else {
        [start, end] = [0, 1];
        rules.push('14');
      }
    }
    else if (opType == Token.types.AND) {
      start = 0,
      end = opsIdxs.length - 1;
      rules.push('1');
    }
    else if (opType == Token.types.OR) {
      start = 0,
      end = opsIdxs.length - 1;

      rules.push('4');
      rules.push('5');
    }
    
    
    return {
      availableOpsIdxs: opsIdxs.slice(start, end + 1),
      rules: rules
    };
  }
}