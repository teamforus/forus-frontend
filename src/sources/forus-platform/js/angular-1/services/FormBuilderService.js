const FormBuilderService = function() {
    return new(function() {
        this.build = function(values, submit, autoLock = false) {
            return {
                values: values || {},
                errors: {},
                locked: false,
                lock: function() {
                    this.locked = true;
                },
                unlock: function() {
                    this.locked = false;
                },
                submit: function() {
                    if (!this.locked) {
                        if (autoLock) {
                            this.lock();
                        }

                        return submit(this);
                    }
                },
                resetValues: function() {
                    return this.values = {};
                },
                resetErrors: function() {
                    return this.errors = {};
                },
                reset: function() {
                    return this.resetValues() & this.resetErrors();
                }
            };
        };
    });
};

module.exports = [
    FormBuilderService
];