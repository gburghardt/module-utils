Module.Utils.Delegator = {

	included: function included(Klass) {
		Klass.addCallback("beforeReady", "_initDelegator");
		Klass.addCallback("destroy", "_destroyDelegator");
	},

	prototype: {

		actions: null,

		delegator: null,

		_initDelegator: function _initDelegator() {
			this.delegator = this.delegator || new dom.events.Delegator();
			this.delegator.delegate = this;
			this.delegator.node = this.element;

			if (this.options.actionPrefix) {
				this.delegator.setActionPrefix(this.options.actionPrefix);
			}

			this.delegator.init();
			this.delegator.setEventActionMapping(this.constructor.fromCache("actions"));
		},

		_destroyDelegator: function _destroyDelegator(keepElement) {
			if (this.delegator) {
				this.delegator.destructor();
				this.delegator = null;
			}
		}

	}

};

Module.Utils.include(Module.Utils.Delegator);
