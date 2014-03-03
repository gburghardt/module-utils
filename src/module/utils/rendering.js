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
