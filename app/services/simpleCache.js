export class SimpleCache {
	constructor() {
		this._hashmap = new Map();
	}

	get(key) {
		return this._hashmap.get(key);
	}

	set(key,object) {
		this._hashmap.set(key,object);
	}
	
	delete(key) {
		this._hashmap.delete(key);
	}
 
}