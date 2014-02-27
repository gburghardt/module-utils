describe("Module.Utils.Delegator", function() {

	var ParentKlass,
	    ChildKlass,
	    Klass,
	    delegator;

	beforeEach(function() {
		ParentKlass = function() {};
		ParentKlass.prototype.destructor = function() {};
		ParentKlass.prototype.init = function() {};
		ParentKlass.include(Module.Utils.PropertyCache);
		ParentKlass.include(Module.Utils.Bootstrap);
		ParentKlass.include(Module.Utils.Delegator);

		ChildKlass = ParentKlass.extend();

		Klass = ChildKlass.extend({
			prototype: {
				initialize: function() {
					 this.options = {};
				}
			}
		});

		delegator = new dom.events.Delegator();
		spyOn(delegator, "init");
		spyOn(delegator, "setActionPrefix");
		spyOn(delegator, "setEventActionMapping");
		spyOn(delegator, "destructor");
	});

	it("creates and initializes the DOM event delegator", function() {
		ParentKlass.prototype.actions = {
			click: [ "addItem" ]
		};
		ChildKlass.prototype.actions = {
			click: [ "removeItem" ]
		};
		Klass.prototype.actions = {
			submit: [ "save" ]
		};

		var o = new Klass()

		o.delegator = delegator;
		o.options.actionPrefix = "foo";
		o.init();

		expect(delegator.setEventActionMapping).toHaveBeenCalledWith({
			click: [
				"addItem",
				"removeItem"
			],
			submit: [
				"save"
			]
		});

		expect(delegator.init).toHaveBeenCalled();
		expect(delegator.setActionPrefix).toHaveBeenCalledWith("foo");
	});

	it("destroys the delegator", function() {
		var o = new Klass()

		o.delegator = delegator;
		o.init();
		o.destructor();

		expect(o.delegator).toBe(null);
		expect(delegator.destructor).toHaveBeenCalled();
	});

});