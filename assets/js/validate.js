function Validator(formSelector) {

    let _this = this;
    const formRules = {};

    const validatorRules = {
        required: value => {
            return value ? undefined : 'This field is required';
        },
        email: value => {
            let regex = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
            return value.toLowerCase().match(regex) ? undefined : 'Your email address is not correct';
        },

        password: value => {
            let regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
            return value.match(regex) ? undefined : 'Your password must have at least: 1 Lowercase, 1 Uppercase, and Digits';
        },
        min: min => {
            return value => {
                return value.length >= min ? undefined : `Use from ${min} characters`;
            }
        },
    }

    const formElement = document.querySelector(formSelector);

    if (formElement) {
        let inputs = formElement.querySelectorAll('[name][rules]');

        inputs.forEach(input => {
            let rules = input.getAttribute('rules').split('|');
            rules = Array.from(rules).map(rule => {
                if (rule.includes(':')) {
                    let ruleInfo = rule.split(':');
                    let param = ruleInfo[1];
                    rule = ruleInfo[0];
                    return validatorRules[rule](param);
                }
                return validatorRules[rule];
            });

            formRules[input.name] = rules;

            // event validate (blur, change,...)
            input.onblur = handleValidate;
            input.oninput = handleClearError;
        });

        // Hàm thực hiện validate
        function handleValidate(e) {
            let rules = formRules[e.target.name];
            let errorMessage;

            for (let rule of rules) {
                errorMessage = rule(e.target.value);

                // Xử lý input, checkbox,...
                switch (e.target.type) {
                    case 'checkbox':
                    case 'radio':
                        errorMessage = rule(formElement.querySelector('input[name="gender"]:checked'));
                        break;
                    default:
                        errorMessage = rule(e.target.value);
                }

                if (errorMessage) break;
            }

            // hiển thị lỗi ra UI
            if (errorMessage) {
                let formGroup = e.target.closest('.form-group');
                if (formGroup) {
                    formGroup.classList.add('invalid');

                    let formMessage = formGroup.querySelector('.form-message');
                    if (formMessage) {
                        formMessage.innerText = errorMessage;
                    }
                }
            }
            return !errorMessage
        }

        // clear Message error
        function handleClearError(e) {
            let formGroup = e.target.closest('.form-group');

            if (formGroup.classList.contains('invalid')) {
                formGroup.classList.remove('invalid');

                let formMessage = formGroup.querySelector('.form-message');
                if (formMessage) {
                    formMessage.innerText = '';
                }
            }

        }
    }

    // Xử lý hành vi submit form
    formElement.onsubmit = e => {
        e.preventDefault();

        let inputs = formElement.querySelectorAll('[name][rules]');
        let isValid = true;

        for (let input of inputs) {
            if (!handleValidate({ target: input })) { isValid = false }
        }

        if (isValid) {
            if (typeof _this.onSubmit === 'function') {
                let enableInput = formElement.querySelectorAll("[name]:not([disable])");
                let formValues = Array.from(enableInput).reduce((values, input) => {

                    switch (input.type) {
                        case 'checkbox':
                            if (input.matches(':checked')) {
                                if (!Array.isArray(values[input.name])) {
                                    values[input.name] = [];
                                }
                                values[input.name].push(input.value);
                            } else if (!values[input.name]) {
                                values[input.name] = '';
                            }
                            break;

                        case 'radio':
                            if (input.matches(':checked')) {
                                values[input.name] = input.value;
                            } else if (!values[input.name]) {
                                values[input.name] = '';
                            }
                            break;

                        case 'file':
                            values[input.name] = input.files;
                            break;
                        default:
                            values[input.name] = input.value;
                    }

                    return values;
                }, {});
                return _this.onSubmit(formValues);
            }
            formElement.submit();
        }
    }
}
