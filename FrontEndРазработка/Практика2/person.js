class Person {
    constructor(firstName, lastName, age) {
        this.firstName = firstName;
        this.lastName = lastName;
        this._age = age;
    }

    get age() { return this._age; }
    set age(value) { this._age = value; }

    getFullName() {
        return `${this.firstName} ${this.lastName}`;
    }

    changeAge(newAge) {
        if (Number.isInteger(newAge) && newAge > 0 && newAge < 100) {
            this._age = newAge;
            return true;
        }
        return false;
    }
}