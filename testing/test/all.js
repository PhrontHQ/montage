console.log('mod-testing', 'Start');
module.exports = require("mod-testing").run(require, [
    'spec/require-spec',
    'spec/test-controller-spec',
    {"name": 'spec/testpageloader-spec', "node": false}
]).then(function () {
	console.log('mod-testing', 'End');
}, function (err) {
	console.log('mod-testing', 'Fail', err, err.stack);
	throw err;
});
