import { Injectable } from '@angular/core';
import { replaceAsync } from "../../types/staticTools"

declare const MathJax: any;

@Injectable({
  providedIn: 'root'
})
export class MathjaxService {

  constructor() { }

  tex2chtml(input: string): Promise<Node> {
    MathJax.texReset()
    return MathJax.tex2chtmlPromise(input, {})
  }

  /**
   * Needed after append
   */
  clearAndUpdate() {
    MathJax.startup.document.clear();
    MathJax.startup.document.updateDocument();
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


  /**
   * Enveloppe les balises mathématiques inserées dans l'élément dans un wrapper (décrit plus bas) 
   * et **génère la formule avec Mathjax**
   * @param el Un élément, généralement un block EditorJs
   * @param shouldTypeset true si la formule doit être transformée par Mathjax dans outputFormulae
   */
  async wrap(el: Element, shouldTypeset: boolean=false) {
    el.innerHTML = await replaceAsync(el.innerHTML, /`([^\`]+)`/g, async (a, b) => {
      const wrap = await this.generateWrapper(b, a, shouldTypeset)
      return wrap.outerHTML
    })
    return el;
  }

  /**
   * Génère un noeud contenant 2 noeuds :
   * - le premier **rawFormulae** destiné à contenir une formule brute mathématique
   * - le second **outputFormulae** destiné à l'affichage, porte l'élément géneré par MathJax
   * @param rawFormulae Formule mathématique ASCII brute (sans balises ``)
   * @param outputFormulae Objet affiché, géneré par MathJax
   * @param shouldTypeset true si la formule doit être transformée par Mathjax dans outputFormulae
   */
  async generateWrapper(rawFormulae: string, outputFormulae: string, shouldTypeset: boolean=false): Promise<HTMLSpanElement> {
    const span = document.createElement('span')
    span.contentEditable = "false"
    span.className = "formulae"
    if (shouldTypeset) {
      // Call MathJax to build the formulae CHTML
      const chtml: Node = await this.tex2chtml(rawFormulae)
      // Generate wrapper
      span.innerHTML = `<span class="rawFormulae">${rawFormulae}</span>`
      const outputFormulaeEl = document.createElement('span')
      outputFormulaeEl.className = "outputFormulae"
      outputFormulaeEl.appendChild(chtml)
      span.appendChild(outputFormulaeEl)
    } else {
      // Generate wrapper
      span.innerHTML = `<span class="rawFormulae">${rawFormulae}</span>\
  <span class="outputFormulae">${outputFormulae}</span>&nbsp;`
    }

    return span
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
