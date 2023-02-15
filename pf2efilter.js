/**
 */
 
import {SystemObject} from "./systemobject.js";
 
import {cat, sign, stripjunk} from "./systemobject.js";

export class pf2eObject extends SystemObject {

	 
	constructor(filter, actor, title) {
		super(filter, actor, title);
	}

	_initialize(title) {
		super._initialize(title);
		let a = this.actor;

		this.defs['hp'] = a.system.attributes.hp.value;
		this.defs['speed'] = a.system.attributes.speed.value;
		this.defs['alignment'] = a.system.details.alignment.value;
		this.defs['level'] = a.system.details.level.value;
			
	}
	
 }
 