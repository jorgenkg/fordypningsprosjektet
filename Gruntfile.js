module.exports = function(grunt) {

    // Project configuration.
    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        
        jshint: {
            files: [ 'Gruntfile.js', "resources/javascript/**/*.js" ],
            options: {
                globals: {
                    jQuery: true
                }
            }
        },
        
        watch: {
          configFiles: {
            files: [ 'Gruntfile.js'],
            options: {
              reload: true
            }
          },
            
          jade: {
            files: [ "resources/jade/**/*.jade" ],
            tasks: [ "jade" ]
          },
          
          scripts: {
            files: ['<%= jshint.files %>'],
            tasks: ['jshint', 'concat:js']
          }
        },

        concat: {
          css: {
            src: ['resources/css/**/*.css'],
            dest: 'resources/libraries/compiled.css'
          },
          js: {
            src: ["resources/javascript/utils/*.js", "resources/javascript/graph/*.js", "resources/javascript/ACO/*.js", "resources/javascript/*.js"],
            dest: 'resources/libraries/packaged.js'
          }
        },
        
        jade: {
          compile: {
            options: {
              pretty: true
            },
            files: [{ "index.html": "resources/jade/index.jade"}]
          }
        },
        
        bower_concat: {
          all: {
              dest: 'resources/libraries/bowerScripts.js',
              cssDest: 'resources/libraries/bowerStyles.css',
              bowerOptions: {
                relative: false
              },
              dependencies: {
                'cytoscape': 'jquery'
              },
              mainFiles: {
              }
            }
        }

    });
    
    grunt.loadNpmTasks('grunt-contrib-jshint');
    grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.loadNpmTasks('grunt-contrib-concat');
    grunt.loadNpmTasks('grunt-contrib-jade');
    grunt.loadNpmTasks('grunt-bower-concat');
    
    
    grunt.registerTask('default', ['jshint', 'concat', "jade"]);
    
    grunt.registerTask('styles', ['concat:css']);

    grunt.registerTask('bower', ['bower_concat']);

};
