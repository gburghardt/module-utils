Module.Utils = {
	include: function(mixin) {
		if (Module.Base)
			Module.Base.include(mixin);
	}
};
