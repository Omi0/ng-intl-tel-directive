import { IntlTelDirective } from '@standalone/directives/intl-tel/intl-tel.directive';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

@NgModule({
  imports: [CommonModule],
  declarations: [IntlTelDirective],
  exports: [IntlTelDirective]
})
export class IntlTelModule {}
