module.exports = function(grunt) {
  var files = grunt.file.readJSON('build/files.json');

  grunt.initConfig({
    pkg: grunt.file.readJSON("package.json"),

    concat: {
      options: {
        banner: "/*! <%= pkg.name %> <%= grunt.template.today(\"yyyy-mm-dd\") %> */\n"
      },
      base: {
        src: files.base,
        dest: "dist/<%= pkg.name %>-base.concat.js"
      },
      element_store: {
        src: files.element_store,
        dest: "dist/<%= pkg.name %>-element_store.concat.js"
      },
      events: {
        src: files.events,
        dest: "dist/<%= pkg.name %>-events.concat.js"
      },
      all: {
        src: [
          "dist/<%= pkg.name %>-base.concat.js",
          "dist/<%= pkg.name %>-element_store.concat.js",
          "dist/<%= pkg.name %>-events.concat.js"
        ],
        dest: "dist/<%= pkg.name %>.concat.js"
      }
    },
    min: {
      base: {
        src: "dist/<%= pkg.name %>-base.concat.js",
        dest: "dist/<%= pkg.name %>-base.min.js"
      },
      element_store: {
        src: "dist/<%= pkg.name %>-element_store.concat.js",
        dest: "dist/<%= pkg.name %>-element_store.min.js"
      },
      events: {
        src: "dist/<%= pkg.name %>-events.concat.js",
        dest: "dist/<%= pkg.name %>-events.min.js"
      },
      all: {
        src: "dist/<%= pkg.name %>.concat.js",
        dest: "dist/<%= pkg.name %>.min.js"
      }
    }
  });

  // Load the plugin that provides the "concat" task.
  grunt.loadNpmTasks('grunt-contrib-concat');

  // Load the plugin that provides the "min" task.
  grunt.loadNpmTasks('grunt-yui-compressor');

  // Default task(s).
  grunt.registerTask('default', ['concat', 'min']);
};