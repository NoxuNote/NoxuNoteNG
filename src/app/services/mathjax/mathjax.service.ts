import { Injectable } from '@angular/core';
import { OutputData } from '@editorjs/editorjs';

declare const MathJax: any;

@Injectable({
  providedIn: 'root'
})
export class MathjaxService {

  constructor() { }

  tex2chtml(input: string, outputNode: Node): Promise<Node> {
    input = input.trim()
    MathJax.texReset()
    var options = MathJax.getMetricsFor(outputNode);
    console.log(options);
    return MathJax.tex2chtmlPromise(input, options)
  }

  /**
   * Needed after append
   */
  clearAndUpdate() {
    MathJax.startup.document.clear();
    MathJax.startup.document.updateDocument();
  }

  typeset() {
    MathJax.typesetPromise()
  }

  // wrapBeforeTypeset(el: Element) {
  //   el.innerHTML = el.innerHTML.replace(/`([^\$]+)`/g, (a, b) =>
  //     // a matches: $1/2$    and b matches the first capturing group: 1/2
  //     `<span contenteditable="false" name=_sanitized>
  //         <span class="hidden" name=_sanitized>|RAW|${b}|/RAW|</span>
  //         <span class="hidden" name=_sanitized>|OUTPUT|</span>${a}<span class="hidden">|/OUTPUT|</span>
  //       </span>`
  //   )
  //   return el;
  // }

  wrapBeforeTypeset(el: Element) {
    console.log("WRAPPING content : ", el.cloneNode(true));
    
    el.innerHTML = el.innerHTML.replace(/`([^\`]+)`/g, (a, b) => {

      // a matches: $1/2$    and b matches the first capturing group: 1/2
      return `<span contenteditable="false" class="formulae">
          <span class="rawFormulae">${b}</span>
          <span class="outputFormulae">${a}</span>
        </span>`
    }
    )
    console.log('returning el: ', el.cloneNode(true))
    return el;
  }

  // /**
  //  * 
  //  * @param blocks Editor.JS blocks save output
  //  */
  // unwrapOutput(out: OutputData): OutputData {
  //   out.blocks.forEach(b => {
  //     if (["paragraph", "header"].includes(b.type)) {
  //       // remove RAW tags
  //       b.data["text"] = b.data["text"].replace(/\|RAW\|([\s\S]*)\|\/RAW\|/g, (a, b) => "`" + b + "`")
  //       // remove OUTPUT
  //       b.data["text"] = b.data["text"].replace(/\|OUTPUT\|([\s\S]*)\|\/OUTPUT\|/g, '')
  //       // remove \n
  //       b.data["text"] = b.data["text"].replace(/\n/g, '')
  //       // remove double whitespaces
  //       b.data["text"] = b.data["text"].replace(/[\s]{2,}/g, ' ')
  //     }
  //   })
  //   return out
  // }

}
