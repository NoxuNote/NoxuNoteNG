/**
 * G pas compris cette fonction
 */
export function getTextNodeAtPosition(root, index) {
  var lastNode = null;
  const nodeFilter: NodeFilter = {
    acceptNode: (node: Node) => {
      if (index >= node.textContent.length) {
        index -= node.textContent.length;
        lastNode = node;
        return NodeFilter.FILTER_REJECT
      }
      return NodeFilter.FILTER_ACCEPT;
    }
  }
  const treeWalker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, nodeFilter);
  const c = treeWalker.nextNode();
  return {
    node: c ? c : root,
    position: c ? index : 0
  };
}
/**
 * Renvoie une fonction qui lorsqu'elle est appelée, restaure la position du curseur
 */
export function saveCaretPosition(context) {
  var selection = window.getSelection();
  var range = selection.getRangeAt(0);
  range.setStart(context, 0);
  var len = range.toString().length;

  return () => {
    var pos = getTextNodeAtPosition(context, len);
    selection.removeAllRanges();
    var range = new Range();
    range.setStart(pos.node, pos.position);
    selection.addRange(range);

  }
}

/**
 * Replace matching regex in str with the processed value through asyncFn
 * @param str String to operate replacement
 * @param regex Matching regex
 * @param asyncFn Function that returns a promise of the new string
 */
export async function replaceAsync(str, regex, asyncFn) {
  const promises = [];
  str.replace(regex, (match, ...args) => {
    const promise = asyncFn(match, ...args);
    promises.push(promise);
  });
  const data = await Promise.all(promises);
  return str.replace(regex, () => data.shift());
}

/**
 * Insère le noeud fourni en paramètre à l'emplacement du curseur
 * @param node Un noeud HTML
 */
export function insertNodeAtCursor(node: Node) {
  // const block = this.editor.blocks.getBlockByIndex(this.editor.blocks.getCurrentBlockIndex())
  // const editableElement = block.querySelector('[contenteditable="true"]')
  let sel: Selection, range: Range;
  if (window.getSelection) {
    sel = window.getSelection();
    if (sel.getRangeAt && sel.rangeCount) {
      range = sel.getRangeAt(0);
      range.deleteContents();
      range.insertNode(node);
    }
  }
}

/**
 * Renvoie les coordonnées du curseur texte (caret)
 */
export function getCaretCoordinates(): number[] {
  const rect = window.getSelection().getRangeAt(0).getClientRects()[0]
  return [rect.left, rect.top]
}

/**
 * Génère un span contenant un point invisible
 */
export function invisibleCharSpan(): HTMLSpanElement {
  return createSpan('.', '', [{style:'opacity', value:'0'}])
}

/**
 * Crée un span avec les paramètres fournis
 * @param content Contenu de la span (innerText)
 * @param className Classes CSS, séparées par un espace
 * @param styles Liste d'objets définissant une proprieté de style ex: [{'style':'color', 'value':'red'}]
 */
export function createSpan(content: string, className: string, styles: {style: string, value: string|number}[] = []): HTMLSpanElement {
  const span = document.createElement('span')
  span.innerText = content
  if(className.length) span.className = className
  styles.forEach(s => span.style[s.style] = s.value)
  return span
}