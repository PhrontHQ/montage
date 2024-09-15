var Component = require("mod/ui/component").Component;

exports.Main = class Main extends Component { /** @lends Main# */

    _selection1

    get _selection1() {
        return this._selection1;
    }

    set selection1(value) {
        if(this._selection1 !== value) {
            console.debug("Main: set selection1: ",value.name);
            this._selection1 = value;
        }
    }

    _selection2

    get _selection2() {
        return this._selection2;
    }

    set selection2(value) {
        if(this._selection2 !== value) {
            console.debug("Main: set selection2: ",value.name);
            this._selection2 = value;
        }
    }


};
