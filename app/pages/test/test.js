import {inject, NewInstance} from 'aurelia-dependency-injection';
import {ValidationController, validateTrigger} from 'aurelia-validation';
import {required, email, ValidationRules} from 'aurelia-validatejs';

@inject(NewInstance.of(ValidationController))
export class RegistrationForm {
  @required
  firstName = '';

  @required
  lastName = '';

  @required
  @email
  email = '';

  constructor(controller) {
    this.controller = controller;
    
    // the default mode is validateTrigger.blur but 
    // you can change it:
    // controller.validateTrigger = validateTrigger.manual;
    // controller.validateTrigger = validateTrigger.change;
  }

  submit() {
    let errors = this.controller.validate();
    // todo: call server...
  }
  
  reset() {
    this.firstName = '';
    this.lastName = '';
    this.email = '';
    this.controller.reset();
  }
}


// ValidationRules
//   .ensure('firstName').required()
//   .ensure('lastName').required()
//   .ensure('email').required().email()
//   .on(RegistrationForm);