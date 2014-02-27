Module.Utils.Events = {

	included: function(Klass) {
		Klass.addCallback("beforeReady", "_initEvents");
	},

	prototype: {
		_initEvents: function _initEvents() {
		}
	}

};

Module.Utils.include(Module.Utils.Events);
