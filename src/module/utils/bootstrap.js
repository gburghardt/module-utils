Module.Utils.Bootstrap = {
	includes: [
		Callbacks.Utils
	],

	included: function included(Klass) {
		// Forcefully override methods
		var proto = Klass.prototype;

		if (proto.init !== Module.Utils.Bootstrap.prototype.init) {
			proto._originalInit = proto.init || function emptyInit() {};
			proto.init = Module.Utils.Bootstrap.prototype.init;
		}

		if (proto.destructor !== Module.Utils.Bootstrap.prototype.destructor) {
			proto._originalDestructor = proto.destructor || function emptyDestructor() {};
			proto.destructor = Module.Utils.Bootstrap.prototype.destructor;
		}

		proto = null;
	},

	prototype: {

		init: function init(elementOrId, options) {
			this._originalInit.call(this, elementOrId, options);
			this.initCallbacks(this.constructor.fromCache("callbacks"));
			this.callbacks.execute("beforeReady");
			this._ready();
			this.callbacks.execute("afterReady");

			return this;
		},

		destructor: function destructor(keepElement) {
			this.callbacks.execute("destroy", keepElement);
			this.destroyCallbacks();
			this._originalDestructor.call(this, keepElement);
		},

		_ready: function _ready() {
		}

	}

};

Module.Utils.include(Module.Utils.Bootstrap);
