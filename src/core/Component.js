export default class Component {
	$target;
	$props;

	$states;
	$statesCount = 0;
	$storages = {};
	$database = {};

	$attaches = [];
	constructor($target, $props) {
		this.$target = $target;
		this.$props = $props;
		this.setup();
		this.setEvent();
		this.render();
	}
	setup() {}
	mounted() {}
	attach(component) {
		this.$attaches.push(component);
	}
	template() {
		return '';
	}
	render() {
		this.detatch();
		this.$statesCount = 0;
		this.$target.innerHTML = this.template();
		this.mounted();
	}
	detatch() {
		Object.values(this.$storages).forEach((storage) => {
			storage.destructor();
		});
		this.$storages = {};

		Object.values(this.$database).forEach((database) => {
			database.destructor();
		});
		this.$database = {};

		this.$attaches.forEach((attach) => {
			attach.detatch();
		});
		this.$attaches = [];
	}
	setEvent() {}
	addEvent(eventType, selector, callback) {
		const children = [...this.$target.querySelectorAll(selector)];
		const isTarget = (target) =>
			children.includes(target) || target.closest(selector);
		this.$target.addEventListener(eventType, (event) => {
			if (!isTarget(event.target)) return false;
			callback(event);
		});
	}

	useState(defaultValue) {
		const stateIndex = this.$statesCount++;

		const value = this.$states[stateIndex] ?? defaultValue;
		this.$states[stateIndex] = value;

		const setValue = (newValue) => {
			this.$states[stateIndex] = newValue;
			this.render();
		};
		return [value, setValue];
	}

	useStorage(key, defaultValue) {
		if (!this.$storages[key])
			this.$storages[key] = new localStorage(key, defaultValue, () => {
				this.render();
			});
		const storage = this.$storages[key];
		const value = storage.get();
		const setValue = (newValue) => {
			storage.set(newValue);
		};
		return [value, setValue];
	}

	useDatabase(key, model, refs = {}) {
		if (!this.$database[key])
			this.$database[key] = new Database(key, model, refs, () => {
				this.render();
			});
		const database = this.$database[key];
		const value = database.list;

		return [value, database];
	}
}
