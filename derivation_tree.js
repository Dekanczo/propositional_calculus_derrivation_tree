'use strict'

function module2() {  
  class Vertex {
    static _idCount = 0;
    static _provenStates = {}
    static _levelToVertices = {};

    constructor(left, top, level, leftStrExpr, rightStrExpr, formulasSequence = [], parent = null, inParentIdx = -1, rule) {
      this.id = Vertex._idCount++;
      this.left = left;
      this.top = top;
      this.vertexElement = createVertexElement(this.left, this.top, this.id, this);
      this.formulaElement = 
        this.vertexElement
          .children[0]
          .children[0]
          .children[1]
          .children[2]
          .children[0]
          .children[0];
      this.formulasSequenceElements = 
        this.vertexElement
          .children[0]
          .children[0]
          .children[1]
          .children[0]
          .children[0];
      this.formula = Expr.fromStr(rightStrExpr).minimizeBrackets();
      this.formulasSequence = 
        formulasSequence.concat(
          leftStrExpr
            .split(',')
            .filter(p => p.length != 0)
            .map(p => Expr.fromStr(p).minimizeBrackets())
        ) || [];
      this.formulas = Array.from(this.formulasSequence)
      this.formulas.push(this.formula);
      
      this.formulasElements = this.formulaElement = 
        this.vertexElement
          .children[0]
          .children[0]
          .children[1]
          .children[2]
          .children[0];
      this.parent = parent;
      this.children = [];
      this.level = level;

      this.proved = this.isProved();
      this.mustBeProven = false;
      this.forProving = {
        1: {},
        2: {},
        3: {},
        4: {},
        5: {}
      };

      this.inParentIdx = inParentIdx;
      this.forProvingIdx = null;

      this.lowPriorityOpsInfo = this.formula.getLowPriorityOpsInfo();

      this.dependentVertices = []
      
      if (this.parent)
        this.parentArrowElement = connect(this.parent.vertexElement, this.vertexElement, rule, 'purple', 2);
      else
        this.parentArrowElement = null;
      redrawVertex(this);

      const props = getOffset(this.vertexElement);
      this.width = props.width;
      this.height = props.height;
      this.centerX = this.left + this.width / 2;
      this.centerY = this.top + this.height / 2;
      this.r = Math.sqrt(Math.pow(this.width / 2, 2) + Math.pow(this.height / 2, 2));
      
      
    }

    getDistance(other) {
      return Math.sqrt(Math.pow(this.centerX - other.centerX, 2) + Math.pow(this.centerY - other.centerY, 2))
    }

    getVectorSign(other) {
      return [
        Math.sign(other.centerX - this.centerX),
        Math.sign(other.centerY - this.centerY)
      ]
    }

    getNearestVertex() {
      const maybeNearestVertices = 
        Vertex._sortedByCenterX
          .filter(v => 
            Math.abs(v.centerX - this.centerX) < v.r + this.r &&
            Math.abs(v.centerY - this.centerY) < v.r + this.r && 
            v.id != this.id
          );

      let minDist = Math.pow(10, 5);
      const nearestVertex = maybeNearestVertices
        .reduce((n, v) => {
          const dist = this.getDistance(v);
          if (minDist > dist) {
            minDist = dist;
            return v;
          }

          return n;
        }, null);

      return nearestVertex;
    }
    
    getLevels() {
      return Vertex._levelToVertices;
    }
    addToCollisionInfo() {
      const idx1 = Vertex._sortedByCenterX.findIndex(v => v.centerX > this.centerX);
      if (idx1 != -1)
        Vertex._sortedByCenterX.splice(idx1, 0, this);
      else
        Vertex._sortedByCenterX.push(this);
      
      const idx2 = Vertex._sortedByCenterX.findIndex(v => v.centerY > this.centerY);
      if (idx2 != -1)
        Vertex._sortedByCenterY.splice(idx2, 0, this);
      else
        Vertex._sortedByCenterY.push(this);
      
      
    }

    depthFirstTraverse(callback) {
      const queue = [this];
      
      while (queue.length != 0) {
        const curVertex = queue.shift();

        if (curVertex.children.length != 0)
          curVertex.children.forEach(c => queue.push(c));
        
        callback(curVertex);
      }
    }

    preventCollision() {
      Vertex._levelToVertices[this.level] ||= [];
      const levelVertices = Vertex._levelToVertices[this.level];
      
      const idx = levelVertices.findIndex(
        v => 
          v.left > this.left
          
          
          
      );
      
      if (idx != -1)
        levelVertices.splice(idx - 1, 0, this);
      else
        levelVertices.push(this);
        
      if (levelVertices.length < 2)
        return;
        
      if (idx == -1)
        return;

      let dXForRight = 0, dXForLeft = 0;

      if (idx - 1 >= 0)
        dXForLeft = (idx - 1 >= 0) && (levelVertices[idx - 1].left + levelVertices[idx - 1].width - this.left);
      if (idx + 1 < levelVertices.length)
        dXForRight = (idx + 1 < levelVertices.length) && (levelVertices[idx + 1].left - this.left + this.width);
        
      for (let i = 0; i < idx; i++) {

        let v = levelVertices[i];
        v.left += dXForLeft;
        v.vertexElement.style.left = v.left;
        if (v.parent)
          setArrowProps(v.vertexElement, v.parent.vertexElement, v.parentArrowElement);
      }
        

      
      for (let i = idx + 1; i < levelVertices.length; i++) {
        let v = levelVertices[i];
        v.left -= dXForRight;
        
        v.vertexElement.style.left = v.left;
        

        if (v.parent)
          setArrowProps(v.vertexElement, v.parent.vertexElement, v.parentArrowElement);
      }
    }

    isProved() {
      this.proved = this.formulasSequence.reduce((acc, expr) => {
        return acc || this.formula.absoluteEquals(expr);
      }, false);

      return this.proved;
    }

    static exprAsVariable(vertex, popupInfo, tokenElement, fromFormula) {
      const popupElement = popupInfo.element;
      popupElement.innerHTML = 'Введите название заменяемой переменной: <br/>';
      const input = document.createElement('input');
      
      input.innerHTML = '';

      input.style.width = '30%';
      input.placeholder = tokenElement.innerText;
      input.addEventListener('click', e => {
        popupInfo.inputActiveOrKeyDown = false;
      });
      input.addEventListener('keydown', e => {
        popupInfo.inputActiveOrKeyDown = false;

        if (e.key.toString() == 'Enter') {
          const idxs = tokenElement.id.split(',');
          const exprIdx = Number(idxs[1]);
          const tokenIdx = Number(idxs[2]);
          tokenElement.innerHTML = input.value;

          vertex.formulas[exprIdx].at(tokenIdx).val = input.value;
          vertex.formulas[exprIdx].at(tokenIdx).mustBeActivated = false;

          vertex.isProved();
          redrawVertex(vertex);
          popupElement.remove();
          popupsSet.splice(popupsSet.find(pI => pI.id == popupInfo.id), 1);
        };
      });

      popupElement.append(input);
    }

    addVertex(leftStrExpr, rightStrExpr, rule) {
      let parentProps = getOffset(this.vertexElement);
      let childLevel = this.level + 1;
      let 
        x = 0, 
        y = this.top - this.height - ySpace;
      if (this.children.length == 0) {
        x = parentProps.left - globalThis.xSpace;
      }
      else {
        x = this.children.reduce((max, child) => {
          let props = getOffset(child.vertexElement);
          let temp = props.left + props.width;

          if (max < temp)
            return temp;
      
          return max
        }, 0);
        x += globalThis.xSpace;
      }
      let newChild = new Vertex(
        x, 
        y, 
        childLevel, 
        leftStrExpr, 
        rightStrExpr, 
        this.formulasSequence,
        this,
        this.children.length,
        rule
      );
      newChild.parent = this;
      this.children.push(newChild);
      newChild.inParentIdx = this.children.length - 1;
      
      return newChild;
    }
    
    sortedInsert() {
      const idx1 = Vertex._levelToVertices[this.level].findIndex(v => v.centerX > this.centerX);
      
      if (idx1 != -1)
        Vertex._sortedByCenterX.splice(idx1, 0, this);
      else
        Vertex._sortedByCenterX.push(this);
    }

    removeVertex() {
      if (!this.parent)
        document.rootVertex = null;

      this.dependentVertices.pop();


      this.depthFirstTraverse(current => {
        $(current.parentArrowElement).remove();
        $(current.vertexElement).remove();
      });
      
      if (this.parent) {
        let inParentIdx = this.parent.children.find(v => v.id === this.id);
        this.parent.children.splice(inParentIdx, 1);

        const rule = this.rule;
        const forProvingIdx = this.forProvingIdx;
        delete this.parent.forProving[rule][forProvingIdx];
      }

      clearTraversalInfoInTree();
    }

    
    checkProvenTree() {
      clearTraversalInfoInTree(this);

      if (!this)
        return false;
      
      let curVertex = this;

      while (this.wasOut != true) {
        curVertex.wasIn = true;
        if (curVertex.children.length == 0 || curVertex.leftChildCursor >= curVertex.children.length) {
          curVertex.isProved();
          
          let childrenSubtreesState = false;
          Object.values(curVertex.forProving).forEach(independentSeq => {
            let temp1 = false;

            Object.values(independentSeq).forEach(dependentSeq => {
              let temp2 = true;
              dependentSeq.forEach(v => {
                temp2 &&= v.subtreeProvingState;
              });
              
              childrenSubtreesState ||= temp2;
            });

            childrenSubtreesState ||= temp1;
          });

          const branchesStateProving = childrenSubtreesState;
          curVertex.subtreeProvingState = curVertex.proved;
          
          
          if (curVertex.children.length != 0)
            curVertex.subtreeProvingState ||= branchesStateProving;


          curVertex.wasOut = true;
          curVertex = curVertex.parent;
        }
        else {
          curVertex = curVertex.children[curVertex.leftChildCursor++];
        }
      }

      return this.subtreeProvingState;
    }
  }



  
  
  
  
  globalThis.replaceRulesContent = (vertex, popupInfo) => {
    const popupElement = popupInfo.element;
    popupElement.innerHTML = 'Доступные правила вывода: <br/>';
    const rules = ['2', '3', '6', '8', '9', '10', '11', '12', '13'];
    let availableRules = Array.from(rules);

    if (vertex.formula.length == 0)
      availableRules = ['6', '10', '11', '12'];
    else
      availableRules = availableRules.filter(v => v != '10');
    if (vertex.formulasSequence.length == 0 || vertex.formulasSequence.at(-1).absoluteEquals(vertex.formula))
      availableRules = availableRules.filter(v => v != '12');
    availableRules.forEach(a => {
      const ruleSpan = document.createElement('span');
      ruleSpan.innerHTML = a;
      ruleSpan.style.cursor = 'pointer';


      ruleSpan.addEventListener('click', function(e) {
        InferenceRules.rulesMap[a](vertex);
        popupElement.remove();
      }, false);

      ruleSpan.style.color = 'red';
      ruleSpan.style.fontSize = 20;

      popupElement.append(ruleSpan);
      
      let spaceSpan = document.createElement('span');
      spaceSpan.innerHTML = ' , ';
      
      popupElement.append(spaceSpan);
    });
  }

  globalThis.rulesPopupContent = (vertex, popupInfo, tokenElement) => {
    const popupElement = popupInfo.element;
    popupElement.innerHTML = 'Доступные правила вывода: <br/>';
    const rulesInfo = InferenceRules.chooseRules(vertex);
    let rules = rulesInfo ? rulesInfo.rules : [];
    let ruleSpan;

    if (rules.length != 0)
      rules.forEach(a => {
        ruleSpan = document.createElement('span');
        ruleSpan.innerHTML = a;
        ruleSpan.style.cursor = 'pointer';


        ruleSpan.addEventListener('click', function(e) {
          const tempTokenIdx = Number(tokenElement.id.split(',').slice(-1)[0]);
          let targetTokenIdx = tempTokenIdx;
          
          if (vertex.formula.at(tempTokenIdx).type == Token.types.NEG)
            targetTokenIdx = rulesInfo.availableOpsIdxs.slice(-1)[0];  

          InferenceRules.rulesMap[a](vertex, targetTokenIdx);
          popupElement.remove();
        }, false);

        ruleSpan.style.color = 'red';
        ruleSpan.style.fontSize = 20;

        popupElement.append(ruleSpan);
        
        let spaceSpan = document.createElement('span');
        spaceSpan.innerHTML = ' , ';
        
        popupElement.append(spaceSpan);
      });
  }

  globalThis.destroyPopupMenu = (e) => {
    if (popupsSet.length != 0)
      popupsSet.forEach(pM => {
        $(pM).remove();
      });
  }

  

  globalThis.activateLowPriorityOpTokens = (vertex, tokensIdxs) => {
    let formulaElement = vertex.formulaElement;
    tokensIdxs.forEach(idx => {
      let tokenElement = formulaElement.children[0].children[idx];
      tokenElement.style.color = 'red';
      tokenElement.style.cursor = 'pointer';
      
      tokenElement.addEventListener('click', (e) => {
        createPopupMenu(vertex, tokenElement, rulesPopupContent);
      });
    });
  }
  
  globalThis.activateTokenElement = (vertex, tokenElement, fromFormula) => {
    tokenElement.style.color = 'green';
    tokenElement.style.cursor = 'pointer';
    tokenElement.onclick = 
      e => createPopupMenu(vertex, tokenElement, (...args) => Vertex.exprAsVariable(...args, fromFormula));
  }
  
  globalThis.deactivateTokenElement = (token) => {
    const tokenElement11 = childVertex1.formulasSequenceElements.children[childVertex1.formulasSequence.length - 1].children[0];
    tokenElement11.style.color = 'black';
    tokenElement11.style.cursor = 'revert';
    tokenElement11.onclick = (e) => createPopupMenu(childVertex1, tokenElement11, (...args) => Vertex.exprAsVariable(...args, false));
  }

  globalThis.getFormulaElementContent = (vertex, formulaIdx, fromFormula) => {
    let tokens = vertex.formulas[formulaIdx].tokens;

    const tokenElements = tokens.map((token, tokenIdx) => {
      let tokenElement = document.createElement('span');
      
      tokenElement.id = vertex.id + ',' + formulaIdx + ',' + tokenIdx;
      tokenElement.innerText = token.val;
      if (token.mustBeActivated)
        activateTokenElement(vertex, tokenElement, fromFormula);
      
      
      return tokenElement;
    });
    
    return tokenElements;
  }
  
  globalThis.clearTraversalInfoInTree = (rootVertex) => {
    if (!rootVertex)
      return false;
    
    const queue = [rootVertex];

    while (queue.length != 0) {
      const curVertex = queue.splice(0, 1)[0];
      
      if (curVertex.children.length != 0)
        queue.push(...curVertex.children);
      
      curVertex.wasIn = false;
      curVertex.wasOut = false;
      curVertex.leftChildCursor = 0;
      curVertex.subtreeProvingState = false;
      curVertex.proved = false;

    }
  }

  globalThis.runProven = (leftSpan, rightSpan) => {
    const 
      leftStrExpr = leftSpan.innerText,
      rightStrExpr = rightSpan.innerText;

    let rootVertex = new Vertex(xStart, yStart - 50, 0, leftStrExpr, rightStrExpr);

    document.rootVertex = rootVertex
    generalContainer.append(rootVertex.vertexElement);

    const rulesInfo = InferenceRules.chooseRules(rootVertex);
    if (rulesInfo != null)
      activateLowPriorityOpTokens(
        rootVertex, 
        rulesInfo.availableOpsIdxs
      );

    setInterval(() => updateStateElement(), 200);
  }

  globalThis.updateStateElement = () => {
    if (!document.rootVertex)
      return;
    
    const provenState = document.rootVertex.checkProvenTree();

    let stateElement = document.getElementById('stateButton')
    if (provenState) {
      stateElement.innerText = 'Вывод завершён =) Поздравляем!';
      stateElement.style.backgroundColor = '#28a745';
      stateElement.style.color = 'white';
    }
    else {
      stateElement.innerText = 'Вывод не закончен';
      stateElement.style.backgroundColor = '#ffc107';
      stateElement.style.color = 'navy';
    }
  }

  globalThis.Vertex = Vertex;
}


window.onload = () => {
  module1();
  module2();

  createStartElement();
}