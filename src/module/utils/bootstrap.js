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

			opts = null;

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
