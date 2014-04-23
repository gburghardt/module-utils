describe("Module.Utils.PropertyCache", function() {

	var Klass,
	    ParentKlass,
	    ChildKlass;

	beforeEach(function() {
		ParentKlass = function() {};
		ParentKlass.include(Module.Utils.PropertyCache);
		ChildKlass = function() {};
		ChildKlass.prototype = Object.create(ParentKlass.prototype);
		ChildKlass.include(Module.Utils.PropertyCache);
		Klass = function() {};
		Klass.prototype = Object.create(ChildKlass.prototype);
		Klass.include(Module.Utils.PropertyCache);
	});

	it("Merges object properties", function() {
		ParentKlass.prototype.test = {
			a: 1
		};
		ChildKlass.prototype.test = {
			b: 2,
			c: 8,
			d: 10
		};
		Klass.prototype.test = {
			b: 5,
			foo: false,
			id: null,
			price: NaN
		};

		var value = Klass.fromCache("test", "test");

		expect(value).toBe(Klass.cache.test);
		expect(ChildKlass.cache).toBe(null);
		expect(ParentKlass.cache).toBe(null);
		expect(value).toEqual({
			a: 1,
			b: 5,
			c: 8,
			d: 10,
			foo: false,
			id: null,
			price: NaN
		});
	});

	it("Merges object properties containing array properties", function() {
		ParentKlass.prototype.test = {
			a: [1]
		};
		ChildKlass.prototype.test = {
			a: [9],
			b: [2],
			c: [8],
			d: [10]
		};
		Klass.prototype.test = {
			b: [2,5,4],
			foo: [false],
			id: [null],
			price: [NaN]
		};

		var value = Klass.fromCache("test", "test");

		expect(value).toEqual({
			a: [1,9],
			b: [2,5,4],
			c: [8],
			d: [10],
			foo: [false],
			id: [null],
			price: [NaN]
		});
	});

	it("Merges mixed array and non array properties", function() {
		ParentKlass.prototype.test = {
			a: [1],
			c: "test"
		};
		ChildKlass.prototype.test = {
			a: [9],
			b: "$30.99",
			d: {foo: "test"}
		};
		Klass.prototype.test = {
			c: "abc",
			foo: [false],
			id: null,
			price: NaN
		};

		var value = Klass.fromCache("test", "test");

		expect(value).toEqual({
			a: [1,9],
			b: "$30.99",
			c: "abc",
			d: {foo: "test"},
			foo: [false],
			id: null,
			price: NaN
		});
	});

	it("takes a custom callback", function() {
		var callback = jasmine.createSpy("fromCacheCallback");

		ParentKlass.prototype.test = { a: 1 };
		ChildKlass.prototype.test = { b: 2 };
		Klass.prototype.test = { c: 3 };

		var value = Klass.fromCache("test", "test", callback),
		    calls = callback.calls.all();

		expect(calls[0].object).toBe(window);
		expect(calls[0].args[0]).toBe(value);
		expect(calls[0].args[1]).toBe(Klass.prototype.test);
		expect(calls[0].args[2]).toBe("test");
		expect(calls[0].args[3]).toBe(Klass);

		expect(calls[1].object).toBe(window);
		expect(calls[1].args[0]).toBe(value);
		expect(calls[1].args[1]).toBe(ChildKlass.prototype.test);
		expect(calls[1].args[2]).toBe("test");
		expect(calls[1].args[3]).toBe(Klass);

		expect(calls[2].object).toBe(window);
		expect(calls[2].args[0]).toBe(value);
		expect(calls[2].args[1]).toBe(ParentKlass.prototype.test);
		expect(calls[2].args[2]).toBe("test");
		expect(calls[2].args[3]).toBe(Klass);
	});

	it("takes a custom callback and context", function() {
		var callback = jasmine.createSpy("fromCacheCallback"),
		    context = {};

		ParentKlass.prototype.test = { a: 1 };
		ChildKlass.prototype.test = { b: 2 };
		Klass.prototype.test = { c: 3 };

		var value = Klass.fromCache("test", "test", callback, context),
		    calls = callback.calls.all();

		expect(calls[0].object).toBe(context);
		expect(calls[1].object).toBe(context);
		expect(calls[2].object).toBe(context);
	});

	it("does not invoke the callback after the first time", function() {
		var callback = jasmine.createSpy("fromCacheCallback"),
		    context = {};

		ParentKlass.prototype.test = { a: 1 };
		ChildKlass.prototype.test = { b: 2 };
		Klass.prototype.test = { c: 3 };

		var value = Klass.fromCache("test", "test", callback, context),
		    calls = callback.calls.all(),
		    value2 = Klass.fromCache("test", "test", callback, context);

		expect(calls.length).toBe(3);
		expect(value).toBe(value2);
	});

	it("Invokes the callback only once per class", function() {
		ParentKlass.prototype.test = { a: 1 };
		ChildKlass.prototype.test = { b: 2 };
		Klass.prototype.test = { c: 3 };

		var callback1 = jasmine.createSpy("fromCacheCallback1"),
		    callback2 = jasmine.createSpy("fromCacheCallback2"),
		    value1 = Klass.fromCache("test", "test", callback1),
		    value2 = ChildKlass.fromCache("test", "test", callback2);

		expect(callback1).toHaveBeenCalled();
		expect(callback2).toHaveBeenCalled();
		expect(Klass.cache.test).toBe(value1);
		expect(ChildKlass.cache.test).toBe(value2);
		expect(value1 === value2).toBe(false);
	});

});