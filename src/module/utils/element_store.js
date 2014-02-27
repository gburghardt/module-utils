Module.Utils.ElementStore = {

	includes: {
		ElementStore.Utils
	},

	included: function(Klass) {
		Klass.addCallback("beforeReady", "_initElementStore");
		Klass.addCallback("destroy", "destroyElementStore");
	},

	prototype: {
		_initElementStore: function _initElementStore() {
			this.initElementStore(this.element);
		}
	}

};

Module.Utils.include(Module.Utils.ElementStore);
