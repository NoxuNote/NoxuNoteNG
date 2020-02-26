import { NgModule, ModuleWithProviders } from '@angular/core';
import { MathDirective } from '../../directives';
import { MathjaxService } from '../../../services';

/**
 * https://stackoverflow.com/questions/55125544/mathjax-in-angular-6
 */
@NgModule({
  declarations: [MathDirective],
  exports: [MathDirective]
})
export class MathModule {

  constructor(mathService: MathjaxService) {
    // see https://docs.mathjax.org/en/latest/advanced/dynamic.html
    const script = document.createElement('script') as HTMLScriptElement;
    script.type = 'text/javascript';
    script.src = 'mathjax/tex-chtml.js';
    script.async = true;

    document.getElementsByTagName('head')[0].appendChild(script);

    const config = document.createElement('script') as HTMLScriptElement;
    config.type = 'text/x-mathjax-config';
    // register notifier to StartupHook and trigger .next() for all subscribers
    config.text = `
    MathJax.Hub.Config({
        skipStartupTypeset: true,
        tex2jax: { inlineMath: [["$", "$"]],displayMath:[["$$", "$$"]] }
      });
      MathJax.Hub.Register.StartupHook('End', () => {
        window.hubReady.next();
        window.hubReady.complete();
      });
    `;

    document.getElementsByTagName('head')[0].appendChild(config);
  }

  // this is needed so service constructor which will bind
  // notifier to window object before module constructor is called
  public static forRoot(): ModuleWithProviders {
    return {
      ngModule: MathModule,
      providers: [{provide: MathjaxService, useClass: MathjaxService}]
    };
  }
}