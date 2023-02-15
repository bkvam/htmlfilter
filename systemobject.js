/**
 */

export function sign(sysObj, val) {
	let n = Number(val);
	if (n === NaN)
		return val;
	if (val <= 0)
		return val;
	return `+${val}`;
}

export function strlength(sysObj, str) {
	return str.length;
}

export function cat(str1, delim, str2) {
	if (str1 == '')
		return str2;
	if (str2 == '')
		return str1;
	return str1 + delim + str2;
}

function concat(sysObj, str1, delim, str2) {
	if (str1 == '')
		return str2;
	if (str2 == '')
		return str1;
	return str1 + delim + str2;
}

function abs(sysObj, v) {
	if (v < 0)
		return -v;
	return v;
}

function ceil(sysObj, value) {
	return Math.ceil(value);
}

export function min() {
	if (arguments.length < 2)
		return 0;

	let minVal = arguments[1];
	for (let i = 1; i < arguments.length; i++) {
		if (arguments[i] < minVal)
			minVal = arguments[i];
	}
	return minVal;
}

export function max() {
	if (arguments.length < 2)
		return 0;

	let maxVal = arguments[1];
	for (let i = 1; i < arguments.length; i++) {
		if (arguments[i] > maxVal)
			maxVal = arguments[i];
	}
	return maxVal;
}

function count(sysObj, listname) {
	let items = sysObj.getItemList(listname);
	return items.length;
}

function resolveUUID(a, uuid) {
	let arr = uuid.split('.');
	if (arr.length == 4) {
		if (arr[0] == 'Actor') {
			switch (arr[2]) {
			case 'Item':
				const items = a.items.filter(it => it._id == arr[3]);
				if (items.length == 1)
					return items[0].name;
				break;
			}
		}
	} else if (arr.length == 2) {
		const items = a.items.filter(it => it._id == arr[1]);
		if (items.length == 1)
			return items[0].name;
	}
	return uuid;
}

export function stripjunk(filter, str) {
	let a = filter.actor;
	str = str.replaceAll('[–]', '');
	
	// Convert UUIDs to the names of the items referenced by UUID.
	// Also convert constructions like @spell[identify].

	const regexp = /@(?<tag>[A-Za-z]+)\[(?<item>[^\]]+)\]({(?<name>[^}]+)})?/g;
	const matches = str.matchAll(regexp);

	let s = '';
	let i = 0;
	for (const match of matches) {
		s += str.substring(i, match.index);

		i = match.index + match[0].length;
		
		if (match.groups.tag == "UUID") {
			if (match.groups.name)
				s += `<b>${match.groups.name}</b>`;
			else
				s += '<b>' + resolveUUID(a, match.groups.item) + '</b>';
		} else {
			// Something like @spell[greater restoration].
			if (match.groups.tag == 'spell')
				s += `<i>${match.groups.item}</i>`;
			else if (match.groups.item.search('|') >= 0) {
				const ia = match.groups.item.split('|');
				if (ia.length == 3)
					s += ia[2];
				else
					s += ia[0];
			} else
				s += `<b>${match.groups.item}</b>`;
		}
	}
	if (i > 0) {
		// Processing took place.
		if (i < str.length)
			s += str.substring(i);
		str = s;
	}
	
	// Turn [[3d6]] dice rolls into 3d6.
	str = str.replaceAll(/\[\[\/r\s+([^\]]+)\]\]/g, '$1');

	return str;
}

 
 export class SystemObject {
	 
	filter;
	actor;
	defs;
	curItem;

	constructor(filter, actor, title) {
		this.filter = filter;
		this.actor = actor;
		this._initialize(title);
	}
	
	getValue(symbol) {
		let value = this.defs[symbol];
		if (value !== undefined)
			return value;
		
		// Do special lookup.

		let parts = symbol.split('.');

		let object;
		if (parts[0] == 'item' && this.curItem) {
			object = this.curItem;
			parts.shift();
		} else
			object = this.actor;


		for (let i = 0; i < parts.length; i++) {
			object = object[parts[i]];
			if (object === undefined)
				return undefined;
		}

		switch (typeof object) {
		case 'string':
			return stripjunk(this.filter, object);
		case 'number':
		case 'boolean':
			return object;

		}
		return undefined;
	}
	
	define(name, value) {
		this.defs[name] = value;
	}
	
	_deleteIgnored(arr) {
		for (const name of this.filter.ignoredItems) {
			const index = arr.findIndex(obj => obj.name == name);
			if (index > -1)
				arr.splice(index, 1);
		}
	}

	getItemList(type) {
		if (/\./.test(type)) {
			let parts = type.split('.');
			if (parts.length > 0) {
				let object;
				object = this.actor;

				for (let i = 0; i < parts.length; i++) {
					object = object[parts[i]];
					if (object === undefined)
						return undefined;
				}

				// Make sure object is an array so it
				// can be iterated over.

				if (Array.isArray(object))
					return object;
				let arr = [];
				
				if (object instanceof Set) {
					for (let m of object) {
						let newObj = new Object();
						newObj.name = m;
						arr.push(newObj);
					}
				} else {
					for (let prop in object) {
						let newObj = object[prop];
						newObj.name = prop;
						arr.push(newObj);
					}
				}
				
				this._deleteIgnored(arr);
				arr.sort((a, b) => (a.name > b.name) ? 1 : -1)
				return arr;
			}
		}
		
		let items = this.actor.items.filter(it => it.type == type);
		this._deleteIgnored(items);
		items.sort((a, b) => (a.name > b.name) ? 1 : -1)
		return items;
	}
	
	setCurItem(item) {
		this.curItem = item;
	}
	
	getCurItem(item) {
		return this.curItem;
	}

	_initialize(title) {
		this.filter.functions = [];
		this.filter.functions['min'] = min;
		this.filter.functions['abs'] = abs;
		this.filter.functions['max'] = max;
		this.filter.functions['round'] = (sysObj, value) => Math.round(value);
		this.filter.functions['trunc'] = (sysObj, value) => Math.trunc(value);
		this.filter.functions['floor'] = (sysObj, value) => Math.floor(value);
		this.filter.functions['ceil'] = ceil;
		this.filter.functions['strlength'] = strlength;
		this.filter.functions['count'] = count;
		this.filter.functions['sign'] = sign;
		this.filter.functions['concat'] = concat;

		this.defs = [];
		this.defs['title'] = this.title;
		this.defs['img'] = this.actor.img;
		this.defs['imgheight'] = game.settings.get('htmlfilter', 'imgheight');
		this.defs['showDetails'] = game.settings.get('htmlfilter', 'details');
		this.defs['showSpellbook'] = game.settings.get('htmlfilter', 'spellbook');

		let players = '';
		let owners = this.actor?.ownership;
		if (owners) {
			for (const owner in owners) {
				if (owner != 'default' && owners[owner] == 3) {
					let user = game.users.get(owner);
					if (user && user.name != 'Gamemaster') {
						players = cat(players, ', ', user.name);
					}
				}
			}
		}
		this.defs['playername'] = players;
	}
	
 }
 