import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  cardForm!: FormGroup;
  cardType: string = '';

  constructor(private formBuilder: FormBuilder) { }

  ngOnInit(): void {
    this.cardForm = this.formBuilder.group({
      cardNumber: ['', [Validators.required, this.cardNumberValidator.bind(this)]],
      cvc: ['', [Validators.required, Validators.pattern(/^\d{3,4}$/)]],
      expiryDate: ['', [Validators.required,this.expiryDateValidator]]
    });

    this.cardForm.get('cardNumber')?.valueChanges.subscribe(value => {
      this.cardType = this.getCardType(value);
    });
  }

  cardNumberValidator(control: { value: any; }) {
    const value = control.value.replace(/\s/g, ''); // Remove spaces before validation

    if (value) {
      if (/^4\d{15}$/.test(value)) {
        return null;
      } else if (/^5\d{15}$/.test(value)) {
        return null;
      } else if (/^3[47]\d{13}$/.test(value)) {
        return null;
      } else {
        return { 'invalidCardNumber': true };
      }
    } else {
      return null;
    }
  }

  expiryDateValidator(control: { value: any; }) {
    const expiryDateRegex = /^(0[1-9]|1[0-2])\/\d{2}$/;
    const expiryDate = control.value;

    if (!expiryDateRegex.test(expiryDate) && expiryDate) {
      return { invalidExpiryDate: 'Expiry date format is invalid' };
    }

    const [month, year] = expiryDate.split('/').map((str: string) => parseInt(str, 10));
    const now = new Date();
    const currentMonth = now.getMonth() + 1;
    const currentYear = now.getFullYear() % 100;

    if (year > currentYear + 10) {
      return { invalidExpiryDate: 'Expiry date format is invalid' };
    }
    if (year < currentYear || (year === currentYear && month < currentMonth)) {
      return { expired: 'Expiry date has passed' };
    }

    return null;
  }
  deleteCase(event : KeyboardEvent){
    
  }
  formatExpiryDate(event: KeyboardEvent) {
    if(event.key !== 'Backspace'){
      let expiryDate : string = this.cardForm.get('expiryDate')?.value;
      let lastValue = expiryDate;
      if(expiryDate === '01' || expiryDate === '1/'){
        lastValue = `01/`;
      }
      else if(!expiryDate.includes('/')){
        let mM = parseInt(expiryDate);
        if(mM >= 2 && mM <= 9){
          lastValue = `0${mM}/`;
        }else if(mM >= 10 && mM <= 12){
          lastValue = `${mM}/`;
        }else if(mM >= 13 && mM <= 19){
          lastValue = `0${Math.floor(mM/10)}/${mM % 10}`
        }
      }
      this.cardForm.get('expiryDate')?.setValue(lastValue);
    }
  }

  checkError(fieldName: string, errorName: string) {
    return this.cardForm.get(fieldName)?.invalid && this.cardForm.get(fieldName)?.touched && this.cardForm.get(fieldName)?.hasError(errorName);
  }

  maxLengthOfCVC() {
    if (this.cardType === 'visa' || this.cardType === 'mastercard') {
      return 3;
    } else {
      return 4;
    }
  
  }

  getCardType(cardNumber: string): string {
    cardNumber = cardNumber.replace(/\s/g, '');
    if (cardNumber.startsWith('4')) {
      return 'visa';
    } else if (cardNumber.startsWith('5')) {
      return 'mastercard';
    } else if (/^3[47]/.test(cardNumber)) {
      return 'amex';
    } else {
      return '';
    }
  }
  maxLengthCardNo() {
    if (this.cardType === 'amex') {
      return 17;
    } else {
      return 19;
    }
  }

  numericInput(event: KeyboardEvent) {    
    const key = event.key;
    if (!/^\d+$/.test(key) &&  key != '/' && key != ' ' && key !== 'Backspace' && key !== 'Tab') {
      event.stopPropagation();
      event.preventDefault();
    }
  }
  

  formatCardNumber() {
    let cardNumber = this.cardForm.get('cardNumber')?.value.replace(/\s/g, ''); // Remove all spaces
    let formattedNumber = '';

    if (this.cardType === 'amex') {
      if (cardNumber.length > 4) {
        formattedNumber += cardNumber.substring(0, 4) + ' ';
        if (cardNumber.length > 10) {
          formattedNumber += cardNumber.substring(4, 10) + ' ';
          formattedNumber += cardNumber.substring(10, 15);
        } else {
          formattedNumber += cardNumber.substring(4);
        }
      } else {
        formattedNumber += cardNumber;
      }
    } else {
      formattedNumber = cardNumber.replace(/(\d{4})(?=\d)/g, '$1 ');
    }

    this.cardForm.get('cardNumber')?.setValue(formattedNumber, { emitEvent: false });

    const cvcControl = this.cardForm.get('cvc');
    if ((this.cardType === 'visa' || this.cardType === 'mastercard') && cvcControl?.value.length === 4) {
      cvcControl.setValue(cvcControl.value.substring(0, 3), { emitEvent: false });
    }
  }
}
