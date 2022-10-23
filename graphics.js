
function module1() {
  globalThis.generalContainer = document.getElementById('generalContainer');
  const gCProps = generalContainer.getBoundingClientRect();
  globalThis.globalLeft = gCProps.left;
  globalThis.globalTop = gCProps.top;

  var x = null;
  var y = null;

  globalThis.onMouseUpdate = (e) => {
    x = e.pageX ;
    y = e.pageY;
  }

  document.addEventListener('mousemove', onMouseUpdate, false);

  globalThis.getLocalMouseX = () => {
    return x;
  }
  globalThis.getLocalMouseY = () => {
    return y;
  }

  globalThis.dx = 0;
  globalThis.dy = 0;
  globalThis.containerLeft = globalLeft;
  globalThis.containerTop = globalTop;
  globalThis.oldContainerLeft = globalLeft;
  globalThis.oldContainerTop = globalTop;
  globalThis.moving = false;
  
  globalThis.getGlobalMouseX = () => {
    return -containerLeft + x;
  }
  globalThis.getGlobalMouseY = () => {
    return -containerTop+ y;
  }

  const coordsElement = document.getElementById('coords');

  let timerId = setInterval(() => {
    if (moving) {
      globalThis.toX = getLocalMouseX();
      globalThis.toY = getLocalMouseY();
      dx = fromX - toX;
      dy = fromY - toY;
      
      containerLeft = oldContainerLeft - dx;
      containerTop = oldContainerTop - dy;
      
      generalContainer.style.left = containerLeft;
      generalContainer.style.top = containerTop;
      
      coordsElement.children[0].innerHTML = - (containerLeft - globalLeft);
      coordsElement.children[1].innerHTML = - (containerTop - globalTop);    
    }
    else {
      oldContainerLeft = containerLeft;
      oldContainerTop = containerTop;
    }
  }, 10);

  generalContainer.addEventListener('mouseup', function deactivateMove(e) {
    moving = false;
    oldContainerLeft = containerLeft;
    oldContainerTop = containerTop;
  });

  generalContainer.addEventListener('mousedown', function click(e) {
    globalThis.fromX = getLocalMouseX(),
    globalThis.fromY = getLocalMouseY();    
    moving = true;
  });

  window.addEventListener('mouseleave', function() {
    moving = false;
  });
  
  generalContainer.addEventListener('mouseleave', function() {
    moving = false;
  });
  
  generalContainer.addEventListener('touchend', function deactivateMove(e) {
    moving = false;
    oldContainerLeft = containerLeft;
    oldContainerTop = containerTop;
  });

  generalContainer.addEventListener('touchstart', function click(e) {
    globalThis.fromX = getLocalMouseX(),
    globalThis.fromY = getLocalMouseY();    
    moving = true;
  });

  window.addEventListener('touchcancel', function() {
    moving = false;
  });
  
  generalContainer.addEventListener('touchcancel', function() {
    moving = false;
  });


  globalThis.getOffset = (el) => {
    const rect = el.getBoundingClientRect();
    return {
      left: -containerLeft + rect.left,
      top: -containerTop + rect.top,
      width: rect.width || el.offsetWidth,
      height: rect.height || el.offsetHeight
    };
  }

  globalThis.xStart = -globalLeft + window.screen.availWidth / 2.5;
  globalThis.yStart = -globalTop + window.screen.availHeight * 0.65;
  globalThis.xSpace = 100;
  globalThis.ySpace = 70;


  globalThis.createStartElement = () => {
    let div1 = document.createElement('div');
    div1.id = 'startElement';
    div1.classList.add('main-part-element');
    div1.classList.add('noselect');
    
    let div2 = document.createElement('div');
    div2.classList.add('centered');
    
    let spanSpace = document.createElement('span');
    spanSpace.innerHTML = ' |- ';

    let spanLeft = document.createElement('span');
    spanLeft.contentEditable = true;
    spanLeft.classList.add('vertex');

    let spanRight = document.createElement('span');
    spanRight.contentEditable = true;
    spanRight.classList.add('vertex');

    let runButton = document.createElement('button');
    runButton.classList.add('btn');
    runButton.classList.add('btn-success');
    runButton.style.color = 'white';
    runButton.setAttribute('type', 'button');
    runButton.innerHTML = 'Запустить';


    let stateButton = document.createElement('span');
    stateButton.classList.add('btn');
    stateButton.classList.add('btn-warning');
    stateButton.classList.add('noselect');
    stateButton.style.cursor = 'revert';
    stateButton.style.color = 'navy';
    stateButton.style.margin = '0 20'
    stateButton.setAttribute('type', 'button');
    stateButton.innerHTML = 'Вывод не закончен';
    stateButton.id = 'stateButton';

    div2.append(spanLeft);
    div2.append(spanSpace);
    div2.append(spanRight);
    div2.append(runButton);
    div2.append(stateButton);
    div1.append(div2);



    runButton.onclick = (e) => { runProven(spanLeft, spanRight); }

    generalContainer.append(div1);

    // const div1Offset = getOffset(div1);

    div1.style.left = xStart;
    div1.style.top = yStart + 100;// - div1Offset.height - 20;

  }

  globalThis.redrawVertex = (vertex) => {
    updateVertexElement(vertex);
    vertex.dependentVertices.forEach(v => updateVertexElement(v));
  }

  globalThis.removeChildren = (element) => {
    Array
    .from(element.children)
    .forEach(tE => tE.remove()); 
  }

  globalThis.updateVertexElement = (vertex) => {
    if (vertex.formulas.length != 0) {
      removeChildren(vertex.formulasSequenceElements)
      removeChildren(vertex.formulaElement);

      vertex.formulas.forEach((formula, formulaIdx) => {
        const formulaElement = document.createElement('span');
        formulaElement.classList.add('vertex');
        if (formulaIdx < vertex.formulas.length - 1) {
          formulaElement.append(...getFormulaElementContent(vertex, formulaIdx, true));
          
          vertex.formulasSequenceElements.append(formulaElement);
        }
        else {
          formulaElement.append(...getFormulaElementContent(vertex, formulaIdx, false));
          vertex.formulaElement.append(formulaElement);
        }
    });
    
    moveVertexArrows(vertex);

    const rulesInfo = InferenceRules.chooseRules(vertex); 
    if (rulesInfo != null)
      activateLowPriorityOpTokens(
        vertex, 
        rulesInfo.availableOpsIdxs
      );
  } 

    const rulesInfo = InferenceRules.chooseRules(vertex);
    if (rulesInfo != null)
      activateLowPriorityOpTokens(
        vertex, 
        rulesInfo.availableOpsIdxs
      );
  }

  globalThis.createVertexElement = (x, y, id, vertex) => {
    let div1 = document.createElement('div');
    div1.classList.add('main-part-element');
    div1.classList.add('noselect');

    const grid = document.createElement('table');
    
    const tr1 = document.createElement('tr');
    const tr2 = document.createElement('tr');
    grid.append(...[tr1, tr2]);

    const td11 = document.createElement('td');
    const td12 = document.createElement('td');
    const td13 = document.createElement('td');
    const td14 = document.createElement('td');
    tr1.append(...[td11, td12, td13, td14]);

    const td21 = document.createElement('td');
    const td22 = document.createElement('td');
    const td23 = document.createElement('td');
    const td24 = document.createElement('td');
    tr2.append(...[td21, td22, td23, td24]);

    td13.style.textAlign = '-webkit-center';
    
    let div2 = document.createElement('div');
    div2.classList.add('centered');
    
    let spanSpace = document.createElement('span');
    spanSpace.innerHTML = ' |- ';

    let spanLeft = document.createElement('div');
    
    spanLeft.style.display = 'inline-block';
    spanLeft.style.width = 'max-content';

    let spanRight = document.createElement('div');
    

    let button1 = document.createElement('button');
    button1.classList.add('btn');
    button1.classList.add('btn-danger');
    button1.setAttribute('type', 'button');
    button1.innerHTML = '&#215;';

    const specialDiv = document.createElement('div');
    specialDiv.style.textAlign = '-webkit-center';
    
    const exprSelectorElement = document.createElement('span');
    exprSelectorElement.classList.add('btn');
    exprSelectorElement.classList.add('btn-warning');
    exprSelectorElement.style.backgroundColor = 'slategray';
    exprSelectorElement.style.width = '30%';
    exprSelectorElement.style.display = 'block';
    exprSelectorElement.style.margin = '1 1 5 1';
    exprSelectorElement.onclick = () => createPopupMenu(vertex, vertex.formulaElement, replaceRulesContent);

    td13.append(exprSelectorElement);
    td23.append(spanRight);
    td24.append(button1);

    td21.append(spanLeft);
    td22.append(spanSpace);
    div2.append(grid);
    div1.append(div2);

    div1.style.left = x;
    div1.style.top = y;
    div1.id = id;

    button1.onclick = (e) => { 
      [vertex, ...vertex.dependentVertices].forEach(v => v.removeVertex());
    }
    spanRight.addEventListener('keydown', (e) => moveVertexArrows(this), false);

    generalContainer.append(div1);

    return div1;
  }


  globalThis.setArrowProps = (v1Div, v2Div, arrowElement, color, thickness) => {
    if (!v1Div || !v2Div)
      throw new Error("Пропущен один или оба вершинных элемента");
    
    const arrowDiv = arrowElement.children[0];

    const off1 = getOffset(v1Div);
    const off2 = getOffset(v2Div);
    const x1 = off1.left + off1.width / 2.;
    const y1 = off1.top + off1.height / 2.;
    const x2 = off2.left + off2.width / 2.;
    const y2 = off2.top + off2.height / 2.;

    const length = Math.sqrt(((x2 - x1) * (x2 - x1)) + ((y2 - y1) * (y2 - y1)));

    const cx = ((x1 + x2) / 2) - (length / 2);
    const cy = ((y1 + y2) / 2) - (thickness / 2);

    const angle = Math.atan2((y1 - y2), (x1 - x2)) * (180 / Math.PI);

    arrowDiv.style.padding = '0px';
    arrowDiv.style.margin = '0px';
    arrowDiv.style.height = thickness + 'px';
    arrowDiv.style.backgroundColor = color;
    arrowDiv.style.lineHeight = '1px';
    arrowDiv.style.position = 'absolute';
    arrowDiv.style.left = cx + 'px';
    arrowDiv.style.top = cy + 'px';
    arrowDiv.style.width = length + 'px';
    arrowDiv.style.MozTransform = 'rotate(' + angle + 'deg)';
    arrowDiv.style.WebkitTransform = 'rotate(' + angle + 'deg)';
    arrowDiv.style.OTransform = 'rotate(' + angle + 'deg)';
    arrowDiv.style.MSTransform = 'rotate(' + angle + 'deg)';
    arrowDiv.style.transform = 'rotate(' + angle + 'deg)';
    
    const arrowPrompt = arrowElement.children[1];
    arrowPrompt.style.position = 'absolute';
    arrowPrompt.style.fontSize = 20;
    arrowPrompt.style.fontWeight = 700;
    arrowPrompt.style.left = (x1 + x2) / 2 - 50;
    arrowPrompt.style.top = (y1 + y2) / 2 - 18;
  }

  globalThis.connect = (div1, div2, textPrompt, color, thickness) => {
    const arrowElement = document.createElement('div');
    const arrowDiv = document.createElement('div');
    const arrowPrompt = document.createElement('span');
    arrowPrompt.innerHTML = textPrompt;

    arrowElement.append(arrowDiv);
    arrowElement.append(arrowPrompt);
    arrowElement.classList.add('noselect');
    arrowElement.style.position = "static";
    
    setArrowProps(div1, div2, arrowElement, color, thickness);
    generalContainer.append(arrowElement);

    return arrowElement;
  }


  globalThis.moveVertexArrows = (vertex) => {
    if (vertex.parent)
      setArrowProps(vertex.vertexElement, vertex.parent.vertexElement, vertex.parentArrowElement);

    vertex.children.forEach((childStructure) => {
      setArrowProps(childStructure.vertexElement, vertex.vertexElement, childStructure.parentArrowElement);
    });
  }

  globalThis.popupsSet = [];
  let popupsTimer = setInterval(() => {

    const x = getGlobalMouseX();
    const y = getGlobalMouseY();
    for (let i = 0; i < popupsSet.length; i++) {
      let e = popupsSet[i];
      if (e.mouseOver == true && e.inputActiveOrKeyDown == true && (x < e.left || y < e.top || x > e.right || y > e.down)) {
        $(e.element).remove(); 
        popupsSet.splice(i, 1);
      }
    }
  }, 100); 

  let popupsCount = 0;
  globalThis.createPopupMenu = (vertex, tokenElement, callback) => {
    
    const eProps = getOffset(tokenElement);
    const vPProps = getOffset(vertex.vertexElement);
    const popupHeight = 60;
    // const left = eProps.left - 70 - 5;
    // const top = eProps.top - popupHeight - 30;


    const left = vertex.left;
    const top = vertex.top - popupHeight - 20;

    let existed = popupsSet.reduce((acc, pInfo) => {
      return acc || (Math.abs(left - pInfo.left) < 0.00001 && Math.abs(top - pInfo.top) < 0.00001);
    }, false);
    
    if (existed)
      return;

    let div1 = document.createElement('div');
    div1.style.position = 'absolute';
    div1.style.textAlignLast = 'center';
    div1.style.opacity = 0.8;

    
    
    const newLeft = left;
    const newTop = top;

    div1.style.padding = 5;
    div1.style.left = newLeft;
    div1.style.top = newTop;
    div1.style.backgroundColor = 'gray';
    div1.style.color = 'white';
    
    generalContainer.append(div1);
    
    let popupInfo = {
      id: popupsCount++,
      element: div1,
      left: newLeft,
      top: newTop,
      mouseOver: false,
      inputActiveOrKeyDown: true,
    };

    popupsSet.push(popupInfo);

    callback(vertex, popupInfo, tokenElement);

    const dProps = getOffset(div1);
    
    popupInfo.right = newLeft + dProps.width;
    popupInfo.down = newTop + dProps.height;

    div1.addEventListener('mouseover', (e) => {
      popupInfo.mouseOver = true;
      
      popupsSet.forEach(p => {
        p.element.style.zIndex = 0;
        p.element.style.backgroundColor = 'gray';
      });
      popupInfo.element.style.zIndex = 9999;
      popupInfo.element.style.backgroundColor = 'black';
    });

    return popupInfo;
  }

}