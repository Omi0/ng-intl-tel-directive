import {
  Directive,
  OnInit,
  ElementRef,
  HostListener,
  EventEmitter,
  Output,
  Input,
  OnDestroy,
  Renderer2,
  OnChanges,
  SimpleChanges
} from '@angular/core';
import * as intlTelInput from 'intl-tel-input';
import 'intl-tel-input/build/js/utils';
import {
  IntlTelData,
  IntlTelInputInstance,
  IntlTelOptions,
  IntlTelInputGlobals,
  IntlTelOptionsCountryCode
} from './intl-tel.interface';

/**
 * IntlTel Directive is used to apply custom international phone formatter to input field.
 * Responsive and mobile friendly.
 * 
 * Style must be manually imported to scss files, i.e:
 * @import 'intl-tel-input/build/css/intlTelInput.css';
 * 
 * activeCountry is used to dynamically change the country dropdown.
 * 
 * IMPORTANT. activeCountry must be is in lowercase. i.e.: 
 * intlTelActiveCountryCode = String(countryCode).toLowerCase()
 * 
 * OTHERWISE, detectChanges() method of ChangeDetectorRef must be applyed to fix ExpressionChangedAfterItHasBeenCheckedError 
 * 
 * onChange event is used to emit data once country or input field are changed.
 * 
 * <input type="text" [intlTel]="intlTelOptions" [(activeCountry)]="intlTelActiveCountryCode" [numbersOnly]="true" (onChange)="onTelChange($event)" />
 */
@Directive({
  selector: '[intlTel]',
  host: {
    class: 'intl-tel'
  }
})
export class IntlTelDirective implements OnInit, OnDestroy, OnChanges {
  /**
   * intlTel is used to apply directive to input field
   * as well as to to pass additional options
   * i.e. [intlTel]="intlTelOptions"
   * IntlTelOptions interface is used
   */
  @Input('intlTel')
  private intlTelOptions: IntlTelOptions;

  //If set only numbers will be allowed to be entered
  @Input('numbersOnly')
  private numbersOnly: boolean = false;

  //This is to set activeCountry based on input parameter
  @Input('activeCountry')
  activeCountry: IntlTelOptionsCountryCode;

  //Implementing two-way data binding on [(activeCountry)]
  @Output('activeCountryChange')
  activeCountryChange = new EventEmitter<IntlTelOptionsCountryCode>();

  /**
   * onChange event is emitted if tel field or country dropdown is changed.
   * emit data in the following format
   * 
   * {
   *   countryData: IntlTelSelectedCountryData;
   *   phoneNumber: string;
   *   validationError: string | null;
   * }
   * 
   */
  @Output('onChange')
  onChange = new EventEmitter<IntlTelData>();

  private intlTelInputInstance: IntlTelInputInstance;

  private _value: string;

  constructor(private elementRef: ElementRef, private renderer: Renderer2) {}

  ngOnInit() {
    // Adding .intl-tel class
    if (this.numbersOnly) {
      this.renderer.setAttribute(this.elementRef.nativeElement, 'type', 'tel');
      this.renderer.setAttribute(
        this.elementRef.nativeElement,
        'pattern',
        'd*'
      );
      this.renderer.setAttribute(
        this.elementRef.nativeElement,
        'maxlength',
        '15'
      );
    }
    this.intlTelInputInstance = intlTelInput(
      this.elementRef.nativeElement,
      this.intlTelOptions || {}
    );
    // this.setCountry('us');
    this.onChange.emit({
      countryData: this.intlTelInputInstance.getSelectedCountryData(),
      phoneNumber: this.intlTelInputInstance.getNumber(),
      validationError: this.getValidationError()
    });
  }

  ngOnChanges(changes: SimpleChanges) {
    // Updating intlTelInputInstance if intlTelOptions changed
    if (
      changes.intlTelOptions &&
      changes.intlTelOptions.currentValue &&
      changes.intlTelOptions.firstChange === false
    ) {
      this.intlTelInputInstance.destroy();
      this.renderer.removeAttribute(
        this.elementRef.nativeElement,
        'placeholder'
      );
      this.intlTelInputInstance = intlTelInput(
        this.elementRef.nativeElement,
        changes.intlTelOptions.currentValue || {}
      );
      this.onChange.emit({
        countryData: this.intlTelInputInstance.getSelectedCountryData(),
        phoneNumber: this.intlTelInputInstance.getNumber(),
        validationError: this.getValidationError()
      });
    }

    // Updating country if activeCountry changed
    if (
      changes.activeCountry &&
      changes.activeCountry.currentValue &&
      changes.activeCountry.firstChange === false
    ) {
      this.setCountry(changes.activeCountry.currentValue);
    }
  }

  ngOnDestroy() {
    this.intlTelInputInstance.destroy();
  }

  /**
   * countrychange event listener
   * 
   * @param event 
   */
  @HostListener('countrychange', ['$event'])
  countryChangeListener(event) {
    const countryData = this.intlTelInputInstance.getSelectedCountryData();
    this.onChange.emit({
      countryData: countryData,
      phoneNumber: this.intlTelInputInstance.getNumber(),
      validationError: this.getValidationError()
    });
    this.activeCountryChange.emit(countryData.iso2);
  }

  /**
   * keyup event listener
   * to emit onChange event
   * 
   * @param event 
   */
  @HostListener('keyup', ['$event'])
  onValueChanged(event: any) {
    if (event.target.value !== this._value) {
      this._value = event.target.value;
      this.onChange.emit({
        countryData: this.intlTelInputInstance.getSelectedCountryData(),
        phoneNumber: this.intlTelInputInstance.getNumber(),
        validationError: this.getValidationError()
      });
    }
  }

  /**
   * keydown event listener
   * To preventDefault excluded keys 
   * 
   * @param event 
   */
  @HostListener('keydown', ['$event'])
  keyDownListener(event: KeyboardEvent) {
    // Allowing pasting and navigating keys
    if (
      event.keyCode === 46 ||
      event.keyCode === 8 || // Delete, Backspace
      (event.keyCode === 65 && event.ctrlKey === true) || // Allow: Ctrl+A
      (event.keyCode === 67 && event.ctrlKey === true) || // Allow: Ctrl+C
      (event.keyCode === 86 && event.ctrlKey === true) || // Allow: Ctrl+V
      (event.keyCode === 88 && event.ctrlKey === true) || // Allow: Ctrl+X
      (event.keyCode === 65 && event.metaKey === true) || // Cmd+A (Mac)
      (event.keyCode === 67 && event.metaKey === true) || // Cmd+C (Mac)
      (event.keyCode === 86 && event.metaKey === true) || // Cmd+V (Mac)
      (event.keyCode === 88 && event.metaKey === true) || // Cmd+X (Mac)
      (event.keyCode >= 35 && event.keyCode <= 39) // Home, End, Left, Right
    )
      return; // let it happen, don't do anything

    // Ensure that it is a number and stop the keypress
    if (
      this.numbersOnly === true &&
      ((event.shiftKey || (event.keyCode < 48 || event.keyCode > 57)) &&
        (event.keyCode < 96 || event.keyCode > 105))
      // Change event.keyCode > 105 with the code bellow to allow -
      // (event.keyCode > 105 &&
      //   (event.keyCode !== 109 && // '-' on numpad
      //     event.keyCode !== 189 && // '-' in alphabate keybord key on chrome
      //     event.keyCode !== 173))) // '-' in alphabate keybord key on firefox & on chrome 173 keycord is Mute On|Off
    )
      return event.preventDefault();
  }

  /**
   * paste event listener
   * to filter out digits only
   * 
   * @param event 
   */
  @HostListener('paste', ['$event'])
  pasteListener(event: ClipboardEvent) {
    if (this.numbersOnly === false) return;
    event.preventDefault();
    const pastedInput: string = event.clipboardData
      .getData('text/plain')
      .replace(/\D/g, ''); // get a digit-only string
    document.execCommand('insertText', false, pastedInput);
  }

  /**
   * drop event listener
   * to filter out digits only
   * 
   * @param event 
   */
  @HostListener('drop', ['$event'])
  dropListener(event: DragEvent) {
    if (this.numbersOnly === false) return;
    event.preventDefault();
    const textData = event.dataTransfer.getData('text').replace(/\D/g, '');
    this.elementRef.nativeElement.focus();
    document.execCommand('insertText', false, textData);
  }

  /**
   * collecting validations errors 
   * 
   * @return string
   */
  getValidationError(): string | null {
    const validationError = {
      IS_POSSIBLE: 0,
      INVALID_COUNTRY_CODE: 1,
      TOO_SHORT: 2,
      TOO_LONG: 3,
      NOT_A_NUMBER: 4
    };
    const errorCode: number = this.intlTelInputInstance.getValidationError();
    return (
      Object.keys(validationError).find(
        key => validationError[key] === errorCode
      ) || null
    );
  }

  /**
   * Checking if countryCode is valid and its existed
   * Setting new country by its countryCode
   * 
   * @param countryCode 
   * 
   * @return void
   */
  setCountry(countryCode: IntlTelOptionsCountryCode): void {
    const intlTelInputGlobals = (window as IntlTelInputGlobals)
      .intlTelInputGlobals;
    if (intlTelInputGlobals && this.intlTelInputInstance) {
      const countryData = intlTelInputGlobals.getCountryData();
      const code = countryCode.toLowerCase() as IntlTelOptionsCountryCode;
      if (countryData.map(data => data.iso2).includes(code)) {
        this.intlTelInputInstance.setCountry(code);
      }
    }
  }
}
