/*! module-utils 2014-05-14 */
(function(global) {

var toString = global.Object.prototype.toString;

function isArray(x) {
	return toString.call(x) === "[object Array]";
}

function merge(source, destination, safe) {
	for (var key in source) {
		if (source.hasOwnProperty(key) && (!safe || !destination.hasOwnProperty(key))) {
			destination[key] = source[key];
		}
	}
}

function includeAll(mixins, Klass) {
	if (!Klass) {
		throw new Error("Missing required argument: Klass");
	}

	mixins = isArray(mixins) ? mixins : [mixins];

	var i = 0, length = mixins.length;

	for (i; i < length; i++) {
		if (!mixins[i]) {
			throw new Error("Mixin at index " + i + " is null or undefined");
		}

		Klass.include(mixins[i]);
	}
}

function include(mixin) {
	var key, Klass = this;

	// include class level methods
	if (mixin.self) {
		merge(mixin.self, Klass, true);
	}

	// include instance level methods
	if (mixin.prototype) {
		merge(mixin.prototype, Klass.prototype, true);
	}

	// include other mixins
	if (mixin.includes) {
		includeAll(mixin.includes, Klass);
	}

	if (mixin.included) {
		mixin.included(Klass);
	}

	mixin = null;
}

function extend(descriptor) {
	descriptor = descriptor || {};

	var key, i, length, ParentKlass = this;

	// Constructor function for our new class
	var ChildKlass = function ChildKlass() {
		this.initialize.apply(this, arguments);
	};

	// "inherit" class level methods
	merge(ParentKlass, ChildKlass);

	// new class level methods
	if (descriptor.self) {
		merge(descriptor.self, ChildKlass);
	}

	// Set up true prototypal inheritance
	ChildKlass.prototype = Object.create(ParentKlass.prototype);

	// new instance level methods
	if (descriptor.prototype) {
		merge(descriptor.prototype, ChildKlass.prototype);
	}

	// apply mixins
	if (descriptor.includes) {
		includeAll(descriptor.includes, ChildKlass);
	}

	ChildKlass.prototype.initialize = ChildKlass.prototype.initialize || function initialize() {};
	ChildKlass.prototype.constructor = ChildKlass;

	ParentKlass = descriptor = null;

	return ChildKlass;
}

// Make "include" available to the World
if (!global.Function.prototype.include) {
	global.Function.prototype.include = include;
}

// Make "extend" available to the World
if (!global.Function.prototype.extend) {
	if (global.Object.extend) {
		// Some JavaScript libraries already have an "extend" function
		global.Object._extend = extend;
	}

	global.Function.prototype.extend = extend;
}

})(this);

function Callbacks(context, types) {
	if (context) {
		this.context = context;
		this.types = types || {};
	}
}

Callbacks.prototype = {

	context: null,

	types: null,

	destructor: function destructor() {
		this.context = this.types = null;
	},

	add: function add(name, method) {
		if (!this.types[name]) {
			this.types[name] = [];
		}

		this.types[name].push(method);

		return this;
	},

	execute: function execute(name) {
		if (!this.types[name]) {
			return true;
		}

		var args = Array.prototype.slice.call(arguments, 1, arguments.length);
		var method, i = 0, length = this.types[name].length;
		var success = true;

		for (i; i < length; i++) {
			method = this.types[name][i];

			if (!this.context[method]) {
				throw new Error("No callback method found: " + method);
			}

			if (this.context[method].apply(this.context, args) === false) {
				success = false;
				break;
			}
		}

		return success;
	},

	remove: function remove(name, method) {
		if (!this.types[name]) {
			return;
		}

		var i = 0, length = this.types[name].length, m;

		for (i; i < length; i++) {
			if (method === this.types[name][i]) {
				this.types[name].splice(i, 1);
				break;
			}
		}

		return this;
	}

};

Callbacks.Utils = {
	self: {
		addCallback: function addCallback(name, method) {
			this.prototype.callbacks = this.prototype.callbacks || {};

			if (!this.prototype.callbacks[name]) {
				this.prototype.callbacks[name] = [];
			}
			else if (!this.prototype.callbacks[name] instanceof Array) {
				this.prototype.callbacks[name] = [this.prototype.callbacks[name]];
			}

			this.prototype.callbacks[name].push(method);

			return this;
		}
	},

	prototype: {
		callbacks: null,

		initCallbacks: function initCallbacks(types) {
			if (!this.hasOwnProperty("callbacks")) {
				this.callbacks = new Callbacks(this);
			}

			if (types) {
				this.callbacks.types = types;
			}
		},

		destroyCallbacks: function destroyCallbacks() {
			if (this.callbacks) {
				this.callbacks.destructor();
				this.callbacks = null;
			}
		}
	}
};

Module.Utils = {
	include: function(mixin) {
		if (Module.Base)
			Module.Base.include(mixin);
	}
};

Module.Utils.Bootstrap = {
	includes: [
		Callbacks.Utils
	],

	included: function(Klass) {
		// Forcefully override methods
		var proto = Klass.prototype;

		if (proto.initialize !== Module.Utils.Bootstrap.prototype.initialize) {
			proto._originalInitialize = proto.initialize || function emptyInitialize() {};
			proto.initialize = Module.Utils.Bootstrap.prototype.initialize;
		}
		else {
			proto.initialize = function emptyInitialize() {};
		}

		if (proto.init !== Module.Utils.Bootstrap.prototype.init) {
			proto._originalInit = proto.init || function emptyInit() {};
			proto.init = Module.Utils.Bootstrap.prototype.init;
		}
		else {
			proto.init = function emptyInit() {};
		}

		if (proto.destructor !== Module.Utils.Bootstrap.prototype.destructor) {
			proto._originalDestructor = proto.destructor || function emptyDestructor() {};
			proto.destructor = Module.Utils.Bootstrap.prototype.destructor;
		}
		else {
			proto.destructor = function emptyDestructor() {};
		}

		proto = null;
	},

	prototype: {

		initialize: function() {
			this._originalInitialize.call(this);
			this.setOptions(this.mergeProperty("options"));
		},

		init: function(elementOrId, options) {
			this._originalInit.call(this, elementOrId, options);
			this.initCallbacks(this.mergeProperty("callbacks"));
			this.callbacks.execute("beforeReady");
			this._ready();
			this.callbacks.execute("afterReady");

			if (!this._isLoading) {
				this._loaded();
			}

			return this;
		},

		destructor: function(keepElement) {
			this.callbacks.execute("destroy", keepElement);
			this.destroyCallbacks();
			this._originalDestructor.call(this, keepElement);
		},

		_ready: function() {
		},

		cancel: function(event, element, params) {
			event.stop();
			this.destructor();
			event = element = params = null;
		}

	}

};

Module.Utils.include(Module.Utils.Bootstrap);

Module.Utils.PropertyCache = {

	self: {

		cache: null,

		fromCache: function() {
			var toString = Object.prototype.toString,
			    isArray = function(x) { return toString.call(x) === "[object Array]"; };

			function defaultMerge(destination, source, key, klass) {
				var name, value, i, length;

				for (name in source) {
					if (source.hasOwnProperty(name)) {
						value = source[name];

						if (isArray(value)) {
							if (!destination[name]) {
								destination[name] = value;
							}
							else {
								destination[name] = destination[name] || [];

								for (i = 0, length = value.length; i < length; i++) {
									if (destination[name].indexOf(value[i]) < 0) {
										destination[name].unshift(value[i]);
									}
								}
							}
						}
						else if (!destination.hasOwnProperty(name)) {
							destination[name] = source[name];
						}
					}
				}
			}

			return function fromCache(key, name, callback, context) {
				this.cache = this.cache || {};

				if (this.cache[key]) {
					return this.cache[key];
				}

				if (!callback) {
					callback = defaultMerge;
					context = this;
				}
				else {
					context = context || null;
				}

				var proto = this.prototype, value = {};

				while (proto) {
					if (proto.hasOwnProperty(name) && proto[name]) {
						callback.call(context, value, proto[name], key, this);
					}

					proto = proto.__proto__;
				}

				return (this.cache[key] = value);
			};
		}()

	},

	prototype: {

		mergeProperty: function mergeProperty(name, callback, context) {
			var key = this.guid ? this.guid + "." + name : name;
			return this.constructor.fromCache(key, name, callback, context);
		}

	}

};

Module.Utils.include(Module.Utils.PropertyCache);

Module.Utils.Rendering = {

	included: function(Klass) {
		Klass.addCallback("destroy", "_destroyRenderingEngine");
	},

	prototype: {

		renderingEngine: null,

		_destroyRenderingEngine: function _destroyRenderingEngine() {
			this.renderingEngine = null;
		},

		render: function render(name, data, elementOrId) {
			return this.renderingEngine.render(name, data, elementOrId);
		}

	}

};

Module.Utils.include(Module.Utils.Rendering);
