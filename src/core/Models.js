class Model {
	constructor(fields, refs) {}
	toJSON() {}
	toString() {}
	equals(target) {
		return this.toString() === target.toString();
	}

	get id() {}
}
