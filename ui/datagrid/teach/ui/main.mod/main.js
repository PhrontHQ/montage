const Component = require("mod/ui/component").Component;

exports.Main = class Main extends Component {

    constructor() {
        super();
        const data = [];
        const names = ["Olivia", "Noah", "Amelia", "Liam", "Emma", "Oliver", "Sophia", "Elijah", "Charlotte", "Mateo", "Isabella", "Lucas", "Ava", "LeviMia", "Ezra", "Elli", "Asher", "Luna", "Leo"];
        const surnames = ["Smith", "Johnson", "Williams", "Jones", "Brown", "Davis", "Taylor", "Wilson", "Anderson", "Marchant", "Román Cortés", "Hipp", "Kanaparthi", "Kiener", "Zanini"];
        for (let i = 0; i < 100; ++i) {
            data.push({
                isAwesome: [true, false][Math.random() * 2 | 0],
                name: names[Math.random() * names.length | 0],
                surname: surnames[Math.random() * surnames.length | 0],
                age: Math.random() ** 2 * 120 | 0
            });
        }
        this.data = data;
    }

    // Note: Sorting should be taken care by Mod's data layer but
    // we are implementing our sorting here for the example.

    set datagridOrderBy(value) {
        this.orderBy = value;
        this.sortData();
    }

    set datagridIsOrderAscending(value) {
        this.isOrderAscending = value;
        this.sortData();
    }

    createSortingFunction(propertyName) {
        return (a, b) => a[propertyName] > b[propertyName] ? 1 : a[propertyName] < b[propertyName] ? -1 : 0;
    }

    sortData() {
        if (this.orderBy !== undefined && this.isOrderAscending !== undefined) {
            this.data.sort(this.createSortingFunction(this.orderBy));
            if (!this.isOrderAscending) this.data.reverse();
        }
    }

};