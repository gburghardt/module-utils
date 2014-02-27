Module.Utils.Events = {
	included: function(Klass) {
		Beacon.setup(Klass);
		Klass.addCallback("beforeReady", "_initApplicationEvents");
	}
};

Module.Utils.include(Module.Utils.Events);
