const tag = 'me.kimjisub.vanillajs-component.';

class LocalStorage {
	constructor(key, defaultData, onChange) {
		this.key = key;
		this.onChange = onChange;

		const rawData = window.localStorage.getItem(tag + this.key);

		if (rawData === null) this.set(defaultData);
		this.bindChangeListener = this.changeListener.bind(this);
		window.addEventListener('storage', this.bindChangeListener);
	}

	destructor() {
		window.removeEventListener('storage', this.bindChangeListener);
		this.bindChangeListener = null;
	}

	changeListener(e) {
		if (e.key === tag + this.key) {
			if (this.onChange) this.onChange(e);
		}
	}
	get() {
		return JSON.parse(window.localStorage.getItem(tag + this.key));
	}

	set(newValue) {
		const oldValue = this.get();
		window.localStorage.setItem(tag + this.key, JSON.stringify(newValue));
		const event = new StorageEvent('storage', {
			key: tag + this.key,
			oldValue,
			newValue,
		});
		window.dispatchEvent(event);
	}
}

class Database extends LocalStorage {
	list;
	constructor(key, model, refs, onChange) {
		super(key, [], onChange);
		this.model = model;
		this.refs = refs;
		this.reload();
	}

	reload() {
		this.list = this.get().map((item) => new this.model(item, this.refs));
	}
	changeListener(e) {
		super.changeListener(e);
		this.reload();
	}
	getIndex(i) {
		return this.list[i];
	}
	update(i, data) {
		const list = this.get();
		list[i] = data.toJSON();
		this.set(list);
	}
	append(data) {
		const list = this.get();
		this.set(list.concat(data.toJSON()));
		return list.length;
	}
	remove(index) {
		const list = this.get();
		this.set(list.filter((d, i) => i != index));
	}
	findAll(query) {
		const list = this.get();
		return list
			.filter((item) => {
				const keys = Object.keys(query);
				for (const i in keys) {
					const key = keys[i];
					if (query[key] !== item[key]) return false;
				}
				return true;
			})
			.map((item) => new this.model(item));
	}
	find(query) {
		return this.findAll(query)[0];
	}
}
