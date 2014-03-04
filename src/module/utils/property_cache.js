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
							destination[name] = destination[name] || [];

							for (i = 0, length = value.length; i < length; i++) {
								if (destination[name].indexOf(value[i]) < 0) {
									destination[name].unshift(value[i]);
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
