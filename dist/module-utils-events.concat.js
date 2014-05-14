/*! module-utils 2014-05-14 */
(function() {

	function include(Klass, mixin) {
		if (mixin.self) {
			merge(mixin.self, Klass, true);
		}

		if (mixin.prototype) {
			merge(mixin.prototype, Klass.prototype, true);
		}

		if (mixin.included) {
			mixin.included(Klass);
		}
	}

	function merge(source, destination, safe) {
		var key, undef;

		for (key in source) {
			if (source.hasOwnProperty(key) &&
				(!safe || destination[key] === undef)) {
				destination[key] = source[key];
			}
		}

		source = destination = null;
	}

	var Beacon = {
		setup: function setup(Klass) {
			if (Beacon.ApplicationEvents) {
				include(Klass, Beacon.ApplicationEvents);

				if (Beacon.Notifications) {
					include(Klass, Beacon.Notifications);
				}
			}
		}
	};

	window.Beacon = Beacon;

})();

Beacon = (function(Beacon) {

	function Dispatcher() {
		this._subscribers = {};
	}

	Dispatcher.prototype = {

		_subscribers: null,

		constructor: Dispatcher,

		destructor: function destructor() {
			if (!this._subscribers) {
				return;
			}

			var subscribers = this._subscribers,
			    subscriber,
			    eventType,
			    i, length;

			for (eventType in subscribers) {
				if (subscribers.hasOwnProperty(eventType)) {
					for (i = 0, length = subscribers[eventType].length; i < length; i++) {
						subscriber = subscribers[eventType][i];
						subscriber.callback = subscriber.context = null;
					}

					subscribers[eventType] = null;
				}
			}

			subscriber = subscribers = this._subscribers = null;
		},

		_dispatchEvent: function _dispatchEvent(publisher, data, subscribers) {
			var subscriber,
			    result,
			    i = 0,
			    length = subscribers.length;

			for (i; i < length; i++) {
				subscriber = subscribers[i];

				if (subscriber.type === "function") {
					result = subscriber.callback.call(subscriber.context, publisher, data);
				}
				else if (subscriber.type === "string") {
					result = subscriber.context[ subscriber.callback ](publisher, data);
				}

				if (result === false) {
					break;
				}
			}

			subscribers = subscriber = publisher = data = null;

			return result !== false;
		},

		publish: function publish(eventType, publisher, data) {
			if (!this._subscribers[eventType]) {
				return true;
			}

			var result = this._dispatchEvent(publisher, data, this._subscribers[eventType]);

			publisher = data = null;

			return result;
		},

		subscribe: function subscribe(eventType, context, callback) {
			var contextType = typeof context;
			var callbackType = typeof callback;

			this._subscribers[eventType] = this._subscribers[eventType] || [];

			if (contextType === "function") {
				this._subscribers[eventType].push({
					context: null,
					callback: context,
					type: "function"
				});
			}
			else if (contextType === "object") {
				if (callbackType === "string" && typeof context[ callback ] !== "function") {
					throw new Error("Cannot subscribe to " + eventType + " because " + callback + " is not a function");
				}

				this._subscribers[eventType].push({
					context: context || null,
					callback: callback,
					type: callbackType
				});
			}
		},

		unsubscribe: function unsubscribe(eventType, context, callback) {

			if (this._subscribers[eventType]) {
				var contextType = typeof context,
				    callbackType = typeof callback,
				    subscribers = this._subscribers[eventType],
				    i = subscribers.length,
				    subscriber;

				if (contextType === "function") {
					callback = context;
					context = null;
					callbackType = "function";
				}
				else if (contextType === "object" && callbackType === "undefined") {
					callbackType = "any";
				}

				while (i--) {
					subscriber = subscribers[i];

					if (
					    (callbackType === "any" && subscriber.context === context) ||
						(subscriber.type === callbackType && subscriber.context === context && subscriber.callback === callback)
					) {
						subscribers.splice(i, 1);
					}
				}

				subscribers = subscriber = null;
			}

			context = callback = null;
		},

		unsubscribeAll: function unsubscribeAll(context) {
			var type, i, subscribers;

			for (type in this._subscribers) {
				if (this._subscribers.hasOwnProperty(type)) {
					subscribers = this._subscribers[type];
					i = subscribers.length;

					while (i--) {
						if (subscribers[i].context === context) {
							subscribers.splice(i, 1);
						}
					}
				}
			}

			context = subscribers = null;
		}

	};

	Beacon.Dispatcher = Dispatcher;

	return Beacon;

})(window.Beacon || {});
Beacon = (function(Beacon) {

	var ApplicationEvents = {

		eventDispatcher: null,

		self: {

			getEventDispatcher: function getEventDispatcher() {
				if (!Beacon.ApplicationEvents.eventDispatcher) {
					Beacon.ApplicationEvents.eventDispatcher = new Beacon.Dispatcher();
				}

				return Beacon.ApplicationEvents.eventDispatcher;
			},

			publish: function publish(eventName, publisher, data) {
				return this.getEventDispatcher().publish(eventName, publisher, data);
			},

			subscribe: function subscribe(eventName, context, callback) {
				this.getEventDispatcher().subscribe(eventName, context, callback);
			},

			unsubscribe: function unsubscribe(eventName, context, callback) {
				this.getEventDispatcher().unsubscribe(eventName, context, callback);
			}

		},

		prototype: {

			eventDispatcher: null,

			_initApplicationEvents: function _initApplicationEvents() {
				if (!this.hasOwnProperty("eventDispatcher")) {
					this.eventDispatcher = this.constructor.getEventDispatcher();
				}
			},

			_destroyApplicationEvents: function _destroyApplicationEvents() {
				if (this.eventDispatcher) {
					this.eventDispatcher.unsubscribe(this);
				}
			},

			publish: function publish(eventName, data) {
				return this.eventDispatcher.publish(eventName, this, data);
			},

			subscribe: function subscribe(eventName, context, callback) {
				this.eventDispatcher.subscribe(eventName, context, callback);

				return this;
			},

			unsubscribe: function unsubscribe(eventName, context, callback) {
				this.eventDispatcher.unsubscribe(eventName, context, callback);

				return this;
			}

		}

	};

	Beacon.ApplicationEvents = ApplicationEvents;

	return Beacon;

})(window.Beacon || {});

Beacon = (function(Beacon) {

	var _guid = 0;

	var Notifications = {

		self: {

			addNotifications: function addNotifications(newNotifications) {
				var name, notifications = this.prototype.notifications || {};

				for (name in newNotifications) {
					if (newNotifications.hasOwnProperty(name)) {
						if (notifications[name]) {
							notifications[name] = (notifications[name] instanceof Array) ? notifications[name] : [ notifications[name] ];
						}
						else {
							notifications[name] = [];
						}

						notifications[name].push( newNotifications[name] );
					}
				}

				this.prototype.notifications = notifications;
				notifications = newNotifications = null;
			}

		},

		prototype: {

			_notificationDispatcher: null,

			_notificationId: null,

			_notificationIdPrefix: "notifications",

			notifications: null,

			_initNotifications: function _initNotifications() {
				if (!this.__proto__.hasOwnProperty("_compiledNotifications")) {
					this._compileNotifications();
				}

				this._initApplicationEvents();

				this._notificationId = _guid++;

				var name, i, length, notifications;

				for (name in this._compiledNotifications) {
					if (this._compiledNotifications.hasOwnProperty(name)) {
						notifications = this._compiledNotifications[name];

						for (i = 0, length = notifications.length; i < length; i++) {
							this.listen( name, this, notifications[i] );
						}
					}
				}

				this._setUpNotifications();
			},

			_compileNotifications: function _compileNotifications() {
				var _compiledNotifications = {}, name, i, length, notifications, proto = this.__proto__;

				while (proto) {
					if (proto.hasOwnProperty("notifications") && proto.notifications) {
						notifications = proto.notifications;

						for (name in notifications) {
							if (notifications.hasOwnProperty(name)) {
								_compiledNotifications[name] = _compiledNotifications[name] || [];
								notifications[name] = notifications[name] instanceof Array ? notifications[name] : [ notifications[name] ];

								// To keep notifications executing in the order they were defined in the classes,
								// we loop backwards and place the new notifications at the top of the array.
								i = notifications[name].length;
								while (i--) {
									_compiledNotifications[name].unshift( notifications[name][i] );
								}
							}
						}
					}

					proto = proto.__proto__;
				}

				this.__proto__._compiledNotifications = _compiledNotifications;

				proto = notifications = _compiledNotifications = null;
			},

			_destroyNotifications: function _destroyNotifications() {
				if (this._notificationDispatcher) {
					this._notificationDispatcher.destructor();
					this._notificationDispatcher = null;
				}
			},

			_setUpNotifications: function _setUpNotifications() {
				// Child classes may override this to do something special with adding notifications.
			},

			notify: function notify(message, data) {
				var success = this.publish(this._notificationIdPrefix + "." + this._notificationId + "." + message, data);
				data = null;
				return success;
			},

			listen: function listen(message, context, notification) {
				this.subscribe(this._notificationIdPrefix + "." + this._notificationId + "." + message, context, notification);
				context = notification = null;

				return this;
			},

			ignore: function ignore(message, context, notification) {
				this.unsubscribe(this._notificationIdPrefix + "." + this._notificationId + "." + message, context, notification);
				context = notification = null;

				return this;
			}

		}

	};

	Beacon.Notifications = Notifications;

	return Beacon;

})(window.Beacon || {});

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
