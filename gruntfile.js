/**
 * Grunt Tasks
 */
function tasks (grunt)
{
	var	path = require('path')
		,pkg = grunt.file.readJSON('package.json')
		,config = grunt.file.readJSON('config.json')
		,env = grunt.option('env') || 'local'
		;

	var options = {
		hostname: grunt.option('hostname') || config[env].hostname
		,port: grunt.option('port') || config[env].port
		,livereload: grunt.option('livereload') || config[env].livereload
		,remote: grunt.option('remote') || config[env].remote
		,paths: {
			app: path.join( process.cwd(), 'app' )
			,dist: path.join( process.cwd(), 'dist' )
			,root: path.join( process.cwd() )
			,temp: path.join( process.cwd(), '.tmp' )
			,src: path.join( process.cwd(), 'src' )
			,build: path.join( process.cwd(), 'build' )
		}
		,build: grunt.option('buld') || (new Date()).getTime()
		// ,ngConfig: config[env].ngConfig
	}

	require('time-grunt')(grunt);

	require('load-grunt-config')(grunt, {
		configPath: path.join( process.cwd(), 'grunt/config' )
		,init: true
		,data: options
		,mergeFunction: require('recursive-merge')
		,jitGrunt: {
			customTasksDir: path.join( process.cwd(), 'grunt/tasks' )
			,staticMappings: {
				'browserify': 'grunt-browserify',
				'ngannotate': 'grunt-ng-annotate',
				'ngconstant': 'grunt-ng-constant',
				'sass': 'grunt-sass',
				'sprite': 'grunt-spritesmith',
				'useminPrepare': 'grunt-usemin'
			}
		}
	});
}

module.exports = tasks;