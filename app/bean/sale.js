module.exports = class Sale {

  constructor(number) {
    this.number = number;
  }

  getNumber() {
    return this.number;
  }

  setBillingDate(billingDate) {
    this.billingDate = billingDate;
  }

  getBillingDate() {
    return this.billingDate;
  }

  setUserId(userId) {
    this.userId = parseInt(userId);
  }

  getUserId() {
    return userId;
  }

  setValue(value) {
    this.value = parseFloat(value);
  }

  getValue() {
    return this.value;
  }





};