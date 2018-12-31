# Angular 2+ International Phone Input Formatter / Directive


Uses [intl-tel-input](https://www.npmjs.com/package/intl-tel-input) package. Its responnsive and mobile-friendly. Native phone input is used on mobiles
![Field](https://raw.githubusercontent.com/Omi0/ng-intl-tel-directive/master/images/intl-tel-field.png)
![Field](https://raw.githubusercontent.com/Omi0/ng-intl-tel-directive/master/images/intl-tel-dropdown.png)


## System Requirements

* [intl-tel-input](https://www.npmjs.com/package/intl-tel-input)

## Usage

Import style into scss:

```
@import 'intl-tel-input/build/css/intlTelInput.css';
```

Apply directive to input field. Min implementation:

```
<input type="text" intlTel />
```

With additional options, parameters and event listeners

```
// Template
<input type="text" [intlTel]="intlTelOptions" [(activeCountry)]="intlTelActiveCountryCode" [numbersOnly]="true" (onChange)="onTelChange($event)" />

// Component
public intlTelOptions: IntlTelOptions = {
  initialCountry: 'gb',
  separateDialCode: true,
  preferredCountries: ['gb', 'us']
};
```

### Input Parameters

###### intlTel

Is used to pass additional options, IntlTelOptions interface is used to define object:

```
public intlTelOptions: IntlTelOptions = {
  initialCountry: 'gb',
  separateDialCode: true,
  preferredCountries: ['gb', 'us']
};
```
Parameters can be be changed dynamically. Once changed the instance will be reinitialized. To apply new options intlTelOptions object must be changed, i.e.
```
// Somewhere after initial declaration.

// ES6 way
intlTelOptions = {
  ...intlTelOptions,
  preferredCountries: ['de']
}
// Old fassion way
Object.assign({preferredCountries: ['de']}, intlTelOptions);
```

###### activeCountry

activeCountry is used to dynamically change county dropdown. Although it can be acheived by changeing intlTelOptions. This is preffered method to change country. Because before setting the country it checks whether the country is available for selection.
IMPORTANT. activeCountry must be is in lowercase, otherwise, detectChanges() method of ChangeDetectorRef must be applyed to fix ExpressionChangedAfterItHasBeenCheckedError.

Example:

```
// Template
[activeCountry]="activeCountryCode"

// Component
this.checkoutForm.get('country').valueChanges.subscribe(country => {
  this.intlTelActiveCountry = String(country).toLowerCase();

  // Althernative solution to prevent ExpressionChangedAfterItHasBeenCheckedError
  this.changeDetectorRef.detectChanges();
});

```

###### numbersOnly

numbersOnly is used to allow only numbers to be entered:

```
[numbersOnly]="true"
```

### Events

###### onChange

onChange is emited everytime phone number value or country dropdown is changed:

```
// Template
(onChange)="onTelChange($event)"

// Component
onTelChange(intlTelData: IntlTelData) {}
```

IntlTelData object has the following format:
```
export interface IntlTelData {
  countryData: IntlTelSelectedCountryData;
  phoneNumber: string;
  validationError: string | null;
}

export interface IntlTelSelectedCountryData {
  areaCodes?: string;
  dialCode: string;
  iso2: IntlTelOptionsCountryCode;
  name: string;
  priority: number;
}
```

###### activeCountryChange

activeCountryChange is emited everytime country is changed. Its can be used separately:

```
// Template
(activeCountryChange)=onActiveCountryChange($event)"

// Component
onActiveCountryChange(countryCode: IntlTelOptionsCountryCode) {}
```

or Two-Way Data Binding
```
// Template
[(activeCountry)]="activeCountryCode"

// Component
public activeCountryCode: IntlTelOptionsCountryCode = 'us';
```
