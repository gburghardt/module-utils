Module.Utils.PropertyCache = {

	self: {

		cache: null,

		fromCache: function() {
			var toString = Object.prototype.toString,
			    isArray = function(x) { return toString.call(x) === "[object Array]"; };

			function defaultMerge(destination, source, key, klass) {
				var name, value, i, length, method;

				for (name in source) {
					if (source.hasOwnProperty(name)) {
						value = source[name];

						if (isArray(value)) {
							destination[name] = destination[name] || [];
							method = destination[name].length === 0 ? "push" : "unshift";

							for (i = 0, length = value.length; i < length; i++) {
								if (destination[name].indexOf(value[i]) < 0) {
									destination[name][method](value[i]);
								}
							}
						}
						else if (!destination.hasOwnProperty(name)) {
							destination[name] = source[name];
						}
					}
				}
			}

			return function fromCache(key, callback, context) {
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
					if (proto.hasOwnProperty(key) && proto[key]) {
						callback.call(context, value, proto[key], key, this);
					}

					proto = proto.__proto__;
				}

				return (this.cache[key] = value);
			};
		}()

	}

};

Module.Utils.include(Module.Utils.PropertyCache);
