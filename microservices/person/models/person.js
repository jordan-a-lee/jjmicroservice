'use strict';

const _ = require('underscore');
const CONTAINS_DIGIT_REGEX = /.*[0-9].*/;

var VALID_ADDRESS_REQUIRED_ATTRIBUTES = [
  "id",
  "firstname",
  "lastname",
  "title",
  "titleofcourtesy",
  "postalcode",
  "homephone",
  "email",
  "photolink",
  "addressId",
  "notes",
  "deleted"
];

// Check for valid alphabet or not
function isAlphabeticString(string) {
  var isNotEmpty = !isEmpty(string);
  var doesNotContainDigits = !CONTAINS_DIGIT_REGEX.test(string);
  var doesNotContainInvalidChars = !/[\{\}\(\)_\$#"'@\|!\?\+\*%<>/]/.test(string);
  return isNotEmpty && doesNotContainDigits && doesNotContainInvalidChars;
}

function isEmpty(val) {
  var isUndefined = typeof val === 'undefined';
  var isNull = val === null;
  var isString = typeof val === 'string';
  var isObject = typeof val === 'object';

  if (isUndefined || isNull) {
    return true;
  } else if (isString) {
    var hasJustSpaces = val.trim().length === 0;
    return hasJustSpaces;
  } else if (isObject) {
    return isEmptyObject(val);
  } else {
    return false;
  }
}

function isValid(object) {
  if (typeof object !== 'undefined') {
    var isValid = true;
    if (typeof object.validate === 'function') {
      var validationOutput = object.validate();
      if (typeof validationOutput === 'boolean') {
        var isValid = isValid && (validationOutput === true);
      }
    }
    return isValid;
  } else {
    return false;
  }
}

const isValidId = (id) => {
  var isNotEmpty = !isEmpty(id);
  return isNotEmpty;
}

const isValidName = (name) => {
  return isAlphabeticString(name);
}

const isValidPhone = (homephone) => {
  var notIsEmpty = isEmpty(homephone);
  //are all US numbers 10 digits?
  var isLengthCorrect = (homephone.length == 10) ? true : false;
  var hasOnlyDigits = /^\d+$/.test(homephone);

  return notIsEmpty && isLengthCorrect && hasOnlyDigits;
}

const isValidPostalCode = (postalcode) => {
  const ZIP_CODE_FORMAT_REGEX = /[0-9]{5,}$/;
  var isNotEmpty = !isEmpty(postalcode);
  var hasZipCodeFormat = ZIP_CODE_FORMAT_REGEX.test(postalcode);
  return isNotEmpty && hasZipCodeFormat;
}

const isValidEmail = (email) => {
  var isCorrectEmailFormat = /\S+@\S+\.\S+/.test(email);
  return isCorrectEmailFormat;
}

/***
 * Model class for Person
 ***/
module.exports = class Person {

  constructor(attributes) {

    // TODO: Add validations for each fields.
    if (_.isObject(attributes)) {
      this._id = attributes.id;
      this._firstname = attributes.firstname;
      this._lastname = attributes.lastname;
      this._title = attributes.title;
      this._titleofcourtesy = attributes.titleofcourtesy;
      this._postalcode = attributes.postalcode;
      this._homephone = attributes.homephone;
      this._email = attributes.email;
      this._addressId = attributes.addressId;
      this._notes = attributes.notes;
      this._photolink = attributes.photolink;
      this._deleted = false;
    }
  }

  set id(id) {
    if (id) {
      if (!isValidId(id)) {
        throw new Exception("Invalid id")
      }

      this._id = id;
    }
  }
  
  set firstname(firstname) {
    if (firstname) {
      if(isValidName(firstname)) {
        this._firstname = firstname;
      }
      else {
        throw new Exception("Invalid firstname")
      }
    }
  }

  set lastname(lastname) {
    if (lastname) {
      if(isValidName(lastname)) {
        this.lastname = lastname;
      }
      else {
        throw new Exception("Invalid lastname")
      }
    }
  }

  get lastname() {
    return this._lastname;
  }

  set title(value){
    if(value){
      this._title = value;
    }
  }

  get title(){
    return this._title;
  }

  set titleofcourtesy(value){
    if(value){
      this._titleofcourtesy = value;
    }
  }

  get titleofcourtesy(){
    return this._titleofcourtesy;
  }

  set postalcode(postalcode){
    if(postalcode){
      if(isValidPostalCode(postalcode))
      {
        this._postalcode = value;
      }
      else
        throw new Exception("Invalid postal code");
    }
  }

  get postalcode(){
    return this._postalcode;
  }

  set homephone(value){
    if(value){
      this._homephone = value;
    }
  }

  get homephone(){
    return this._homephone;
  }

  set email(value){
    if(value){
      if(isValidEmail(value)) {
        this._email = value;
      }
      else
      {
        throw new Exception("Invalid email");
      }
    }
  }

  get email(){
    return this._email;
  }

  set addressId(value){
    if(value){
      this._addressId = value;
    }
  }

  get addressId(){
    return this._addressId;
  }

  set photolink(value){
    if(value){
      this._photolink = value;
    }
  }

  get photolink(){
    return this._photolink;
  }

  set notes(value){
    if(value){
      this._notes = value;
    }
  }

  get notes(){
    return this._notes;
  }

  set deleted(value){
    if(value){
      this._deleted = value;
    }
  }

  get deleted(){
    return this._deleted;
  }

  get id() {
    return this._id;
  }

  get firstname() {
    return this._firstname;
  }

  validate() {
    _.each(VALID_ADDRESS_REQUIRED_ATTRIBUTES, (attribute) => {
      var hasAttribute = typeof this[attribute] !== 'undefined';
      var isValidAttribute = isValid(this[attribute]);
      if (!hasAttribute || !isValidAttribute) {
        console.log('Missing/Invalid attribute: '+ attribute);
        return false;
      }
    });

    return true;
  }
}
