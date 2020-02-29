
export function saveSelection() {
  if (window.getSelection) {
    const sel = window.getSelection();
    if (sel.getRangeAt && sel.rangeCount) {
      return sel.getRangeAt(0);
    }
  }
  return null;
}

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

export function restoreSelection(range) {
  if (range) {
    if (window.getSelection) {
      const sel = window.getSelection();
      sel.removeAllRanges();
      sel.addRange(range);

    }
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