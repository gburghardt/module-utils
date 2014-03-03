describe("Module.Utils.Bootstrap", function() {

	var ParentKlass,
	    ChildKlass,
	    Klass;

	beforeEach(function() {
		ParentKlass = function() { this.initialize(); };
		ParentKlass.prototype.initialize = function initialize() {
			this.options = this.constructor.fromCache("options");
		};
		ParentKlass.prototype.destructor = function() {};
		ParentKlass.prototype.init = function() {};
		ParentKlass.prototype.setOptions = function(value) { this.options = value; };
		ParentKlass.include(Module.Utils.PropertyCache);
		ParentKlass.include(Module.Utils.Bootstrap);
		ChildKlass = ParentKlass.extend();
		Klass = ChildKlass.extend();
	});

	it("overrides existing 'destructor' and 'init' methods upon inclusion", function() {
		var TestModule = function() {},
		    init = TestModule.prototype.init = function() {},
		    destructor = TestModule.prototype.destructor = function() {};

		TestModule.include(Module.Utils.Bootstrap);

		expect(TestModule.prototype.init)
			.toBe(Module.Utils.Bootstrap.prototype.init);

		expect(TestModule.prototype.destructor)
			.toBe(Module.Utils.Bootstrap.prototype.destructor);

		expect(TestModule.prototype._originalInit).toBe(init);

		expect(TestModule.prototype._originalDestructor).toBe(destructor);
	});

	it("calls the original 'init' method", function() {
		spyOn(ParentKlass.prototype, "_originalInit");

		var o = new ParentKlass();
		o.init();

		expect(ParentKlass.prototype._originalInit).toHaveBeenCalled();
	});

	it("initializes the callbacks property", function() {
		ParentKlass.prototype.callbacks = {
			foo: [ "a" ]
		};
		ChildKlass.prototype.callbacks = {
			foo: [ "a", "b" ]
		};
		Klass.prototype.callbacks = {
			bar: [ "c" ]
		};

		var o = new Klass();

		o.init();
		expect(o.callbacks instanceof Callbacks).toBe(true);
		expect(o.callbacks.types).toBe(Klass.fromCache("callbacks"));
	});

	it("invokes the 'beforeReady' and 'afterReady' callbacks", function() {
		var callbacks = {
			execute: function() {}
		};

		spyOn(callbacks, "execute");

		var o = new Klass();
		o.callbacks = callbacks;
		o.init();

		expect(callbacks.execute).toHaveBeenCalledWith("beforeReady");
		expect(callbacks.execute).toHaveBeenCalledWith("afterReady");
	});

	it("calls the original 'destructor' method", function() {
		spyOn(ParentKlass.prototype, "_originalDestructor");

		var o = new ParentKlass();
		o.init();
		o.destructor();

		expect(ParentKlass.prototype._originalDestructor).toHaveBeenCalled();
	});

	it("invokes the 'destroy' callback", function() {
		var callbacks = {
			execute: function() {},
			destructor: function() {}
		};

		spyOn(callbacks, "execute");
		spyOn(callbacks, "destructor");

		var o = new Klass();
		o.callbacks = callbacks;
		o.init();
		o.destructor(true);

		expect(callbacks.execute).toHaveBeenCalledWith("destroy", true);
		expect(callbacks.destructor).toHaveBeenCalled();
	});

	it("merges the 'options' property from the prototype chain", function() {
		ParentKlass.prototype.options = {
			foo: [ "a" ]
		};
		ChildKlass.prototype.options = {
			foo: [ "a", "b" ]
		};
		Klass.prototype.options = {
			bar: [ "c" ],
			message: "Foo?"
		};

		var o = new Klass();
		o.init();

		expect(o.options).toEqual({
			foo: ["a", "b"],
			bar: ["c"],
			message: "Foo?"
		});
	});

});