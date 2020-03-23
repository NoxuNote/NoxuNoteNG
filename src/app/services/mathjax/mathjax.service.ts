import { Injectable } from '@angular/core';
import { replaceAsync, invisibleCharSpan, createSpan } from "../../types/staticTools"

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

  /**
   * Determines if a formula is unwrapped in the input text
   * @param t html
   * @return true if a formula is present and needs to be wrapped
   */
  testUnwrappedFormula(t: string): boolean {
    return t.search(/`([^\`]+)`/g) !== -1
  }

  /**
   * Enveloppe les balises mathématiques inserées dans l'élément dans un wrapper (décrit plus bas) 
   * et **génère la formule avec Mathjax**
   * @param el Un élément, généralement un block EditorJs
   * @param shouldTypeset true si la formule doit être transformée par Mathjax dans outputFormula
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
   * - le premier **rawFormula** destiné à contenir une formule brute mathématique
   * - le second **outputFormula** destiné à l'affichage, porte l'élément géneré par MathJax
   * @param rawFormula Formule mathématique ASCII brute (sans balises ``)
   * @param outputFormula Objet affiché, géneré par MathJax
   * @param shouldTypeset true si la formule doit être transformée par Mathjax dans outputFormula
   */
  async generateWrapper(rawFormula: string, outputFormula: string, shouldTypeset: boolean=false): Promise<HTMLSpanElement> {
    const span = createSpan('', 'formula')
    span.contentEditable = "false"
    span.innerHTML = invisibleCharSpan().outerHTML + `<span class="rawFormula">${rawFormula}</span>`
    if (shouldTypeset) {
      const chtml: Node = await this.tex2chtml(rawFormula) // Call MathJax to build the formula CHTML
      const outputEl = createSpan('', 'outputFormula')
      outputEl.appendChild(chtml)
      span.appendChild(outputEl)
    } else {
      span.appendChild(createSpan(outputFormula, 'outputFormula'))
    }
    span.appendChild(invisibleCharSpan())
    return span
  }

}
