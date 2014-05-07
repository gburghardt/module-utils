Module.Utils.Events = {
	included: function(Klass) {
		Beacon.setup(Klass);
		Klass.addCallback("beforeReady", "_initApplicationEvents");

		if (Beacon.Notifications) {
			Klass.addCallback("beforeReady", "_initNotifications");
		}
	}
};

Module.Utils.include(Module.Utils.Events);
