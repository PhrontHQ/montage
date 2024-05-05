var Component = require("mod/ui/component").Component,
    MockService = require('mod/test/mocks/data/services/mock-service').MockService,
    customerUIDescriptor = require('mod/test/mocks/data/models/customer-ui-descriptor.mjson').montageObject;

exports.Main = Component.specialize(/** @lends Main# */{

    constructor: {
        value: function () {
            this.mockService = new MockService();
            this.strings = [
                "amet",
                "aliqua",
                "culpa",
                "tempor",
                "nisi",
                "elit",
                "anim",
                "commodo",
                "officia",
                "aliquip"
            ];

            this.employees = this.mockService.fetchEmployees();
            this.customers = this.mockService.fetchCustomers();
            this.customerUIDescriptor = customerUIDescriptor;
        }
    }

});
