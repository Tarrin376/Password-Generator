"use strict";
// Enumeration used to store levels of password strength
var PasswordStrengths;
(function (PasswordStrengths) {
    PasswordStrengths[PasswordStrengths["weak"] = 0] = "weak";
    PasswordStrengths[PasswordStrengths["medium"] = 1] = "medium";
    PasswordStrengths[PasswordStrengths["strong"] = 2] = "strong";
    PasswordStrengths[PasswordStrengths["veryStrong"] = 3] = "veryStrong";
})(PasswordStrengths || (PasswordStrengths = {}));
// The probability of the types of characters in each strength level
// Also includes the color that the bar will be when each strength is
// selected
const strengthProbs = [
    {
        number: 90,
        symbol: 5,
        letter: 100,
        barColor: 'green'
    },
    {
        number: 80,
        symbol: 20,
        letter: 75,
        barColor: 'yellow'
    },
    {
        number: 60,
        symbol: 40,
        letter: 30,
        barColor: 'orange'
    },
    {
        number: 10,
        symbol: 80,
        letter: 10,
        barColor: 'red'
    },
];
class PasswordGenerator {
    constructor(charLength, dom) {
        // Special characters that are used in the 'symbol' option
        this.symbols = "/[!@#$%^&*()_+\-=\[\]{};':\\|,.<>\/?]+/";
        // Description of each strength level (implemented from interface)
        this.strengthTitles = ["WEAK", "MEDIUM", "STRONG", "EXTREME"];
        // The strength chosen by the user (implemented from interface)
        this.strength = PasswordStrengths.medium;
        this.passwordParts = [false, false, false, false];
        this.charLength = charLength;
        this.dom = dom;
        /*Initially sets the password strength to 'medium'
        and also sets the start character length along
        with getting the states of the checkboxes.*/
        this.setPasswordStrength(1);
        this.setCharacterLength();
        this.selectCheckBox();
    }
    /*Function responsible for generating a unique password for the user
    while considering the strength chosen and the characters allowed by
    the user. It uses the 'random' function to simulate fair probability
    for the different types of strengths so that more accurate passwords
    are outputted for the type of strength chosen.*/
    generatePassword() {
        // Generated password that is outputted to the user
        let password = "";
        for (let i = 0; i < this.charLength; i++) {
            const letterChosen = this.chooseLetter();
            const numOrSymbol = this.chooseNumOrSymbol();
            const choice = Math.round(Math.random() * 99);
            if ((choice <= strengthProbs[this.strength].letter && letterChosen !== "")
                || numOrSymbol === "") {
                password += letterChosen;
            }
            else {
                password += numOrSymbol;
            }
        }
        // Sets the DOM password text element to the generate password
        this.dom.passRes.textContent = password;
        // Outputs a quick flash to show the user that a password was generated
        this.dom.passContainer.classList.add('outputted');
        // Removes the flash after a certain amount of milliseconds
        setTimeout(() => this.dom.passContainer.classList.remove('outputted'), 250);
    }
    /*This method computes a random letter between 'A' - 'Z'
    while also randomly choosing whether to be uppercase or
    lowercase before the character is returned.*/
    chooseLetter() {
        // If the user has not allowed for either upper or lower case letters, return
        if (!this.passwordParts[0] && !this.passwordParts[1]) {
            return "";
        }
        let choice = Math.round(Math.random());
        while (!this.passwordParts[choice]) {
            choice = Math.round(Math.random());
        }
        const randomLetter = String.fromCharCode(97 + Math.round(Math.random() * 25));
        return choice == 1 ? randomLetter : randomLetter.toUpperCase();
    }
    /*Method that generates a random symbol or number according to the strength of
    the password. It randomly chooses to return a number or symbol depending on the
    strength level.*/
    chooseNumOrSymbol() {
        let choice = Math.round(Math.random() * 99);
        // If the user hasn't allowed for both numbers and symbols, return
        if (!this.passwordParts[2] && !this.passwordParts[3]) {
            return "";
        }
        // Compute random choice
        while (true) {
            choice = Math.round(Math.random() * 99);
            if ((choice <= strengthProbs[this.strength].symbol && this.passwordParts[3])
                || (choice > strengthProbs[this.strength].symbol && this.passwordParts[2])) {
                break;
            }
        }
        // Check if the choice fell into the 'symbol' range
        if (choice <= strengthProbs[this.strength].symbol) {
            // Generate random symbol from 'symbols' instance attribute
            const symbolIndex = Math.round(Math.random() * (this.symbols.length - 1));
            return this.symbols[symbolIndex];
        }
        else {
            // Generate random number from 0 - 9
            const randomNum = Math.round(Math.random() * 9);
            return randomNum.toString();
        }
    }
    /*This method sets the password strength to the strength
    requested by the user. It updates the colours of the strength bars
    in the UI while also setting the new strength.*/
    setPasswordStrength(strength) {
        this.dom.strengthDesc.textContent = this.strengthTitles[strength];
        this.strength = strength;
        this.dom.strengthLevels.forEach((level) => {
            const asInput = level;
            if (parseInt(asInput.value) <= this.strength) {
                asInput.style.backgroundColor = strengthProbs[this.strength].barColor;
            }
            else {
                asInput.style.backgroundColor = '';
            }
        });
    }
    /*Copies the generated password outputted to the UI, into
    the user's clipboard so they can straight away
    use the password.*/
    copyToClipboard() {
        const copyPass = this.dom.passRes.textContent;
        if (copyPass) {
            navigator.clipboard.writeText(copyPass);
            alert("Copied the password to clipboard!");
        }
    }
    /*Updates the character length of the password to be generated.
    Also updates the UI to display to the user what length they
    have currently chosen.*/
    setCharacterLength() {
        this.charLength = parseInt(this.dom.lengthSlider.value);
        this.dom.passLength.textContent = this.dom.lengthSlider.value;
    }
    /*Updates the states of all of the checkboxes that the user
    has selected or left unselected. This is done so checks can be
    performed before a password is generated so the user doesn't recieve
    for example, numbers if they didn't request for numbers to be included.*/
    selectCheckBox() {
        for (let i = 0; i < this.passwordParts.length; i++) {
            const selected = this.dom.checkboxes[i].checked;
            if (selected)
                this.passwordParts[i] = true;
            else
                this.passwordParts[i] = false;
        }
    }
}
// The DOM object that implements the 'DomElements' interface
// and is passed into the constructor of the 'PasswordGenerator'
// class.
const dom = {
    strengthLevels: [...document.querySelector(".levels").children],
    passRes: document.getElementById("pass-res"),
    clipboard: document.getElementById("clipboard-icon"),
    passLength: document.getElementById("length-output"),
    lengthSlider: document.querySelector(".slider"),
    generatePass: document.querySelector(".generate-pass"),
    strengthDesc: document.getElementById("strength-desc"),
    passContainer: document.querySelector('.generated-pass'),
    checkboxes: [
        document.getElementById("0"),
        document.getElementById("1"),
        document.getElementById("2"),
        document.getElementById("3"),
    ],
};
// Creates a new object instance from the class 'PasswordGenerator'
const passwordGenerator = new PasswordGenerator(7, dom);
// Adding event listeners for check boxes.
for (let checkbox of Object.values(dom.checkboxes)) {
    checkbox.addEventListener("click", passwordGenerator.selectCheckBox.bind(passwordGenerator));
}
// Adding event listeners for each strength level bar in the UI
dom.strengthLevels.forEach((level) => {
    level.addEventListener("click", passwordGenerator.setPasswordStrength.bind(passwordGenerator, parseInt(level.value)));
});
// Event lister for character length slider element
dom.lengthSlider.addEventListener("input", passwordGenerator.setCharacterLength.bind(passwordGenerator));
// Event listener for 'generate' button
dom.generatePass.addEventListener("click", passwordGenerator.generatePassword.bind(passwordGenerator));
// Event listener for clipboard icon (present in top right)
dom.clipboard.addEventListener("click", passwordGenerator.copyToClipboard.bind(passwordGenerator));
//# sourceMappingURL=PasswordGenerator.js.map